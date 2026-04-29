const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const { getUserProfile, suspendUser, unsuspendUser } = require('../controllers/userController');

router.get('/:userId', verifyAdmin, getUserProfile);
router.patch('/:userId/suspend', verifyAdmin, suspendUser);
router.patch('/:userId/unsuspend', verifyAdmin, unsuspendUser);

module.exports = router;
