// Exports server seed records into static JSON the app can load WITHOUT any
// server — this is what makes the installed APK (and offline PWA) show real
// hospitals, guides and routes on first open. Client is the consumer:
// client/src/offline/seedFromBundle.js seeds IndexedDB from these files.
// Usage: npm run export:bundle  (runs before every client build)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  locations, guides, transportRoutes, offlinePacks,
  locationCategories, emergencyServices
} from '../server/src/database/seedData.js';
import { DATA_VERSION } from '../server/src/data/essential.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outdir = path.join(__dirname, '..', 'client', 'public', 'data');
fs.mkdirSync(outdir, { recursive: true });

const files = {
  'locations.json': locations,
  'guides.json': guides,
  'transport-routes.json': transportRoutes,
  'packs.json': offlinePacks.map((p) => ({
    id: p.id, region: p.region, name_en: p.name_en, name_ne: p.name_ne,
    province: p.province, version: p.version, size_mb: p.size_mb,
    center: p.center, zoom: p.zoom, boundingBox: p.boundingBox,
  })),
  'categories.json': locationCategories,
  'emergency.json': emergencyServices,
  'manifest.json': {
    version: DATA_VERSION,
    generated: new Date().toISOString().slice(0, 10),
    locations: locations.length,
    guides: guides.length,
    transportRoutes: transportRoutes.length,
    packs: offlinePacks.length,
  },
};

for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(outdir, name), JSON.stringify(data));
  console.log(`bundle ${name}: ${Array.isArray(data) ? data.length + ' records' : 'ok'}`);
}
