const functions = require('firebase-functions');
// TODO: Import h3-js
const h3 = require('h3-js'); 

/**
 * TODO: Provide an empty function signature generateH3IndexForTrip that will eventually convert Lat/Long to an H3 index (Resolution 8) and update the Firestore document.
 * 
 * @param {number} lat - Trip starting latitude
 * @param {number} lng - Trip starting longitude
 * @returns {string|null} H3 index string at resolution 8
 */
function generateH3IndexForTrip(lat, lng) {
  // TODO: convert Lat/Long to an H3 index (Resolution 8) using h3.latLngToCell(lat, lng, 8)
  return null;
}

// TODO: A Firebase Cloud Function (onCreate trigger) for the trips collection.
exports.onTripCreated = functions.firestore
  .document('trips/{tripId}')
  .onCreate(async (snap, context) => {
    // TODO: A Firebase Cloud Function (onCreate trigger) for the trips collection.
    
    // const tripData = snap.data();
    // const h3Index = generateH3IndexForTrip(tripData.lat, tripData.lng);
    
    // TODO: Update the created Firestore document with the computed h3Index
    // return snap.ref.update({ h3Index });
    
    return null;
  });
