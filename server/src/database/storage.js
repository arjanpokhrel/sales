import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import {
  locationCategories,
  emergencyServices,
  offlinePacks,
  locations,
  guides,
  transportRoutes
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/nepready_store.json');

class Storage {
  constructor() {
    this.data = {
      users: [],
      locationCategories: [],
      emergencyServices: [],
      offlinePacks: [],
      locations: [],
      guides: [],
      transportRoutes: [],
      savedPlaces: [],
      personalContacts: [],
      auditLogs: [],
      sosLogs: []
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        await this.seed();
      }
    } catch (err) {
      console.warn('Could not read existing store file, reseeding memory store:', err.message);
      await this.seed();
    }

    this.initialized = true;
  }

  async seed() {
    console.log('🌱 Seeding NepaReady database with verified Nepal emergency records...');

    // Default admin user
    const adminPasswordHash = await bcrypt.hash('Admin@NepaReady2026', 10);
    const demoUserPasswordHash = await bcrypt.hash('User@12345', 10);

    this.data = {
      users: [
        {
          id: 'user-admin-1',
          name: 'NepaReady Admin',
          email: 'admin@nepready.org.np',
          password_hash: adminPasswordHash,
          phone: '+977-9800000000',
          preferred_region: 'Koshi',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: 'user-demo-1',
          name: 'Aarav Sharma',
          email: 'aarav@gmail.com',
          password_hash: demoUserPasswordHash,
          phone: '+977-9841234567',
          preferred_region: 'Biratnagar',
          role: 'user',
          created_at: new Date().toISOString()
        }
      ],
      locationCategories: [...locationCategories],
      emergencyServices: [...emergencyServices],
      offlinePacks: [...offlinePacks],
      locations: [...locations],
      guides: [...guides],
      transportRoutes: [...transportRoutes],
      savedPlaces: [
        {
          id: 'sp-1',
          user_id: 'user-demo-1',
          label: 'Home',
          custom_name: 'Biratnagar Residence',
          latitude: 26.4560,
          longitude: 87.2740,
          address: 'Ward 8, Hospital Road, Biratnagar',
          notes: 'Safe assembly point in front yard',
          created_at: new Date().toISOString()
        },
        {
          id: 'sp-2',
          user_id: 'user-demo-1',
          label: 'Family',
          custom_name: 'Parents Home (Dharan)',
          latitude: 26.8120,
          longitude: 87.2840,
          address: 'Bhanu Chowk East, Dharan',
          notes: 'Near BPKIHS road',
          created_at: new Date().toISOString()
        }
      ],
      personalContacts: [
        {
          id: 'pc-1',
          user_id: 'user-demo-1',
          name: 'Mother (आमा)',
          phone: '9842011223',
          relationship: 'Mother',
          is_primary: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'pc-2',
          user_id: 'user-demo-1',
          name: 'Brother (भाइ)',
          phone: '9801234567',
          relationship: 'Brother',
          is_primary: false,
          created_at: new Date().toISOString()
        }
      ],
      auditLogs: [
        {
          id: 'audit-1',
          user_id: 'user-admin-1',
          action: 'SYSTEM_INITIALIZED',
          resource_type: 'SYSTEM',
          resource_id: 'ALL',
          details: { message: 'Database initialized with verified Nepal emergency directory.' },
          created_at: new Date().toISOString()
        }
      ],
      sosLogs: []
    };

    this.save();
    console.log('✅ NepaReady database successfully seeded.');
  }

  save() {
    try {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write NepaReady persistent store:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      role: 'user',
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Locations ---
  getLocations(filters = {}) {
    let result = [...this.data.locations];
    if (filters.category) {
      result = result.filter(l => l.category_id === filters.category);
    }
    if (filters.region) {
      result = result.filter(l => l.region.toLowerCase() === filters.region.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l =>
        l.name_en.toLowerCase().includes(q) ||
        l.name_ne.includes(q) ||
        (l.address_en && l.address_en.toLowerCase().includes(q)) ||
        (l.description_en && l.description_en.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getLocationById(id) {
    return this.data.locations.find(l => l.id === id);
  }

  createLocation(locData) {
    const newLoc = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      verification_status: 'verified',
      verified_at: new Date().toISOString().split('T')[0],
      verified_by: 'NepaReady Admin Authority',
      created_at: new Date().toISOString(),
      ...locData
    };
    this.data.locations.unshift(newLoc);
    this.save();
    return newLoc;
  }

  updateLocation(id, updates) {
    const idx = this.data.locations.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.locations[idx] = {
      ...this.data.locations[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.locations[idx];
  }

  deleteLocation(id) {
    const idx = this.data.locations.findIndex(l => l.id === id);
    if (idx === -1) return false;
    this.data.locations.splice(idx, 1);
    this.save();
    return true;
  }

  getLocationCategories() {
    return this.data.locationCategories;
  }

  // --- Emergency Services ---
  getEmergencyServices() {
    return [...this.data.emergencyServices].sort((a, b) => a.priority - b.priority);
  }

  // --- Guides ---
  getGuides(categoryId) {
    if (categoryId) {
      return this.data.guides.filter(g => g.category_id === categoryId);
    }
    return this.data.guides;
  }

  getGuideBySlug(slug) {
    return this.data.guides.find(g => g.slug === slug);
  }

  saveGuide(guideData) {
    const idx = this.data.guides.findIndex(g => g.slug === guideData.slug);
    if (idx >= 0) {
      this.data.guides[idx] = {
        ...this.data.guides[idx],
        ...guideData,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.guides[idx];
    } else {
      const newGuide = {
        id: `guide-${Date.now()}`,
        is_published: true,
        version: '1.0.0',
        updated_at: new Date().toISOString(),
        ...guideData
      };
      this.data.guides.push(newGuide);
      this.save();
      return newGuide;
    }
  }

  // --- Offline Packs ---
  getOfflinePacks() {
    return this.data.offlinePacks;
  }

  getOfflinePackById(id) {
    return this.data.offlinePacks.find(p => p.id === id);
  }

  // Build the complete downloadable offline bundle
  getPackBundle(packId) {
    const pack = this.getOfflinePackById(packId);
    if (!pack) return null;

    // Filter relevant locations for this region
    const packLocations = this.data.locations.filter(
      l => l.region.toLowerCase() === pack.region.toLowerCase()
    );

    // Transport routes for this region
    const packRoutes = this.data.transportRoutes.filter(
      r => r.region.toLowerCase() === pack.region.toLowerCase()
    );

    return {
      metadata: {
        packId: pack.id,
        name_en: pack.name_en,
        name_ne: pack.name_ne,
        region: pack.region,
        province: pack.province,
        version: pack.version,
        size_mb: pack.size_mb,
        center: [pack.center_latitude, pack.center_longitude],
        zoom: pack.zoom_level,
        boundingBox: pack.bounding_box,
        generated_at: new Date().toISOString()
      },
      locations: packLocations,
      emergencyServices: this.data.emergencyServices,
      guides: this.data.guides,
      transportRoutes: packRoutes,
      locationCategories: this.data.locationCategories
    };
  }

  createOfflinePack(packData) {
    const newPack = {
      id: packData.id || `pack-${Date.now()}`,
      version: 'v1.0',
      is_active: true,
      last_updated: new Date().toISOString().split('T')[0],
      ...packData
    };
    this.data.offlinePacks.push(newPack);
    this.save();
    return newPack;
  }

  // --- Transport ---
  getTransportRoutes(region) {
    if (region) {
      return this.data.transportRoutes.filter(
        r => r.region.toLowerCase() === region.toLowerCase()
      );
    }
    return this.data.transportRoutes;
  }

  // --- Saved Places ---
  getSavedPlaces(userId) {
    return this.data.savedPlaces.filter(p => p.user_id === userId);
  }

  addSavedPlace(userId, place) {
    const newPlace = {
      id: `sp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      ...place
    };
    this.data.savedPlaces.push(newPlace);
    this.save();
    return newPlace;
  }

  deleteSavedPlace(id, userId) {
    const idx = this.data.savedPlaces.findIndex(p => p.id === id && p.user_id === userId);
    if (idx === -1) return false;
    this.data.savedPlaces.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Personal Emergency Contacts ---
  getPersonalContacts(userId) {
    return this.data.personalContacts.filter(c => c.user_id === userId);
  }

  addPersonalContact(userId, contact) {
    const newContact = {
      id: `pc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      ...contact
    };
    this.data.personalContacts.push(newContact);
    this.save();
    return newContact;
  }

  deletePersonalContact(id, userId) {
    const idx = this.data.personalContacts.findIndex(c => c.id === id && c.user_id === userId);
    if (idx === -1) return false;
    this.data.personalContacts.splice(idx, 1);
    this.save();
    return true;
  }

  // --- SOS Telemetry ---
  logSos(sosData) {
    const record = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...sosData
    };
    this.data.sosLogs.unshift(record);
    this.save();
    return record;
  }

  // --- Audit & Metrics ---
  logAudit(auditData) {
    const entry = {
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...auditData
    };
    this.data.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  getMetrics() {
    return {
      totalUsers: this.data.users.length,
      totalLocations: this.data.locations.length,
      verifiedLocations: this.data.locations.filter(l => l.verification_status === 'verified').length,
      activePacks: this.data.offlinePacks.length,
      emergencyServicesCount: this.data.emergencyServices.length,
      totalGuides: this.data.guides.length,
      totalTransportRoutes: this.data.transportRoutes.length,
      recentSosEvents: this.data.sosLogs.slice(0, 10),
      recentAudits: this.data.auditLogs.slice(0, 15)
    };
  }
}

export const storage = new Storage();
