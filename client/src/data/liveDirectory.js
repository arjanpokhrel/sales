// Live directory: real OpenStreetMap places around the map center, fetched
// ONLY on explicit user action (category tap / map move) while online.
// One small query at a time, 60 results max — respects Overpass fair use
// (no bulk downloads, no background polling). Offline, the bundled directory
// is used instead. Results are NEVER presented as verified: the UI badges
// them "LIVE OSM · verify before emergency use".
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// category_id -> Overpass amenity tags
export const LIVE_AMENITIES = {
  hospital: ['hospital', 'clinic', 'doctors'],
  police: ['police'],
  fire: ['fire_station'],
  pharmacy: ['pharmacy'],
  atm: ['atm'],
  transport: ['bus_station'],
};

const cache = new Map(); // "amenity|lat,rounded|lng,rounded" -> { at, items }
export const liveCacheById = new Map(); // "osm-<type>-<id>" -> place
let inFlight = null;

function cacheKey(amenity, lat, lng) {
  return `${amenity}|${lat.toFixed(2)}|${lng.toFixed(2)}`;
}

export function getLivePlace(id) {
  return liveCacheById.get(id) || null;
}

export async function fetchLivePlaces(categoryId, lat, lng, radiusM = 12000) {
  const amenities = LIVE_AMENITIES[categoryId];
  if (!amenities || lat == null || lng == null) return { items: [], live: false };
  const key = cacheKey(categoryId, Number(lat), Number(lng));
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return { items: hit.items, live: true, cached: true };
  if (inFlight) {
    try { await inFlight; } catch { /* fall through to fresh fetch */ }
    const hit2 = cache.get(key);
    if (hit2) return { items: hit2.items, live: true, cached: true };
  }

  const filters = amenities
    .map((a) => `node["amenity"="${a}"](around:${radiusM},${lat},${lng});`)
    .join('\n');
  const query = `[out:json][timeout:25];(\n${filters}\n);out center 60;`;

  const task = (async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 28000);
    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: 'data=' + encodeURIComponent(query),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`directory failed (${res.status})`);
      const data = await res.json();
      const items = (data.elements || [])
        .filter((e) => e.lat != null && e.lon != null)
        .map((e) => {
          const tags = e.tags || {};
          const place = {
            id: `osm-${e.type}-${e.id}`,
            category_id: categoryId,
            name_en: tags.name || tags['name:en'] || `${categoryLabel(categoryId)} (unnamed)`,
            name_ne: tags['name:ne'] || '',
            latitude: e.lat,
            longitude: e.lon,
            address_en: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', '),
            phone: tags.phone || tags['contact:phone'] || '',
            region: tags['addr:city'] || '',
            verification_status: 'osm_live',
            source: 'OpenStreetMap live (unverified)',
            osm_url: `https://www.openstreetmap.org/${e.type}/${e.id}`,
          };
          liveCacheById.set(place.id, place);
          return place;
        });
      cache.set(key, { at: Date.now(), items });
      if (cache.size > 12) cache.delete(cache.keys().next().value);
      return { items, live: true };
    } finally {
      clearTimeout(timer);
    }
  })();
  inFlight = task;
  try {
    return await task;
  } finally {
    if (inFlight === task) inFlight = null;
  }
}

function categoryLabel(c) {
  return { hospital: 'Hospital', police: 'Police', fire: 'Fire station', pharmacy: 'Pharmacy', atm: 'ATM', transport: 'Bus station' }[c] || 'Place';
}
