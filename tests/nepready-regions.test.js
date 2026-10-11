import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:5000';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

describe('NepaReady regional data & offline bundle', () => {
  test('GET /api/provinces returns 7 provinces with 77 districts', async () => {
    const res = await fetch(`${BASE_URL}/api/provinces`);
    assert.strictEqual(res.status, 200);
    const { provinces, count } = await res.json();
    assert.strictEqual(count, 7);
    const districts = provinces.reduce((a, p) => a + p.districts.length, 0);
    assert.strictEqual(districts, 77);
    for (const p of provinces) {
      assert.ok(p.id && p.name_en && p.name_ne && p.capital_en);
    }
  });

  test('GET /api/destinations returns 18 verified-structure records', async () => {
    const res = await fetch(`${BASE_URL}/api/destinations`);
    assert.strictEqual(res.status, 200);
    const { destinations, count } = await res.json();
    assert.strictEqual(count, 18);
    for (const d of destinations) {
      assert.ok(d.id && d.name_en && d.name_ne && d.category && d.province);
      assert.ok(typeof d.lat === 'number' && typeof d.lng === 'number');
      assert.ok(d.lat > 26 && d.lat < 31 && d.lng > 80 && d.lng < 89);
    }
  });

  test('GET /api/packages/manifest reports honest counts and photo bytes', async () => {
    const res = await fetch(`${BASE_URL}/api/packages/manifest`);
    assert.strictEqual(res.status, 200);
    const m = await res.json();
    assert.strictEqual(m.provinces, 7);
    assert.strictEqual(m.districts, 77);
    assert.strictEqual(m.destinations, 18);
    assert.ok(m.photo_bytes > 1_000_000);
    assert.ok(m.map_tiles_note);
  });

  test('Bundled photos exist on disk with attribution for every record', () => {
    const dir = path.join(ROOT, 'client/public/photos');
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'attribution.json'), 'utf8'));
    assert.ok(manifest.photos.length >= 16);
    for (const p of manifest.photos) {
      assert.ok(fs.existsSync(path.join(dir, `${p.id}.jpg`)), `missing ${p.id}.jpg`);
      assert.ok(p.author && p.license && p.source);
      assert.ok(fs.statSync(path.join(dir, `${p.id}.jpg`)).size > 8000);
    }
  });

  test('Android project uses package np.nepaready.app named NepaReady', () => {
    const gradle = fs.readFileSync(
      path.join(ROOT, 'client/android/app/build.gradle'), 'utf8');
    assert.ok(gradle.includes('np.nepaready.app'));
    const strings = fs.readFileSync(
      path.join(ROOT, 'client/android/app/src/main/res/values/strings.xml'), 'utf8');
    assert.ok(strings.includes('NepaReady'));
  });

  test('New routes ship in the production bundle', () => {
    const assets = fs.readdirSync(path.join(ROOT, 'client/dist/assets'));
    const js = assets.filter((f) => f.endsWith('.js'));
    assert.ok(js.length > 0);
    const bundle = js.map((f) =>
      fs.readFileSync(path.join(ROOT, 'client/dist/assets', f), 'utf8')).join('\n');
    for (const route of ['/provinces', '/destinations', '/download-all', '/bookmarks', '/settings', '/attribution']) {
      assert.ok(bundle.includes(route), `missing route ${route}`);
    }
  });
});
