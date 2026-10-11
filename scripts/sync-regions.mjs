# Sync bundled regional data: client is the source of truth.
# Usage: npm run sync:regions
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const files = ['provinces.js', 'destinations.js', 'essential.js'];

for (const f of files) {
  const src = path.join(root, 'client/src/data', f);
  const dst = path.join(root, 'server/src/data', f);
  fs.copyFileSync(src, dst);
  console.log(`synced ${f}`);
}
