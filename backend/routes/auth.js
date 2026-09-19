const express = require('express');
const db = require('../db');
const { hashPassword, verifyPassword, signSession, SESSION_COOKIE, authMiddleware } = require('../lib/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'email and a password of at least 8 characters are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'an account with that email already exists' });
  }

  const passwordHash = await hashPassword(password);
  const result = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, passwordHash);

  const token = signSession(result.lastInsertRowid);
  res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
  res.status(201).json({ id: result.lastInsertRowid, email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'invalid email or password' });
  }

  const token = signSession(user.id);
  res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
  res.json({ id: user.id, email });
});

router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax' });
  res.status(204).end();
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  res.json(user);
});

module.exports = router;
