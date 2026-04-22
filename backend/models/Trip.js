// backend/models/Trip.js

class Trip {
    /**
     * @param {string} tripId 
     * @param {string} originCampus 
     * @param {string} destinationCampus 
     * @param {string} departureDate 
     * @param {number} availableSeats 
     */
    constructor(tripId, originCampus, destinationCampus, departureDate, availableSeats) {
        this.tripId = tripId;
        this.originCampus = originCampus;
        this.destinationCampus = destinationCampus;
        this.departureDate = new Date(departureDate);
        this.availableSeats = availableSeats;
    }
}

module.exports = Trip;