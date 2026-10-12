import { test, describe } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000';

describe('🇳🇵 NepaReady Full-Stack Verification Suite', () => {

  // 1. Health & Server Status
  test('Healthcheck endpoint returns online status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.app, 'NepaReady');
    assert.strictEqual(data.online, true);
  });

  // 2. Authentication: Register, Login, Token verification
  test('User authentication flow (Register & Login)', async () => {
    const testEmail = `test_${Date.now()}@nepal.np`;
    const testPassword = 'Password@123';

    // Register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suman Adhikari',
        email: testEmail,
        password: testPassword,
        phone: '9841000000',
        preferred_region: 'Biratnagar'
      })
    });
    assert.strictEqual(regRes.status, 201);
    const regData = await regRes.json();
    assert.ok(regData.token);
    assert.strictEqual(regData.user.name, 'Suman Adhikari');

    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.token);
    assert.strictEqual(loginData.user.email, testEmail);

    // Profile verification with token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.user.email, testEmail);
  });

  // 3. Security: Unauthorized admin access blocked
  test('Security: Non-admin users cannot access admin metrics', async () => {
    // Normal user token
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Regular Citizen',
        email: `citizen_${Date.now()}@gmail.com`,
        password: 'UserPass@123'
      })
    });
    const { token } = await regRes.json();

    const adminRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(adminRes.status, 403);
    const errData = await adminRes.json();
    assert.strictEqual(errData.error, 'Admin access required');
  });

  // 4. Emergency Services & Verified Data
  test('Emergency services load verified national dispatch numbers', async () => {
    const res = await fetch(`${BASE_URL}/api/emergency`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.services));
    assert.ok(data.services.length >= 5);

    // Check verified toll-free numbers
    const numbers = data.services.map(s => s.number);
    assert.ok(numbers.includes('100'), 'Should contain Nepal Police (100)');
    assert.ok(numbers.includes('101'), 'Should contain Fire Brigade (101)');
    assert.ok(numbers.includes('102'), 'Should contain Ambulance (102)');
    assert.ok(numbers.includes('1155'), 'Should contain NEOC Disaster Center (1155)');
  });

  // 5. Locations Directory & Filtering
  test('Locations directory returns hospitals and supports category filtering', async () => {
    const res = await fetch(`${BASE_URL}/api/locations?category=hospital`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.locations.length > 0);
    const statuses = new Set();
    for (const loc of data.locations) {
      assert.strictEqual(loc.category_id, 'hospital');
      assert.ok(loc.latitude);
      assert.ok(loc.longitude);
      // Honest model: verified pins + clearly-flagged approximate pins, never invented.
      assert.ok(['verified', 'verified_official', 'approximate'].includes(loc.verification_status));
      statuses.add(loc.verification_status);
    }
    assert.ok(statuses.has('verified'), 'keeps verified hospitals');
    assert.ok(statuses.has('approximate'), 'flags approximate pins honestly');
  });

  // 6. Action Guides
  test('Emergency preparedness guides load with step-by-step actions', async () => {
    const res = await fetch(`${BASE_URL}/api/guides/earthquake`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.guide.slug, 'earthquake');
    assert.ok(Array.isArray(data.guide.immediate_actions_en));
    assert.ok(Array.isArray(data.guide.do_not_actions_en));
    assert.strictEqual(data.guide.immediate_actions_en[0].title, 'DROP');
    assert.strictEqual(data.guide.immediate_actions_en[1].title, 'COVER');
    assert.strictEqual(data.guide.immediate_actions_en[2].title, 'HOLD ON');
  });

  // 7. Offline Pack Bundler
  test('Offline Pack download endpoint returns full bundled payload for local storage', async () => {
    const res = await fetch(`${BASE_URL}/api/offline-packs/biratnagar-koshi/download`);
    assert.strictEqual(res.status, 200);
    const bundle = await res.json();
    assert.ok(bundle.metadata);
    assert.strictEqual(bundle.metadata.region, 'Biratnagar');
    assert.ok(bundle.metadata.size_mb > 0);
    assert.ok(Array.isArray(bundle.locations));
    assert.ok(bundle.locations.length > 0);
    assert.ok(Array.isArray(bundle.emergencyServices));
    assert.ok(Array.isArray(bundle.guides));
    assert.ok(Array.isArray(bundle.transportRoutes));
  });

  // 8. Public Transport Routes
  test('Public transport routes return route numbers and stops', async () => {
    const res = await fetch(`${BASE_URL}/api/transport/routes?region=Biratnagar`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.routes));
    assert.ok(data.routes.length >= 2);
    assert.strictEqual(data.routes[0].region, 'Biratnagar');
    assert.ok(data.routes[0].stops.length > 0);
  });

  // 9. Travel Pack Recommender
  test('Travel mode pack endpoint recommends complete regional bundle', async () => {
    const res = await fetch(`${BASE_URL}/api/transport/travel-pack?from=Biratnagar&to=Pokhara`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.travelRoute.from, 'Biratnagar');
    assert.strictEqual(data.travelRoute.to, 'Pokhara');
    assert.ok(data.recommendedPacks.length > 0);
    assert.ok(data.highwayAdvisory);
  });

  // 10. PWA Assets availability
  test('PWA manifest, logo and offline fallback are served', async () => {
    const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
    assert.strictEqual(manifestRes.status, 200);
    const manifest = await manifestRes.json();
    assert.strictEqual(manifest.short_name, 'Nepal Navigator');
    assert.strictEqual(manifest.display, 'standalone');

    const offlineRes = await fetch(`${BASE_URL}/offline.html`);
    assert.strictEqual(offlineRes.status, 200);
    const offlineHtml = await offlineRes.text();
    assert.ok(offlineHtml.includes('Your Nepal. Always Ready.'));

    const logoRes = await fetch(`${BASE_URL}/logo.svg`);
    assert.strictEqual(logoRes.status, 200);
  });

});
