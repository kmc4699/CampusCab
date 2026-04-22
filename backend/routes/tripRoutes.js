const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// POST /api/trips
router.post('/', tripController.createTrip);

// GET /api/trips/search?campus=&date=
router.get('/search', tripController.searchTrips);

// GET /api/trips/:id
router.get('/:id', tripController.getTripById);

// DELETE /api/trips/:id
router.delete('/:id', tripController.cancelTrip);

module.exports = router;
