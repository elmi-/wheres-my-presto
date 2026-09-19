const db = require('../db');
const { encrypt, decrypt } = require('../lib/crypto');
const { fetchLastUse, BadCredentialsError } = require('./prestoScraper');
const stations = require('../data/stations.json');

const SYNC_COOLDOWN_MS = 30 * 60 * 1000;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

function canSync(link) {
  if (!link.last_synced_at) return true;
  const last = new Date(link.last_synced_at + 'Z').getTime();
  return Date.now() - last >= SYNC_COOLDOWN_MS;
}

async function syncLink(link) {
  const password = decrypt(link.encrypted_password);
  const update = db.prepare(`
    UPDATE presto_links
    SET status = ?, last_location = ?, last_location_lat = ?, last_location_lng = ?,
        last_used_at = ?, last_synced_at = datetime('now')
    WHERE id = ?
  `);

  try {
    const { station, timestampText } = await fetchLastUse(link.presto_username, password);
    const coords = stations[station] || null;
    update.run(
      'active',
      station,
      coords ? coords.lat : null,
      coords ? coords.lng : null,
      timestampText,
      link.id
    );
  } catch (err) {
    if (err instanceof BadCredentialsError) {
      db.prepare("UPDATE presto_links SET status = 'needs_reauth', last_synced_at = datetime('now') WHERE id = ?").run(link.id);
    } else {
      // Selector/DOM mismatch or transient failure — leave status alone,
      // just record the attempt so the cooldown still applies.
      console.error(`presto sync failed for link ${link.id}:`, err.message);
      db.prepare("UPDATE presto_links SET last_synced_at = datetime('now') WHERE id = ?").run(link.id);
    }
  }
}

async function sweepDueLinks() {
  const links = db.prepare("SELECT * FROM presto_links WHERE status = 'active'").all();
  for (const link of links) {
    if (canSync(link)) {
      await syncLink(link);
    }
  }
}

function start() {
  setInterval(() => {
    sweepDueLinks().catch((err) => console.error('presto sync sweep failed:', err));
  }, SWEEP_INTERVAL_MS);
}

module.exports = { start, canSync, syncLink, SYNC_COOLDOWN_MS };
