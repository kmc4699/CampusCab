const { db } = require('../config/firebaseConfig');

/**
 * Firestore Schema — reports collection
 * {
 *   reportedUserId: string,
 *   reportedUserName: string,
 *   reporterId: string,
 *   violationType: string,   // "Hate Speech" | "Inappropriate Content" | "Spam" | "Harassment" | "Other"
 *   reason: string,
 *   status: string,          // "New" | "In-Progress" | "Resolved"
 *   createdAt: Timestamp,
 * }
 */

// GET /api/admin/reports
// Returns all reported users aggregated: userId, violationTypes, reportCount, status, isHighPriority
const getReportedUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();

    const grouped = {};
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      const uid = data.reportedUserId;

      if (!grouped[uid]) {
        grouped[uid] = {
          reportedUserId: uid,
          reportedUserName: data.reportedUserName || uid,
          reports: [],
          recentCount: 0,
          status: 'New',
        };
      }

      grouped[uid].reports.push(data);

      const reportTime = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
      if (now - reportTime < twentyFourHours) {
        grouped[uid].recentCount += 1;
      }

      // Escalate status: Resolved < In-Progress < New (keep highest priority)
      const statusPriority = { New: 2, 'In-Progress': 1, Resolved: 0 };
      if ((statusPriority[data.status] ?? 0) > (statusPriority[grouped[uid].status] ?? 0)) {
        grouped[uid].status = data.status;
      }
    });

    const result = Object.values(grouped).map((user) => {
      const violationCounts = {};
      user.reports.forEach((r) => {
        violationCounts[r.violationType] = (violationCounts[r.violationType] || 0) + 1;
      });
      const topViolation = Object.entries(violationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

      return {
        reportedUserId: user.reportedUserId,
        reportedUserName: user.reportedUserName,
        topViolationType: topViolation,
        reportCount: user.reports.length,
        isHighPriority: user.recentCount > 5,
        status: user.status,
      };
    });

    // High priority first
    result.sort((a, b) => b.isHighPriority - a.isHighPriority || b.reportCount - a.reportCount);

    res.json(result);
  } catch (err) {
    console.error('getReportedUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// GET /api/admin/reports/:userId
// Returns all individual reports for a specific user
const getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db
      .collection('reports')
      .where('reportedUserId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(reports);
  } catch (err) {
    console.error('getUserReports error:', err);
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
};

// PATCH /api/admin/reports/:reportId/status
// Update a report's status
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const valid = ['New', 'In-Progress', 'Resolved'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.collection('reports').doc(reportId).update({ status });
    res.json({ success: true });
  } catch (err) {
    console.error('updateReportStatus error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

module.exports = { getReportedUsers, getUserReports, updateReportStatus };
