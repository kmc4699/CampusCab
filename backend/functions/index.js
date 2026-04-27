const functions = require('firebase-functions');
const h3 = require('h3-js'); 

/**
 * Convert Lat/Long to an H3 index (Resolution 8) for future geospatial trip search.
 * 
 * @param {number} lat - Trip starting latitude
 * @param {number} lng - Trip starting longitude
 * @returns {string|null} H3 index string at resolution 8
 */
function generateH3IndexForTrip(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return h3.latLngToCell(lat, lng, 8);
}

// Planned Cloud Function hook for the direct Firestore trips collection.
exports.onTripCreated = functions.firestore
  .document('trips/{tripId}')
  .onCreate(async (snap, context) => {
    // const tripData = snap.data();
    // const h3Index = generateH3IndexForTrip(tripData.lat, tripData.lng);
    // return snap.ref.update({ h3Index });
    
    return null;
  });

module.exports.generateH3IndexForTrip = generateH3IndexForTrip;
