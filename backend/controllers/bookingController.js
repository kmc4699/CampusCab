const { admin, db } = require('../config/firebaseConfig');

const RIDE_REQUEST_STATUS = {
  pending: 'pending',
  approved: 'approved',
  declined: 'declined',
  cancelled: 'cancelled',
};

const TRIP_STATUS = {
  active: 'active',
  full: 'full',
};

const getNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRequestUserId = (req) =>
  req.body.userId || req.body.passengerId || req.body.driverId || req.headers['x-user-id'];

const createDriverNotification = (transaction, requestRef, tripData, requestData) => {
  const notificationRef = db.collection('notifications').doc();

  transaction.set(notificationRef, {
    type: 'ride_request',
    recipientId: tripData.driverId,
    tripId: requestData.tripId,
    requestId: requestRef.id,
    passengerId: requestData.passengerId,
    passengerName: requestData.passengerName || 'Passenger',
    passengerEmail: requestData.passengerEmail || '',
    seatsRequested: requestData.seatsRequested,
    status: 'unread',
    message: `${requestData.passengerName || 'A passenger'} requested ${requestData.seatsRequested} seat(s).`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

const createPassengerDeclineNotification = (transaction, requestRef, requestData) => {
  const notificationRef = db.collection('notifications').doc();

  transaction.set(notificationRef, {
    type: 'ride_request_declined',
    recipientId: requestData.passengerId,
    tripId: requestData.tripId,
    requestId: requestRef.id,
    driverId: requestData.tripOwnerId,
    passengerId: requestData.passengerId,
    status: 'unread',
    message: 'Your ride request was declined by the driver.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * POST /api/bookings
 * Creates a pending ride request and a dashboard notification for the trip's driver.
 */
const requestToJoin = async (req, res) => {
  const {
    tripId,
    passengerId,
    passengerName = 'Passenger',
    passengerEmail = '',
    seatsRequested = 1,
    note = '',
  } = req.body;

  if (!tripId || !passengerId) {
    return res.status(400).json({ error: 'tripId and passengerId are required.' });
  }

  const requestedSeats = getNumber(seatsRequested, 1);
  if (!Number.isInteger(requestedSeats) || requestedSeats < 1) {
    return res.status(400).json({ error: 'seatsRequested must be a positive integer.' });
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const tripRef = db.collection('trips').doc(tripId);
      const tripSnap = await transaction.get(tripRef);

      if (!tripSnap.exists) {
        throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
      }

      const tripData = tripSnap.data();
      const currentSeats = getNumber(tripData.availableSeats, tripData.seats);

      if (tripData.status === TRIP_STATUS.full || currentSeats < requestedSeats) {
        throw Object.assign(new Error('Not enough seats available for this trip.'), { statusCode: 409 });
      }

      const requestRef = db.collection('rideRequests').doc();
      const requestData = {
        tripId,
        tripOwnerId: tripData.driverId,
        passengerId,
        passengerName,
        passengerEmail,
        seatsRequested: requestedSeats,
        note,
        status: RIDE_REQUEST_STATUS.pending,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(requestRef, requestData);
      createDriverNotification(transaction, requestRef, tripData, requestData);

      return { requestId: requestRef.id };
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

/**
 * PUT /api/bookings/:id/approve
 * Approves a pending request and deducts the requested seats atomically.
 */
const approveRequest = async (req, res) => {
  const driverId = getRequestUserId(req);

  if (!driverId) {
    return res.status(400).json({ error: 'driverId or x-user-id is required.' });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const requestRef = db.collection('rideRequests').doc(req.params.id);
      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists) {
        throw Object.assign(new Error('Request not found.'), { statusCode: 404 });
      }

      const requestData = requestSnap.data();
      if (requestData.tripOwnerId !== driverId) {
        throw Object.assign(new Error('Only the trip driver can approve this request.'), { statusCode: 403 });
      }

      if ((requestData.status || '').toLowerCase() !== RIDE_REQUEST_STATUS.pending) {
        throw Object.assign(new Error('This request has already been processed.'), { statusCode: 409 });
      }

      const tripRef = db.collection('trips').doc(requestData.tripId);
      const tripSnap = await transaction.get(tripRef);

      if (!tripSnap.exists) {
        throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
      }

      const tripData = tripSnap.data();
      const requestedSeats = getNumber(requestData.seatsRequested, 1);
      const currentSeats = getNumber(tripData.availableSeats, tripData.seats);

      if (currentSeats < requestedSeats) {
        throw Object.assign(
          new Error(`Not enough seats available. (Requested: ${requestedSeats}, Available: ${currentSeats})`),
          { statusCode: 409 },
        );
      }

      const nextSeats = currentSeats - requestedSeats;

      transaction.update(requestRef, {
        status: RIDE_REQUEST_STATUS.approved,
        decidedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(tripRef, {
        availableSeats: nextSeats,
        status: nextSeats === 0 ? TRIP_STATUS.full : tripData.status || TRIP_STATUS.active,
      });
    });

    return res.json({ status: RIDE_REQUEST_STATUS.approved });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

/**
 * PUT /api/bookings/:id/decline
 * Declines a pending request owned by the current driver.
 */
const declineRequest = async (req, res) => {
  const driverId = getRequestUserId(req);

  if (!driverId) {
    return res.status(400).json({ error: 'driverId or x-user-id is required.' });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const requestRef = db.collection('rideRequests').doc(req.params.id);
      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists) {
        throw Object.assign(new Error('Request not found.'), { statusCode: 404 });
      }

      const requestData = requestSnap.data();
      if (requestData.tripOwnerId !== driverId) {
        throw Object.assign(new Error('Only the trip driver can decline this request.'), { statusCode: 403 });
      }

      if ((requestData.status || '').toLowerCase() !== RIDE_REQUEST_STATUS.pending) {
        throw Object.assign(new Error('This request has already been processed.'), { statusCode: 409 });
      }

      transaction.update(requestRef, {
        status: RIDE_REQUEST_STATUS.declined,
        decidedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      createPassengerDeclineNotification(transaction, requestRef, requestData);
    });

    return res.json({ status: RIDE_REQUEST_STATUS.declined });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

/**
 * DELETE /api/bookings/:id
 * Cancels a pending request owned by the current passenger.
 */
const cancelRequest = async (req, res) => {
  const passengerId = getRequestUserId(req);

  if (!passengerId) {
    return res.status(400).json({ error: 'passengerId or x-user-id is required.' });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const requestRef = db.collection('rideRequests').doc(req.params.id);
      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists) {
        throw Object.assign(new Error('Request not found.'), { statusCode: 404 });
      }

      const requestData = requestSnap.data();
      if (requestData.passengerId !== passengerId) {
        throw Object.assign(new Error('Only the requesting passenger can cancel this request.'), { statusCode: 403 });
      }

      if ((requestData.status || '').toLowerCase() !== RIDE_REQUEST_STATUS.pending) {
        throw Object.assign(new Error('Only pending requests can be cancelled.'), { statusCode: 409 });
      }

      transaction.update(requestRef, {
        status: RIDE_REQUEST_STATUS.cancelled,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({ status: RIDE_REQUEST_STATUS.cancelled });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = { requestToJoin, approveRequest, declineRequest, cancelRequest };
