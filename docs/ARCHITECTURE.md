# NepaReady (नेपारेडी) — Architecture & Technical Specification

> **“Your Nepal. Always Ready.”**
> Offline-First Nepal Emergency, Navigation & Utility Progressive Web App (PWA)

---

## 1. System Overview & Product Architecture

NepaReady is designed to guarantee functionality in high-stakes, low-connectivity scenarios across Nepal (earthquakes, monsoon landslides, power cuts, remote rural travel, cellular blackouts).

### Three-Tier Tiered Resilience Model

```
┌─────────────────────────────────────────────────────────────┐
│                    NepaReady Client (PWA)                   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ UI Layer (React 19 + Tailwind CSS + Lucide Icons)   │   │
│   │ Language: English & Nepali (i18n)                   │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────┴──────────────────────────┐   │
│   │           Offline-First State & Cache Layer         │   │
│   │ ┌──────────────────────┐   ┌──────────────────────┐ │   │
│   │ │ IndexedDB (Dexie.js) │   │ CacheStorage / SW    │ │   │
│   │ │ Locations, Guides,   │   │ Static Shell, Icons, │ │   │
│   │ │ Packs, Contacts,     │   │ Map Assets, Fonts,   │ │   │
│   │ │ Transport, Saved     │   │ offline.html         │ │   │
│   │ └──────────────────────┘   └──────────────────────┘ │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ (Sync when online)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 NepaReady API Server (Node/Express)         │
│  REST API • JWT Auth • Rate Limiting • Verification Engine  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            PostgreSQL / Embedded Storage Layer              │
│ PostGIS-ready Schema • Verified Emergency Audit Log         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (PostgreSQL DDL)

Primary entities and relationships:

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin', 'verified_responder');
CREATE TYPE verification_status AS ENUM ('verified', 'community_submitted', 'under_review', 'deprecated');

-- Users & Roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_region VARCHAR(100) DEFAULT 'Koshi',
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Location Categories
CREATE TABLE location_categories (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'hospital', 'police', 'fire', 'pharmacy', 'atm', 'bus_stop', 'government'
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    priority INT DEFAULT 10
);

-- Locations
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) REFERENCES location_categories(id),
    name_en VARCHAR(255) NOT NULL,
    name_ne VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address_en VARCHAR(255),
    address_ne VARCHAR(255),
    phone VARCHAR(100),
    emergency_phone VARCHAR(100),
    operating_hours VARCHAR(100),
    description_en TEXT,
    description_ne TEXT,
    region VARCHAR(100) NOT NULL, -- e.g. 'Biratnagar', 'Dharan', 'Kathmandu', 'Pokhara'
    district VARCHAR(100),
    verification_status verification_status DEFAULT 'verified',
    verified_by VARCHAR(255) DEFAULT 'NepaReady Disaster Authority',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(255) DEFAULT 'Nepal Red Cross / MoHP / Nepal Police',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_locations_region ON locations(region);
CREATE INDEX idx_locations_category ON locations(category_id);
CREATE INDEX idx_locations_coords ON locations(latitude, longitude);

-- Emergency Services (Direct Dial)
CREATE TABLE emergency_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'police', 'fire', 'ambulance', 'disaster', 'armed_police', 'red_cross'
    title_en VARCHAR(255) NOT NULL,
    title_ne VARCHAR(255) NOT NULL,
    number VARCHAR(50) NOT NULL, -- '100', '101', '102', '1155', '1114'
    description_en TEXT,
    description_ne TEXT,
    priority INT DEFAULT 1,
    is_toll_free BOOLEAN DEFAULT true,
    region_scope VARCHAR(100) DEFAULT 'National', -- 'National', 'Koshi', 'Bagmati', etc.
    source VARCHAR(255) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Action Guides
CREATE TABLE guide_categories (
    id VARCHAR(50) PRIMARY KEY, -- 'earthquake', 'flood', 'fire', 'electrical', 'snake_bite', 'first_aid', 'landslide', 'weather'
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL
);

CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) REFERENCES guide_categories(id),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ne VARCHAR(255) NOT NULL,
    severity VARCHAR(20) DEFAULT 'critical',
    immediate_actions_en JSONB NOT NULL, -- [{ step: 1, title: 'DROP', desc: '...' }]
    immediate_actions_ne JSONB NOT NULL,
    after_actions_en JSONB NOT NULL,
    after_actions_ne JSONB NOT NULL,
    do_not_actions_en JSONB NOT NULL,
    do_not_actions_ne JSONB NOT NULL,
    when_to_seek_help_en TEXT,
    when_to_seek_help_ne TEXT,
    emergency_contacts JSONB DEFAULT '[]', -- ['102', '1155']
    authoritative_source VARCHAR(255) NOT NULL,
    is_published BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transport Routes & Stops
CREATE TABLE transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region VARCHAR(100) NOT NULL, -- e.g. 'Biratnagar', 'Kathmandu'
    route_number VARCHAR(50) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ne VARCHAR(255) NOT NULL,
    operating_hours VARCHAR(100),
    fare_info_en VARCHAR(255),
    fare_info_ne VARCHAR(255),
    geometry_geojson JSONB, -- LineString route coordinates
    stops_count INT DEFAULT 0,
    last_verified DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transport_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
    stop_name_en VARCHAR(255) NOT NULL,
    stop_name_ne VARCHAR(255) NOT NULL,
    sequence_order INT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

-- Offline Packs
CREATE TABLE offline_packs (
    id VARCHAR(100) PRIMARY KEY, -- 'biratnagar-koshi', 'dharan-koshi', 'itahari-koshi', 'kathmandu-valley', 'pokhara-gandaki'
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    size_mb NUMERIC(5, 1) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description_en TEXT,
    description_ne TEXT,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    zoom_level INT DEFAULT 13,
    bounding_box JSONB, -- [minLat, minLng, maxLat, maxLng]
    is_active BOOLEAN DEFAULT true,
    last_updated DATE DEFAULT CURRENT_DATE
);

-- User Saved Places & Emergency Contacts (Local-First Synced)
CREATE TABLE saved_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL, -- 'Home', 'Work', 'Family', 'Hospital'
    custom_name VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE personal_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. REST API Specification

### Authentication & User
* `POST /api/auth/register` — Create user account with name, email, password, optional phone.
* `POST /api/auth/login` — Authenticate and receive JWT + profile.
* `GET  /api/auth/me` — Verify token and get current user profile.
* `PUT  /api/user/profile` — Update user preferences (preferred region, phone).

### Emergency Services & SOS
* `GET  /api/emergency` — Get verified national & regional emergency dispatch numbers.
* `POST /api/emergency/log-sos` — Log non-blocking SOS activation telemetry (coordinates, timestamp).

### Locations & Directory
* `GET  /api/locations` — Filter by category, region, query, verification status.
* `GET  /api/locations/categories` — Get category list with icons and metadata.
* `GET  /api/locations/:id` — Single location details.

### Action Guides
* `GET  /api/guides` — List disaster response & first aid guides.
* `GET  /api/guides/:slug` — Full step-by-step action guide details.

### Offline Packs
* `GET  /api/offline-packs` — List available regional offline packs with sizes & versions.
* `GET  /api/offline-packs/:id` — Pack metadata & contents summary.
* `GET  /api/offline-packs/:id/download` — Full bundled package payload (GeoJSON boundary, locations, emergency services, guides, transport).

### Transport & Travel Mode
* `GET  /api/transport/routes` — Get routes by city/region.
* `GET  /api/transport/travel-pack?from=Biratnagar&to=Pokhara` — Recommended multi-city offline bundle.

### Saved Places & Personal Contacts
* `GET    /api/saved-places` — List user's saved places.
* `POST   /api/saved-places` — Create saved place.
* `DELETE /api/saved-places/:id` — Delete saved place.
* `GET    /api/personal-contacts` — List personal emergency contacts.
* `POST   /api/personal-contacts` — Add contact.
* `DELETE /api/personal-contacts/:id` — Delete contact.

### Admin Endpoints (Protected: role = 'admin')
* `GET    /api/admin/metrics` — Aggregate downloads, verified locations, user count.
* `POST   /api/admin/locations` — Create verified emergency/public location.
* `PUT    /api/admin/locations/:id` — Update location & verification metadata.
* `DELETE /api/admin/locations/:id` — Delete location.
* `POST   /api/admin/guides` — Create or update emergency preparedness guide.
* `POST   /api/admin/offline-packs` — Build and publish new pack version.

### Healthcheck
* `GET  /api/health` — Ultra-lightweight endpoint (`{ status: "ok", timestamp: ... }`) used by client connection watcher to confirm real internet egress.

---

## 4. Component Hierarchy

```
App (Router + AuthProvider + OfflineSyncProvider + LanguageProvider)
├── Header (Logo, ConnectionStatus, GPSIndicator, DemoBadge, LangSwitch, AuthMenu)
├── BottomNavigation (Mobile: Home, Map, Emergency, Guides, Profile)
├── AppRoutes
│   ├── HomePage
│   │   ├── StatusHero (Offline Pack status, Connection indicator)
│   │   ├── EmergencyActionBar (1-tap Police, Fire, Ambulance, SOS)
│   │   ├── QuickAccessCards (Offline Map, Emergency, Find Help, Guides)
│   │   ├── DownloadedPacksSummaryCard
│   │   └── DisasterAlertBanner
│   ├── MapPage
│   │   ├── MapContainer (Leaflet with custom offline tile fallback)
│   │   ├── CategoryFilterPills (Hospital, Police, Fire, Pharmacy, Bus, etc.)
│   │   ├── MapSearchBar
│   │   ├── LocationDetailsDrawer / BottomSheet
│   │   └── StraightLineCompassOverlay (Active when routing offline)
│   ├── EmergencyPage
│   │   ├── HighUrgencyEmergencyGrid (100, 101, 102, 1155, 1114)
│   │   ├── VerifiedSourceNotice ("Last verified: 2026-09-25")
│   │   └── PersonalEmergencyContactsSection
│   ├── SOSPage
│   │   ├── LocationCoordinatesCard (Lat, Long, Accuracy, Altitude)
│   │   ├── OneTapDispatchButtons
│   │   ├── ShareEmergencyLocationButton (Web Share API / SMS template)
│   │   └── StrobeSirenSimulationTool
│   ├── NearbyHelpPage (Find Help)
│   │   ├── DistanceSortControls
│   │   └── LocationCardList (Call, Directions, Verified Badge)
│   ├── GuidesPage
│   │   ├── GuideCategoriesGrid
│   │   ├── SearchableGuideList
│   │   └── GuideViewer (Drop Cover Hold On action steps, Do Not list)
│   ├── OfflinePacksPage
│   │   ├── StorageMeter (Available IndexedDB storage vs used)
│   │   ├── RegionalPackList (Biratnagar, Dharan, Itahari, Kathmandu, Pokhara)
│   │   └── PackDownloadModal (Progress bar with realistic chunking)
│   ├── TransportPage
│   │   ├── CitySelector
│   │   ├── RouteCard
│   │   └── StopTimelineView
│   ├── TravelModePage
│   │   ├── OriginDestinationSelector
│   │   └── RecommendedBundleCard
│   ├── ProfilePage
│   │   ├── UserDetailsCard
│   │   ├── SavedPlacesManager
│   │   └── PersonalContactsManager
│   ├── AdminDashboardPage
│   │   ├── MetricCounters
│   │   ├── LocationManagementTable & Modal
│   │   ├── GuideManagementTable & Modal
│   │   └── PackBuilderTool
│   └── OfflineFallbackPage (Service Worker cached)
```

---

## 5. Offline Data Strategy (IndexedDB & CacheStorage)

1. **Static Assets**:
   - `sw.js` precaches `index.html`, `/offline.html`, JS bundles, CSS, fonts, SVG icons, and essential Leaflet CSS/markers.
2. **IndexedDB (Dexie.js database name: `nepaready_db`)**:
   - Store `locations`: Indexed by `id, category_id, region, [latitude+longitude]`
   - Store `emergency_services`: Indexed by `id, category, priority`
   - Store `guides`: Indexed by `id, slug, category_id`
   - Store `transport_routes`: Indexed by `id, region, route_number`
   - Store `downloaded_packs`: Indexed by `id, version, downloaded_at`
   - Store `saved_places`: Indexed by `id, user_id`
   - Store `personal_contacts`: Indexed by `id, user_id`
3. **Pack Downloading Lifecycle**:
   - Client requests `/api/offline-packs/:id/download`.
   - Streaming or chunked download records progress: `Downloaded X of Y MB (Z%)`.
   - Payload expands into Dexie IndexedDB tables in an atomic transaction.
   - Sets local pack status to `Downloaded ✓`.
   - UI Connection Status updates to `🟢 Offline Ready`.
4. **Offline Search**:
   - Tokenized in-memory / IndexedDB index searches titles, categories, addresses, and guide content with zero network calls.

---

## 6. Authentication & Permissions

- Anonymous Mode (Zero Auth):
  - Emergency call buttons, SOS screen, downloaded offline maps, nearby help search, and emergency action guides work **100% offline without creating an account or logging in**.
- Registered User:
  - Synchronizes personal saved places (Home, Work) and personal emergency contacts to the cloud when online.
- Administrator:
  - Role check `role === 'admin'`.
  - Grants access to `/admin` dashboard for verified location management, guide editing, and pack bundle releases.

---

## 7. Progressive Web App (PWA) Implementation

- Web App Manifest:
  - `name`: NepaReady
  - `short_name`: NepaReady
  - `theme_color`: `#0B192C`
  - `background_color`: `#0B192C`
  - `display`: `standalone`
  - `icons`: Scalable SVG + PNG icons
- Service Worker:
  - Navigation preload and offline fallback to `offline.html` if unchached route is accessed without network.
  - Runtime caching for map tile fallbacks and icons.
