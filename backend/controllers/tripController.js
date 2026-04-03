const { db } = require('../config/firebaseConfig');
// h3-js is used to convert lat/lng coordinates into an H3 geospatial index cell
// const { latLngToCell } = require('h3-js');

/**
 * Firestore Schema — tripListings collection
 * {
 *   tripId: string,
 *   driverId: string,         // reference to users/{userId}
 *   originArea: string,
 *   destinationCampus: string,
 *   departureDate: string,    // ISO date string e.g. "2025-09-01"
 *   departureTime: string,    // e.g. "08:30"
 *   totalSeats: number,
 *   availableSeats: number,
 *   pricePerSeat: number,
 *   tripStatus: string,       // "Open" | "Full" | "Cancelled"
 *   h3Index: string,          // H3 cell index for geospatial search (resolution 8)
 *   // TripPreferences sub-document (from class diagram):
 *   preferences: {
 *     smokingAllowed: boolean,
 *     petsAllowed: boolean,
 *     luggageAllowed: boolean,
 *     pickupNotes: string,
 *     additionalNotes: string,
 *   }
 * }
 */

/**
 * POST /api/trips
 * 1. Verify the requesting user is a Driver
 * 2. Generate h3Index from origin lat/lng using latLngToCell(lat, lng, resolution=8)
 * 3. Write new TripListing document to Firestore with tripStatus = "Open"
 * 4. Return 201 Created with the new tripId
 */
const createTrip = async (req, res) => {
  // TODO: implement createTrip
};

/**
 * GET /api/trips/search?campus=&date=
 * Sequence Diagram — Story 7: Search & Discovery
 * 1. Extract query params: campus, date
 * 2. Query Firestore:
 *    db.collection('tripListings')
 *      .where('destinationCampus', '==', campus)
 *      .where('departureDate', '==', date)
 *      .where('availableSeats', '>', 0)
 * 3. Return the list of matching trip documents as JSON
 */
const searchTrips = async (req, res) => {
  // TODO: implement searchTrips
};

/**
 * GET /api/trips/:id
 * Sequence Diagram — Story 6: View Trip Details
 * 1. Fetch the TripListing document by tripId
 * 2. Optionally fetch the driver's vehicle details
 * 3. Return full trip + vehicle info
 */
const getTripById = async (req, res) => {
  // TODO: implement getTripById
};

/**
 * DELETE /api/trips/:id
 * 1. Verify the requesting user is the trip's driverId
 * 2. Update tripStatus to "Cancelled" in Firestore
 */
const cancelTrip = async (req, res) => {
  // TODO: implement cancelTrip
};

module.exports = { createTrip, searchTrips, getTripById, cancelTrip };
