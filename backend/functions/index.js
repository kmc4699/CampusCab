const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

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
