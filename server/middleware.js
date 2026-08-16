const jwt = require('jsonwebtoken');

// DARBAN 1: token asli hai? (sabhi logged-in users ke liye)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role } - token ke andar ki info
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// DARBAN 2: sirf ADMIN? (requireAuth ke BAAD lagega)
function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };