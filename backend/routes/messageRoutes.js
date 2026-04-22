const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// POST /api/messages
router.post('/', messageController.sendMessage);

// GET /api/messages/:tripId
router.get('/:tripId', messageController.getMessages);

module.exports = router;
