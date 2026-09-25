import Dexie from 'dexie';

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
  }
}

export const db = new NepaReadyDatabase();

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

  return {
    locations: matchedLocations,
    guides: matchedGuides,
    routes: matchedRoutes
  };
}
