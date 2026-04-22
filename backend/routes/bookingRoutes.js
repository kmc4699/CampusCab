const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings
router.post('/', bookingController.requestToJoin);

// PUT /api/bookings/:id/approve
router.put('/:id/approve', bookingController.approveRequest);

// PUT /api/bookings/:id/decline
router.put('/:id/decline', bookingController.declineRequest);

// DELETE /api/bookings/:id
router.delete('/:id', bookingController.cancelRequest);

module.exports = router;
