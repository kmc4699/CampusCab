const { db } = require('../config/firebaseConfig');
const Trip = require('../models/Trip'); // Import the model you just created

/**
 * GET /api/trips/search?campus=&date=
 * Fulfills Story 7: Search & Discovery
 */
const searchTrips = async (req, res) => {
    try {
        // 1. Extract query params
        const { campus, date } = req.query;

        // Validation: Ensure both params are provided
        if (!campus || !date) {
            return res.status(400).json({ error: "Campus and Date are required." });
        }

        // 2. Query Firestore
        const tripsRef = db.collection('tripListings');
        const snapshot = await tripsRef
            .where('destinationCampus', '==', campus)
            .where('departureDate', '==', date)
            .where('availableSeats', '>', 0)
            .where('tripStatus', '==', 'Open')
            .get();

        // 3. Handle "No rides available" (Acceptance Test 2)
        if (snapshot.empty) {
            return res.status(200).json({ 
                message: "No rides available", 
                trips: [] 
            });
        }

        // 4. Map results to your Trip model (Acceptance Test 1)
        // This ensures ONLY matching trips to the selected campus are returned
        const results = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            results.push(new Trip(
                doc.id,
                data.originArea,
                data.destinationCampus,
                data.departureDate,
                data.availableSeats
            ));
        });

        res.status(200).json(results);

    } catch (error) {
        console.error("Error searching trips:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Keep your other exports...
module.exports = { createTrip, searchTrips, getTripById, cancelTrip };