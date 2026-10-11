import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from '../database/storage.js';
import { config } from '../config/index.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { PROVINCES } from '../data/provinces.js';
import { DESTINATIONS } from '../data/destinations.js';
import { DATA_VERSION, EMERGENCY_NUMBERS } from '../data/essential.js';

export const apiRouter = express.Router();

// ----------------------------------------------------
// Healthcheck (Lightweight ping endpoint for online check)
// ----------------------------------------------------
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'NepaReady',
    tagline: 'Your Nepal. Always Ready.',
    online: true,
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// Authentication
// ----------------------------------------------------
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, preferred_region } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = storage.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = storage.createUser({
      name,
      email: email.toLowerCase(),
      password_hash,
      phone: phone || '',
      preferred_region: preferred_region || 'Koshi',
      role: 'user'
    });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: '30d'
    });

    const { password_hash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user', message: err.message });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: '30d'
    });

    const { password_hash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

apiRouter.get('/auth/me', authenticate, (req, res) => {
  const { password_hash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ----------------------------------------------------
// Emergency Services & SOS
// ----------------------------------------------------
apiRouter.get('/emergency', (req, res) => {
  const services = storage.getEmergencyServices();
  res.json({ services, verified_as_of: '2026-09-25' });
});

apiRouter.post('/emergency/sos', optionalAuth, (req, res) => {
  const { latitude, longitude, accuracy, action, message } = req.body;
  const log = storage.logSos({
    userId: req.user ? req.user.id : 'anonymous',
    userName: req.user ? req.user.name : 'Citizen',
    latitude,
    longitude,
    accuracy,
    action: action || 'SOS_BUTTON_TRIGGERED',
    message: message || 'Emergency signal dispatched from client'
  });
  res.json({ success: true, logId: log.id, receivedAt: log.timestamp });
});

// ----------------------------------------------------
// Locations & Categories
// ----------------------------------------------------
apiRouter.get('/locations/categories', (req, res) => {
  const categories = storage.getLocationCategories();
  res.json({ categories });
});

apiRouter.get('/locations', (req, res) => {
  const { category, region, search } = req.query;
  const locations = storage.getLocations({ category, region, search });
  res.json({ locations, count: locations.length });
});

apiRouter.get('/locations/:id', (req, res) => {
  const location = storage.getLocationById(req.params.id);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  res.json({ location });
});

// ----------------------------------------------------
// Emergency Guides
// ----------------------------------------------------
apiRouter.get('/guides', (req, res) => {
  const { category } = req.query;
  const guides = storage.getGuides(category);
  res.json({ guides });
});

apiRouter.get('/guides/:slug', (req, res) => {
  const guide = storage.getGuideBySlug(req.params.slug);
  if (!guide) {
    return res.status(404).json({ error: 'Emergency guide not found' });
  }
  res.json({ guide });
});

// ----------------------------------------------------
// Offline Packs
// ----------------------------------------------------
apiRouter.get('/offline-packs', (req, res) => {
  const packs = storage.getOfflinePacks();
  res.json({ packs });
});

apiRouter.get('/offline-packs/:id', (req, res) => {
  const pack = storage.getOfflinePackById(req.params.id);
  if (!pack) {
    return res.status(404).json({ error: 'Offline pack not found' });
  }
  res.json({ pack });
});

apiRouter.get('/offline-packs/:id/download', (req, res) => {
  const bundle = storage.getPackBundle(req.params.id);
  if (!bundle) {
    return res.status(404).json({ error: 'Offline pack bundle not found' });
  }
  res.json(bundle);
});

// ----------------------------------------------------
// Provinces, Destinations & Full-Country Manifest (bundled data API)
// ----------------------------------------------------
apiRouter.get('/provinces', (req, res) => {
  res.json({ provinces: PROVINCES, count: PROVINCES.length, version: DATA_VERSION });
});

apiRouter.get('/provinces/:id', (req, res) => {
  const p = PROVINCES.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Province not found' });
  res.json({ province: p, destinations: DESTINATIONS.filter((d) => d.province === p.id) });
});

apiRouter.get('/destinations', (req, res) => {
  const { province, category, search } = req.query;
  let items = DESTINATIONS;
  if (province) items = items.filter((d) => d.province === province);
  if (category) items = items.filter((d) => d.category === category);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((d) =>
      d.name_en.toLowerCase().includes(q) || d.name_ne.includes(search) ||
      d.district.toLowerCase().includes(q));
  }
  res.json({ destinations: items, count: items.length, version: DATA_VERSION });
});

apiRouter.get('/destinations/:id', (req, res) => {
  const d = DESTINATIONS.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Destination not found' });
  res.json({ destination: d });
});

// Verifiable full-country manifest: counts, bytes, versions. Map tiles are
// intentionally NOT listed here — they cache on view (see Download All page).
apiRouter.get('/packages/manifest', (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let photos = [];
  try {
    const p = path.join(__dirname, '../../../client/public/photos/attribution.json');
    photos = JSON.parse(fs.readFileSync(p, 'utf8')).photos || [];
  } catch { /* client photos unavailable in this deploy */ }
  const districts = PROVINCES.reduce((a, p) => a + p.districts.length, 0);
  res.json({
    id: 'nepal-full-2026-10',
    version: DATA_VERSION,
    generated: new Date().toISOString().slice(0, 10),
    provinces: PROVINCES.length,
    districts,
    destinations: DESTINATIONS.length,
    destination_ids: DESTINATIONS.map((d) => d.id),
    emergency_numbers: EMERGENCY_NUMBERS.map((e) => ({ id: e.id, number: e.number, scope: e.scope })),
    emergency_verified_on: '2026-10-11',
    photos: photos.map((p) => ({ id: p.id, bytes: p.bytes, license: p.license })),
    photo_bytes: photos.reduce((a, p) => a + (p.bytes || 0), 0),
    municipalities_note: 'Municipality/ward data not bundled yet — district level only.',
    map_tiles_note: 'Tiles cache on view per OSM policy; not part of this manifest.'
  });
});

// ----------------------------------------------------
// Transport & Travel Mode
// ----------------------------------------------------
apiRouter.get('/transport/routes', (req, res) => {
  const { region } = req.query;
  const routes = storage.getTransportRoutes(region);
  res.json({ routes });
});

apiRouter.get('/transport/travel-pack', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to regions are required' });
  }

  const allPacks = storage.getOfflinePacks();
  const destPack = allPacks.find(p => p.region.toLowerCase().includes(to.toLowerCase()));
  const origPack = allPacks.find(p => p.region.toLowerCase().includes(from.toLowerCase()));

  res.json({
    travelRoute: { from, to },
    recommendedPacks: [destPack, origPack].filter(Boolean),
    highwayAdvisory: {
      emergencyHotline: '103 (Nepal Traffic Police)',
      monsoonWarning: 'Check for potential mudslides along Narayanghat-Mugling and BP Highway.',
      lastUpdated: '2026-09-25'
    }
  });
});

// ----------------------------------------------------
// Saved Places (User specific)
// ----------------------------------------------------
apiRouter.get('/saved-places', authenticate, (req, res) => {
  const places = storage.getSavedPlaces(req.user.id);
  res.json({ places });
});

apiRouter.post('/saved-places', authenticate, (req, res) => {
  const { label, custom_name, latitude, longitude, address, notes } = req.body;
  if (!label || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Label, latitude, and longitude are required' });
  }
  const place = storage.addSavedPlace(req.user.id, {
    label,
    custom_name: custom_name || label,
    latitude,
    longitude,
    address: address || '',
    notes: notes || ''
  });
  res.status(201).json({ place });
});

apiRouter.delete('/saved-places/:id', authenticate, (req, res) => {
  const success = storage.deleteSavedPlace(req.params.id, req.user.id);
  if (!success) {
    return res.status(404).json({ error: 'Saved place not found or unauthorized' });
  }
  res.json({ success: true, message: 'Saved place removed' });
});

// ----------------------------------------------------
// Personal Emergency Contacts
// ----------------------------------------------------
apiRouter.get('/personal-contacts', authenticate, (req, res) => {
  const contacts = storage.getPersonalContacts(req.user.id);
  res.json({ contacts });
});

apiRouter.post('/personal-contacts', authenticate, (req, res) => {
  const { name, phone, relationship, is_primary } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  const contact = storage.addPersonalContact(req.user.id, {
    name,
    phone,
    relationship: relationship || 'Family',
    is_primary: !!is_primary
  });
  res.status(201).json({ contact });
});

apiRouter.delete('/personal-contacts/:id', authenticate, (req, res) => {
  const success = storage.deletePersonalContact(req.params.id, req.user.id);
  if (!success) {
    return res.status(404).json({ error: 'Contact not found or unauthorized' });
  }
  res.json({ success: true, message: 'Contact removed' });
});

// ----------------------------------------------------
// Admin Operations (Protected)
// ----------------------------------------------------
apiRouter.get('/admin/metrics', authenticate, requireAdmin, (req, res) => {
  const metrics = storage.getMetrics();
  res.json({ metrics });
});

apiRouter.post('/admin/locations', authenticate, requireAdmin, (req, res) => {
  const { name_en, name_ne, category_id, latitude, longitude, address_en, address_ne, phone, region, source } = req.body;
  if (!name_en || !category_id || !latitude || !longitude || !region) {
    return res.status(400).json({ error: 'Missing mandatory location fields' });
  }

  const newLoc = storage.createLocation({
    name_en,
    name_ne: name_ne || name_en,
    category_id,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    address_en: address_en || '',
    address_ne: address_ne || '',
    phone: phone || '',
    region,
    source: source || 'Admin Verification',
    verified_by: req.user.name
  });

  storage.logAudit({
    user_id: req.user.id,
    action: 'LOCATION_CREATED',
    resource_type: 'LOCATION',
    resource_id: newLoc.id,
    details: { name: newLoc.name_en, region: newLoc.region }
  });

  res.status(201).json({ location: newLoc });
});

apiRouter.put('/admin/locations/:id', authenticate, requireAdmin, (req, res) => {
  const updated = storage.updateLocation(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Location not found' });
  }
  storage.logAudit({
    user_id: req.user.id,
    action: 'LOCATION_UPDATED',
    resource_type: 'LOCATION',
    resource_id: req.params.id,
    details: req.body
  });
  res.json({ location: updated });
});

apiRouter.delete('/admin/locations/:id', authenticate, requireAdmin, (req, res) => {
  const success = storage.deleteLocation(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Location not found' });
  }
  storage.logAudit({
    user_id: req.user.id,
    action: 'LOCATION_DELETED',
    resource_type: 'LOCATION',
    resource_id: req.params.id
  });
  res.json({ success: true, message: 'Location deleted' });
});

apiRouter.post('/admin/guides', authenticate, requireAdmin, (req, res) => {
  const guide = storage.saveGuide(req.body);
  storage.logAudit({
    user_id: req.user.id,
    action: 'GUIDE_SAVED',
    resource_type: 'GUIDE',
    resource_id: guide.slug,
    details: { title: guide.title_en }
  });
  res.status(201).json({ guide });
});

apiRouter.post('/admin/offline-packs', authenticate, requireAdmin, (req, res) => {
  const pack = storage.createOfflinePack(req.body);
  storage.logAudit({
    user_id: req.user.id,
    action: 'PACK_CREATED',
    resource_type: 'OFFLINE_PACK',
    resource_id: pack.id,
    details: { name: pack.name_en, size: pack.size_mb }
  });
  res.status(201).json({ pack });
});
