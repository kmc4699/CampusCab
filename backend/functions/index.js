const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const RIDE_REQUEST_STATUS = {
  approved: 'approved',
  cancelled: 'cancelled',
};

const TRIP_STATUS = {
  active: 'active',
  full: 'full',
};

const getPositiveInteger = (value, fallback = 1) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getNonNegativeInteger = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

exports.onRideRequestCreated = functions.firestore
  .document('rideRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    const driverId = requestData.tripOwnerId;

    if (!driverId) {
      functions.logger.warn('Ride request has no tripOwnerId; skipping push notification.', {
        requestId: context.params.requestId,
      });
      return null;
    }

    const tokensSnapshot = await db
      .collection('pushTokens')
      .where('userId', '==', driverId)
      .where('role', '==', 'driver')
      .get();

    const tokenDocs = tokensSnapshot.docs
      .map((tokenDoc) => ({
        ref: tokenDoc.ref,
        token: tokenDoc.data().token,
      }))
      .filter((tokenDoc) => Boolean(tokenDoc.token));
    const tokens = tokenDocs.map((tokenDoc) => tokenDoc.token);

    if (tokens.length === 0) {
      functions.logger.info('No driver push tokens found for ride request.', {
        driverId,
        requestId: context.params.requestId,
      });
      return null;
    }

    const seatsRequested = requestData.seatsRequested || 1;
    const passengerName = requestData.passengerName || 'A passenger';

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: 'New ride request',
        body: `${passengerName} requested ${seatsRequested} seat(s).`,
      },
      data: {
        type: 'ride_request',
        requestId: context.params.requestId,
        tripId: requestData.tripId || '',
        url: '/',
        body: `${passengerName} requested ${seatsRequested} seat(s).`,
      },
      webpush: {
        fcmOptions: {
          link: '/',
        },
      },
    });

    functions.logger.info('Ride request push notification sent.', {
      driverId,
      requestId: context.params.requestId,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    const staleTokenDeletes = response.responses
      .map((result, index) => {
        const errorCode = result.error?.code;
        const isStaleToken =
          errorCode === 'messaging/registration-token-not-registered' ||
          errorCode === 'messaging/invalid-registration-token';

        return isStaleToken ? tokenDocs[index].ref.delete() : null;
      })
      .filter(Boolean);

    if (staleTokenDeletes.length > 0) {
      await Promise.all(staleTokenDeletes);
      functions.logger.info('Deleted stale driver push tokens.', {
        driverId,
        requestId: context.params.requestId,
        deletedCount: staleTokenDeletes.length,
      });
    }

    return null;
  });

exports.onApprovedRideRequestCancelled = functions.firestore
  .document('rideRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const previousStatus = (beforeData.status || '').toLowerCase();
    const nextStatus = (afterData.status || '').toLowerCase();

    if (
      previousStatus !== RIDE_REQUEST_STATUS.approved ||
      nextStatus !== RIDE_REQUEST_STATUS.cancelled
    ) {
      return null;
    }

    if (!afterData.tripId) {
      functions.logger.warn('Cancelled approved ride request has no tripId; skipping seat restore.', {
        requestId: context.params.requestId,
      });
      return null;
    }

    const restoreResult = await db.runTransaction(async (transaction) => {
      const tripRef = db.collection('trips').doc(afterData.tripId);
      const tripSnap = await transaction.get(tripRef);
      if (!tripSnap.exists) {
        functions.logger.warn('Cancelled approved ride request points to a missing trip; skipping seat restore.', {
          requestId: context.params.requestId,
          tripId: afterData.tripId,
        });
        return null;
      }

      const tripData = tripSnap.data();
      const seatsRequested = getPositiveInteger(afterData.seatsRequested, 1);
      const totalSeats = getPositiveInteger(tripData.seats, seatsRequested);
      const currentSeats = getNonNegativeInteger(tripData.availableSeats, totalSeats);
      const nextSeats = Math.min(currentSeats + seatsRequested, totalSeats);
      const tripUpdate = {
        availableSeats: nextSeats,
      };

      if (tripData.status === TRIP_STATUS.full && nextSeats > 0) {
        tripUpdate.status = TRIP_STATUS.active;
      }

      transaction.update(tripRef, tripUpdate);
      return {
        seatsRequested,
        restoredSeats: nextSeats - currentSeats,
      };
    });

    if (!restoreResult) {
      return null;
    }

    functions.logger.info('Restored seats after approved ride request cancellation.', {
      requestId: context.params.requestId,
      tripId: afterData.tripId,
      seatsRequested: restoreResult.seatsRequested,
      restoredSeats: restoreResult.restoredSeats,
    });

    return null;
  });
