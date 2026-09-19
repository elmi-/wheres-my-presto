const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set (see .env.example)');
}

const SESSION_COOKIE = 'session';
const SESSION_TTL = '7d';

function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signSession(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: SESSION_TTL });
}

function authMiddleware(req, res, next) {
  const token = req.cookies && req.cookies[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'not authenticated' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid or expired session' });
  }
}

module.exports = {
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  signSession,
  authMiddleware,
};
