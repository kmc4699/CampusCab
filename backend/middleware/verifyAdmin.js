const { auth, db } = require('../config/firebaseConfig');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.adminId = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
};

module.exports = verifyAdmin;
