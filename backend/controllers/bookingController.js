const { db } = require('../config/firebaseConfig');

const sendPlannedApiResponse = (res, action) =>
  res.status(501).json({
    error: `${action} is planned for the Express API but is not part of the active direct Firestore flow yet.`,
  });

/**
 * Firestore Schema — rideRequests collection
 * {
 *   requestId: string,
 *   tripId: string,           // reference to trips/{tripId}
 *   passengerId: string,      // reference to users/{userId}
 *   requestDate: string,      // ISO timestamp
 *   seatsRequested: number,
 *   status: string,           // "pending" | "approved" | "declined"
 *   pickupLocation: string,
 *   note: string,
 * }
 */

/**
 * POST /api/bookings
 * Sequence Diagram — Story 9: The Request
 * 1. Verify the requesting user is a Passenger
 * 2. Create a new RideRequest document in Firestore with status = "pending"
 * 3. Trigger a notification to the driver (push/real-time — to be implemented)
 * 4. Return 201 Created with the new requestId
 */
const requestToJoin = async (req, res) => {
  return sendPlannedApiResponse(res, 'Booking requests');
};

/**
 * PUT /api/bookings/:id/approve
 * Sequence Diagram — Story 11 & 12: Approval & Automation (CRITICAL)
 * Uses a Firestore Atomic Transaction to prevent race conditions.
 *
 * Transaction steps:
 * 1. Read the RideRequest document by requestId
 * 2. Read the associated Trip document
 * 3. Check that trip.availableSeats > 0 — abort if not
 * 4. Update RideRequest.status to "approved"
 * 5. Decrement Trip.availableSeats by 1
 * 6. If availableSeats reaches 0, update Trip.status to "full"
 * 7. Commit the transaction
 *
 * Example:
 * await db.runTransaction(async (transaction) => {
 *   const requestRef = db.collection('rideRequests').doc(requestId);
 *   const requestSnap = await transaction.get(requestRef);
 *   const tripRef = db.collection('trips').doc(requestSnap.data().tripId);
 *   const tripSnap = await transaction.get(tripRef);
 *   if (tripSnap.data().availableSeats <= 0) throw new Error('No seats available');
 *   transaction.update(requestRef, { status: 'approved' });
 *   transaction.update(tripRef, { availableSeats: tripSnap.data().availableSeats - 1 });
 * });
 */
const approveRequest = async (req, res) => {
  return sendPlannedApiResponse(res, 'Booking approval');
};

/**
 * PUT /api/bookings/:id/decline
 * 1. Verify the requesting user is the trip's driver
 * 2. Update RideRequest.status to "declined"
 */
const declineRequest = async (req, res) => {
  return sendPlannedApiResponse(res, 'Booking decline');
};

/**
 * DELETE /api/bookings/:id
 * 1. Verify the requesting user is the passenger who made the request
 * 2. Update RideRequest.status to "cancelled" (or delete document)
 */
const cancelRequest = async (req, res) => {
  return sendPlannedApiResponse(res, 'Booking cancellation');
};

module.exports = { requestToJoin, approveRequest, declineRequest, cancelRequest };
