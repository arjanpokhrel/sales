import Dexie from 'dexie';
import { PROVINCES } from '../data/provinces';
import { DESTINATIONS } from '../data/destinations';
import { EMERGENCY_NUMBERS, DATA_VERSION } from '../data/essential';

export class NepaReadyDatabase extends Dexie {
  constructor() {
    super('NepaReady_Offline_DB');
    this.version(1).stores({
      locations: 'id, category_id, region, verification_status, name_en',
      emergency_services: 'id, priority, category',
      guides: 'id, slug, category_id',
      transport_routes: 'id, region, route_number',
      offline_packs: 'id, region, status, version',
      saved_places: 'id, label',
      personal_contacts: 'id, name',
      sync_queue: 'id, type, createdAt'
    });
    // v2: provinces, destinations, bookmarks, recents, package registry.
    // Adds tables only — v1 data is preserved (no deletes in upgrade).
    this.version(2).stores({
      locations: 'id, category_id, region, verification_status, name_en',
      emergency_services: 'id, priority, category',
      guides: 'id, slug, category_id',
      transport_routes: 'id, region, route_number',
      offline_packs: 'id, region, status, version',
      saved_places: 'id, label',
      personal_contacts: 'id, name',
      sync_queue: 'id, type, createdAt',
      provinces: 'id',
      destinations: 'id, category, province',
      bookmarks: 'id, kind, createdAt',
      recents: 'id, viewedAt',
      packages: 'id, scope, status'
    });

    // v3: custom offline dropped pins & field notes
    this.version(3).stores({
      locations: 'id, category_id, region, verification_status, name_en',
      emergency_services: 'id, priority, category',
      guides: 'id, slug, category_id',
      transport_routes: 'id, region, route_number',
      offline_packs: 'id, region, status, version',
      saved_places: 'id, label',
      personal_contacts: 'id, name',
      sync_queue: 'id, type, createdAt',
      provinces: 'id',
      destinations: 'id, category, province',
      bookmarks: 'id, kind, createdAt',
      recents: 'id, viewedAt',
      packages: 'id, scope, status',
      custom_pins: 'id, createdAt'
    });
  }
}

export const db = new NepaReadyDatabase();

/**
 * Seeds the essential bundled dataset into IndexedDB on first launch.
 * Idempotent: re-running only fills tables that are still empty, and stamps
 * the data version so future migrations can detect stale seeds.
 */
export async function seedEssential() {
  const meta = await db.table('packages').get('essential-core').catch(() => null);
  if (meta && meta.version === DATA_VERSION) {
    const n = await db.table('destinations').count().catch(() => 1);
    if (n > 0) return { fresh: false, version: DATA_VERSION };
  }
  await db.transaction('rw', [
    db.table('provinces'), db.table('destinations'),
    db.table('emergency_services'), db.table('packages')
  ], async () => {
    if ((await db.table('provinces').count()) === 0) {
      await db.table('provinces').bulkPut(PROVINCES.map((p) => ({ ...p })));
    }
    if ((await db.table('destinations').count()) === 0) {
      await db.table('destinations').bulkPut(DESTINATIONS.map((d) => ({ ...d })));
    }
    if ((await db.table('emergency_services').count()) === 0) {
      await db.table('emergency_services').bulkPut(
        EMERGENCY_NUMBERS.map((e, i) => ({
          id: e.id, number: e.number, name_en: e.name_en, name_ne: e.name_ne,
          category: 'emergency', priority: i + 1, scope: e.scope, official: true,
          verification_status: 'verified_official', last_verified: '2026-10-11'
        }))
      );
    }
    await db.table('packages').put({
      id: 'essential-core', scope: 'bundled', status: 'complete',
      version: DATA_VERSION, name_en: 'Essential Nepal Pack (bundled)',
      name_ne: 'आधारभूत नेपाल प्याक', downloaded_at: new Date().toISOString()
    });
  });
  return { fresh: true, version: DATA_VERSION };
}

/**
 * Bookmarks: user-saved places, stored locally only. kind is
 * 'destination' | 'location' | 'custom'. Never synced anywhere.
 */
export async function toggleBookmark(item) {
  const existing = await db.table('bookmarks').get(item.id).catch(() => null);
  if (existing) {
    await db.table('bookmarks').delete(item.id);
    return false;
  }
  await db.table('bookmarks').put({ ...item, createdAt: Date.now() });
  return true;
}

export async function getBookmarks() {
  return db.table('bookmarks').orderBy('createdAt').reverse().toArray();
}

/** Recently viewed places (cap 30, newest first). Local only. */
export async function pushRecent(item) {
  await db.table('recents').put({ ...item, viewedAt: Date.now() });
  const all = await db.table('recents').orderBy('viewedAt').reverse().toArray();
  if (all.length > 30) {
    await db.table('recents').bulkDelete(all.slice(30).map((r) => r.id));
  }
}

export async function getRecents() {
  return db.table('recents').orderBy('viewedAt').reverse().toArray();
}

/** Haversine straight-line distance in km. Labelled "approximate" in UI. */
export function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const a = s1 * s1 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
/**
 * Downloads and persists a full regional offline pack into IndexedDB
 * @param {string} packId e.g. 'biratnagar-koshi'
 * @param {function} onProgress callback with { percent, loadedMb, totalMb }
 */
export async function downloadPackBundle(packId, onProgress = () => {}) {
  // Step 1: Initial progress simulation for network buffer
  onProgress({ percent: 15, loadedMb: 6.5, totalMb: 48.0, status: 'Connecting to server...' });

  const response = await fetch(`/api/offline-packs/${packId}/download`);
  if (!response.ok) {
    throw new Error(`Failed to download offline pack: ${response.statusText}`);
  }

  onProgress({ percent: 55, loadedMb: 26.4, totalMb: 48.0, status: 'Receiving offline database...' });
  const bundle = await response.json();

  onProgress({ percent: 80, loadedMb: 38.4, totalMb: 48.0, status: 'Writing to IndexedDB storage...' });

  // Atomic write into IndexedDB
  await db.transaction('rw', [
    db.locations,
    db.emergency_services,
    db.guides,
    db.transport_routes,
    db.offline_packs
  ], async () => {
    // 1. Save or update locations
    if (bundle.locations && bundle.locations.length > 0) {
      await db.locations.bulkPut(bundle.locations);
    }

    // 2. Save emergency numbers
    if (bundle.emergencyServices && bundle.emergencyServices.length > 0) {
      await db.emergency_services.bulkPut(bundle.emergencyServices);
    }

    // 3. Save disaster guides
    if (bundle.guides && bundle.guides.length > 0) {
      await db.guides.bulkPut(bundle.guides);
    }

    // 4. Save transport routes
    if (bundle.transportRoutes && bundle.transportRoutes.length > 0) {
      await db.transport_routes.bulkPut(bundle.transportRoutes);
    }

    // 5. Update pack metadata status
    await db.offline_packs.put({
      id: packId,
      region: bundle.metadata.region,
      name_en: bundle.metadata.name_en,
      name_ne: bundle.metadata.name_ne,
      province: bundle.metadata.province,
      version: bundle.metadata.version,
      size_mb: bundle.metadata.size_mb,
      status: 'downloaded',
      downloaded_at: new Date().toISOString(),
      center: bundle.metadata.center,
      zoom: bundle.metadata.zoom,
      boundingBox: bundle.metadata.boundingBox
    });
  });

  onProgress({ percent: 100, loadedMb: bundle.metadata.size_mb, totalMb: bundle.metadata.size_mb, status: 'Completed ✓' });

  return bundle.metadata;
}

/**
 * Removes an offline pack from IndexedDB
 */
export async function removePackBundle(packId) {
  const pack = await db.offline_packs.get(packId);
  if (!pack) return;

  await db.transaction('rw', [
    db.locations,
    db.offline_packs,
    db.transport_routes
  ], async () => {
    // Remove locations for this region
    const locs = await db.locations.where('region').equalsIgnoreCase(pack.region).toArray();
    const locIds = locs.map(l => l.id);
    if (locIds.length > 0) {
      await db.locations.bulkDelete(locIds);
    }

    // Remove transport routes
    const routes = await db.transport_routes.where('region').equalsIgnoreCase(pack.region).toArray();
    const routeIds = routes.map(r => r.id);
    if (routeIds.length > 0) {
      await db.transport_routes.bulkDelete(routeIds);
    }

    // Remove pack record
    await db.offline_packs.delete(packId);
  });
}

/**
 * Global offline full-text search across all downloaded data in IndexedDB
 */
export async function searchOfflineData(query) {
  if (!query || !query.trim()) return { locations: [], guides: [], routes: [] };

  const q = query.toLowerCase().trim();

  // Search local locations
  const allLocations = await db.locations.toArray();
  const matchedLocations = allLocations.filter(loc =>
    (loc.name_en && loc.name_en.toLowerCase().includes(q)) ||
    (loc.name_ne && loc.name_ne.includes(q)) ||
    (loc.address_en && loc.address_en.toLowerCase().includes(q)) ||
    (loc.category_id && loc.category_id.toLowerCase().includes(q)) ||
    (loc.region && loc.region.toLowerCase().includes(q))
  );

  // Search local guides
  const allGuides = await db.guides.toArray();
  const matchedGuides = allGuides.filter(g =>
    (g.title_en && g.title_en.toLowerCase().includes(q)) ||
    (g.title_ne && g.title_ne.includes(q)) ||
    (g.slug && g.slug.toLowerCase().includes(q)) ||
    (g.category_id && g.category_id.toLowerCase().includes(q))
  );

  // Search local transport routes
  const allRoutes = await db.transport_routes.toArray();
  const matchedRoutes = allRoutes.filter(r =>
    (r.name_en && r.name_en.toLowerCase().includes(q)) ||
    (r.name_ne && r.name_ne.includes(q)) ||
    (r.route_number && r.route_number.toLowerCase().includes(q))
  );

  // Search bundled destinations (offline-first, no network needed)
  let matchedDestinations = [];
  let matchedProvinces = [];
  try {
    const allDest = await db.table('destinations').toArray();
    matchedDestinations = allDest.filter((d) =>
      (d.name_en && d.name_en.toLowerCase().includes(q)) ||
      (d.name_ne && d.name_ne.includes(query.trim())) ||
      (d.district && d.district.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q))
    );
    const allProv = await db.table('provinces').toArray();
    matchedProvinces = allProv.filter((p) =>
      (p.name_en && p.name_en.toLowerCase().includes(q)) ||
      (p.name_ne && p.name_ne.includes(query.trim())) ||
      (p.capital_en && p.capital_en.toLowerCase().includes(q)) ||
      (p.districts || []).some((d) => d.toLowerCase().includes(q))
    );
  } catch {
    /* v2 tables may not exist yet on old installs — search still works */
  }

  return {
    locations: matchedLocations,
    guides: matchedGuides,
    routes: matchedRoutes,
    destinations: matchedDestinations,
    provinces: matchedProvinces
  };
}

export async function saveCustomPin(pin) {
  const item = {
    id: pin.id || `pin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: pin.title || 'My Pin',
    note: pin.note || '',
    latitude: Number(pin.latitude),
    longitude: Number(pin.longitude),
    color: pin.color || '#F59E0B',
    createdAt: Date.now()
  };
  await db.table('custom_pins').put(item);
  return item;
}

export async function getCustomPins() {
  try {
    return await db.table('custom_pins').toArray();
  } catch {
    return [];
  }
}

export async function deleteCustomPin(id) {
  try {
    await db.table('custom_pins').delete(id);
    return true;
  } catch {
    return false;
  }
}

