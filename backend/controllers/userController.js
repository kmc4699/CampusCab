const { db, auth } = require('../config/firebaseConfig');

// GET /api/admin/users/:userId
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// PATCH /api/admin/users/:userId/suspend
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    if (!reason || !duration) {
      return res.status(400).json({ error: 'reason and duration are required' });
    }

    await db.collection('users').doc(userId).update({
      accountStatus: 'Suspended',
      suspensionReason: reason,
      suspensionDuration: duration,
      suspendedAt: new Date().toISOString(),
      suspendedBy: req.adminId,
    });

    // Revoke all existing sessions for the suspended user
    await auth.revokeRefreshTokens(userId);

    // Write audit log
    await db.collection('auditLogs').add({
      adminId: req.adminId,
      targetUserId: userId,
      action: 'SUSPEND',
      reason,
      duration,
      timestamp: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('suspendUser error:', err);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
};

// PATCH /api/admin/users/:userId/unsuspend
const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.collection('users').doc(userId).update({
      accountStatus: 'Active',
      suspensionReason: null,
      suspensionDuration: null,
      suspendedAt: null,
      suspendedBy: null,
    });

    // Write audit log
    await db.collection('auditLogs').add({
      adminId: req.adminId,
      targetUserId: userId,
      action: 'UNSUSPEND',
      reason: 'Manual reinstatement by admin',
      duration: null,
      timestamp: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('unsuspendUser error:', err);
    res.status(500).json({ error: 'Failed to unsuspend user' });
  }
};

module.exports = { getUserProfile, suspendUser, unsuspendUser };
