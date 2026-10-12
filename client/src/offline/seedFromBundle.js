// Seeds IndexedDB from the static bundled JSON in /data/*.json — no server
// needed. This is what fills the map, guides and transport screens inside
// the installed APK on first open. Idempotent + versioned: re-runs only when
// the bundle version changes (old user data like bookmarks is never touched).
import { db } from './db';
import { DATA_VERSION } from '../data/essential';

const TABLES = [
  ['locations', 'locations.json'],
  ['guides', 'guides.json'],
  ['transport_routes', 'transport-routes.json'],
];

export async function seedFromBundle() {
  try {
    const stamp = await db.table('packages').get('bundle-static').catch(() => null);
    if (stamp && stamp.version === DATA_VERSION) {
      const n = await db.table('locations').count().catch(() => 0);
      if (n > 0) return { fresh: false, version: DATA_VERSION };
    }
    for (const [table, file] of TABLES) {
      const res = await fetch(`/data/${file}`);
      if (!res.ok) throw new Error(`bundle ${file} missing (${res.status})`);
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        await db.table(table).clear();
        await db.table(table).bulkPut(rows);
      }
    }
    await db.table('packages').put({
      id: 'bundle-static', scope: 'bundled', status: 'complete',
      version: DATA_VERSION, name_en: 'Bundled directory (locations, guides, routes)',
      downloaded_at: new Date().toISOString(),
    });
    return { fresh: true, version: DATA_VERSION };
  } catch (e) {
    console.warn('Bundle seed skipped:', e.message);
    return { fresh: false, version: DATA_VERSION, error: String(e.message || e) };
  }
}
