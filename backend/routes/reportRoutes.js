const express = require('express');
const router = express.Router();
const { getReportedUsers, getUserReports, updateReportStatus } = require('../controllers/reportController');

router.get('/', getReportedUsers);
router.get('/:userId', getUserReports);
router.patch('/:reportId/status', updateReportStatus);

module.exports = router;
