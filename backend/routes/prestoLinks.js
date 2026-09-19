const express = require('express');
const db = require('../db');
const { encrypt } = require('../lib/crypto');
const { authMiddleware } = require('../lib/auth');
const { fetchLastUse, BadCredentialsError, ScraperError } = require('../scraper/prestoScraper');
const { syncLink, canSync, SYNC_COOLDOWN_MS } = require('../scraper/syncManager');
const stations = require('../data/stations.json');

const router = express.Router();
router.use(authMiddleware);

function serializeLink(link) {
  if (!link) return null;
  return {
    id: link.id,
    prestoUsername: link.presto_username,
    status: link.status,
    lastLocation: link.last_location
      ? {
          name: link.last_location,
          lat: link.last_location_lat,
          lng: link.last_location_lng,
          timestamp: link.last_used_at,
        }
      : null,
    lastSyncedAt: link.last_synced_at,
    createdAt: link.created_at,
  };
}

router.post('/', async (req, res) => {
  const { prestoUsername, prestoPassword } = req.body || {};
  if (!prestoUsername || !prestoPassword) {
    return res.status(400).json({ error: 'prestoUsername and prestoPassword are required' });
  }

  const existing = db.prepare('SELECT id FROM presto_links WHERE user_id = ?').get(req.userId);
  if (existing) {
    return res.status(409).json({ error: 'a Presto account is already linked — unlink it first' });
  }

  let result;
  try {
    result = await fetchLastUse(prestoUsername, prestoPassword);
  } catch (err) {
    if (err instanceof BadCredentialsError) {
      return res.status(401).json({ error: 'Presto rejected those credentials' });
    }
    if (err instanceof ScraperError) {
      return res.status(502).json({ error: 'could not reach or read prestocard.ca right now' });
    }
    throw err;
  }

  const coords = stations[result.station] || null;
  const encryptedPassword = encrypt(prestoPassword);
  const insert = db.prepare(`
    INSERT INTO presto_links
      (user_id, presto_username, encrypted_password, status, last_location, last_location_lat, last_location_lng, last_used_at, last_synced_at)
    VALUES (?, ?, ?, 'active', ?, ?, ?, ?, datetime('now'))
  `);
  const inserted = insert.run(
    req.userId,
    prestoUsername,
    encryptedPassword,
    result.station,
    coords ? coords.lat : null,
    coords ? coords.lng : null,
    result.timestampText
  );

  const link = db.prepare('SELECT * FROM presto_links WHERE id = ?').get(inserted.lastInsertRowid);
  res.status(201).json(serializeLink(link));
});

router.get('/me', (req, res) => {
  const link = db.prepare('SELECT * FROM presto_links WHERE user_id = ?').get(req.userId);
  res.json(serializeLink(link));
});

router.delete('/:id', (req, res) => {
  const link = db.prepare('SELECT * FROM presto_links WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!link) {
    return res.status(404).json({ error: 'linked account not found' });
  }
  db.prepare('DELETE FROM presto_links WHERE id = ?').run(link.id);
  res.status(204).end();
});

router.post('/:id/sync', async (req, res) => {
  const link = db.prepare('SELECT * FROM presto_links WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!link) {
    return res.status(404).json({ error: 'linked account not found' });
  }
  if (!canSync(link)) {
    return res.status(429).json({ error: `please wait before syncing again (cooldown: ${SYNC_COOLDOWN_MS / 60000} min)` });
  }

  await syncLink(link);
  const updated = db.prepare('SELECT * FROM presto_links WHERE id = ?').get(link.id);
  res.json(serializeLink(updated));
});

module.exports = router;
