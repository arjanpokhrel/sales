# 🇳🇵 NepaReady (नेपारेडी) — Your Nepal. Always Ready.

> **Offline-first Nepal emergency, navigation, and utility Progressive Web App (PWA).**
> Built specifically to provide critical life-saving information, maps, emergency contacts, and disaster action guides across Nepal even when cellular or WiFi internet disappears.

---

## 📑 Table of Contents

- [Core Principles & Problem Solved](#-core-principles--problem-solved)
- [Key Features](#-key-features)
- [Connection States & Technology Stack](#-connection-states--technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Variables](#-environment-variables)
- [Database Setup & Migrations](#-database-setup--migrations)
- [Verified Emergency Directory](#-verified-emergency-directory)
- [Offline Architecture & PWA Testing](#-offline-architecture--pwa-testing)
- [Demo Mode Walkthrough](#-demo-mode-walkthrough)
- [Admin Console & Credentials](#-admin-console--credentials)
- [Automated Testing](#-automated-testing)
- [Production Deployment](#-production-deployment)

---

## 🎯 Core Principles & Problem Solved

Nepal experiences severe geographic and infrastructural vulnerabilities:
- High seismic risk across the Main Himalayan Thrust.
- Annual monsoon floods, cloudbursts, and landslides blocking mountain highways.
- Power cuts and cellular data blackout during crisis moments.

Most standard websites completely fail once connection drops. **NepaReady is engineered offline-first**:
1. **The app remains 100% useful when the internet disappears.**
2. Real local storage using **Service Workers**, **CacheStorage**, and **IndexedDB (Dexie.js)**.
3. Pre-downloadable **Offline Regional Packs** (Biratnagar, Dharan, Itahari, Kathmandu Valley, Pokhara).
4. Authoritative verified phone numbers with one-tap direct calling via GSM cellular (`tel:` protocol).

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| 🚨 **Emergency Direct Dial** | 1-tap toll-free calling to Nepal Police (`100`), Fire (`101`), Ambulance (`102`), NEOC Disaster Operations (`1155`), and Armed Police (`1114`). |
| 🗺️ **Offline Map & Directory** | OpenStreetMap integration with offline regional boundaries, hospital markers, and straight-line compass bearing routing when disconnected. |
| 📦 **Offline Regional Packs** | Download complete municipal packs with storage usage indicators, versioning, and download progress tracking. |
| 🆘 **Emergency SOS Mode** | Broadcasts live GPS coordinates (Lat, Long, Accuracy, Altitude) via SMS/WhatsApp and features an offline acoustic distress siren. |
| 🏥 **Nearby Help Finder** | Filters hospitals, pharmacies, police stations, and transit hubs sorted by real-time distance. |
| 🧰 **Emergency Guides** | Step-by-step disaster preparedness protocols: Earthquake (*Drop, Cover, Hold On*), Snake Bite First Aid, Floods, Fires, Landslides. |
| 🚌 **Public Transport** | Fixed routes, stops timeline, municipal fare tables, and operating hours for major cities. |
| 🧳 **Travel Mode** | Recommends complete multi-city offline bundles prior to departure (e.g. Biratnagar to Pokhara). |
| 🌐 **Bilingual (English & नेपाली)** | Instant language switcher throughout the entire platform. |
| 🛠️ **Protected Admin Panel** | Manage emergency facilities, assign official verification tags, and build offline packs. |

---

## 📶 Connection States & Technology Stack

NepaReady distinguishes three primary operational states:

- 🟢 **Online**: Live synchronization with backend server active.
- 🔴 **Offline**: Internet connection lost; browsing local app shell.
- 🟢 **Offline Ready**: Offline with a downloaded regional pack active (e.g. *Offline Ready: Biratnagar*).

### Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet, Dexie.js (IndexedDB wrapper).
- **Offline / PWA**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`), CacheStorage, `offline.html` fallback.
- **Backend**: Node.js v24, Express, REST API, JWT Authentication, bcryptjs, Morgan logging.
- **Database**: Dual-mode engine supporting PostgreSQL with PostGIS schemas (`database/migrations/001_initial_schema.sql`) and a zero-configuration persistent storage engine for local demo.

---

## 📁 Project Directory Structure

```text
nepready/
├── client/                     # Mobile-first React PWA Client
│   ├── public/
│   │   ├── logo.svg            # Mountain + Shield + Pin SVG Brand
│   │   ├── manifest.webmanifest# PWA Manifest
│   │   ├── sw.js               # Service Worker
│   │   └── offline.html        # Fallback offline page
│   ├── src/
│   │   ├── components/         # Reusable modular UI components
│   │   ├── context/            # Language, Network, Auth providers
│   │   ├── i18n/               # English & Nepali translation dictionary
│   │   ├── offline/            # Dexie.js IndexedDB storage engine
│   │   ├── pages/              # 10 core pages (Home, Map, Emergency, SOS, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Node/Express API Server
│   ├── src/
│   │   ├── config/             # Config & environment reader
│   │   ├── database/           # Persistent storage & seed data
│   │   ├── middleware/         # JWT auth & admin guard
│   │   ├── routes/             # REST API endpoints
│   │   └── index.js            # Express bootstrap & static server
│   └── package.json
│
├── database/                   # Database migrations and DDL
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── tests/                      # Full-stack automated verification suite
│   └── nepready.test.js
│
├── docs/                       # Architecture specifications
│   └── ARCHITECTURE.md
│
├── .env.example
├── package.json                # Root workspace configuration
└── README.md
```

---

## 🚀 Getting Started & Installation

### Prerequisites

- Node.js (v18 or higher; tested on Node.js v24)
- npm (v9 or higher)

### 1. Clone & Install Dependencies

```bash
git clone <repository_url> nepready
cd nepready
npm install
```

### 2. Environment Configuration

Copy `.env.example` into `server/.env`:

```bash
cp .env.example server/.env
```

### 3. Run Development Server

To run both backend API (port 5000) and frontend Vite server (port 5173) concurrently:

```bash
npm run dev
```

Visit the application at:
- Frontend (Vite HMR): **`http://localhost:5173`**
- Backend API / Unified PWA: **`http://localhost:5000`**

---

## 🔑 Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection URL (optional in local dev) | `postgresql://postgres:postgres@localhost:5432/nepready` |
| `JWT_SECRET` | Secret key for JWT session tokens | `nepready_secret_dev_key_nepal_ready_2026` |
| `CLIENT_URL` | Allowed client origin for CORS | `http://localhost:5173` |

---

## 🗄️ Database Setup & Migrations

For production PostgreSQL deployments with PostGIS:

```bash
psql -U postgres -d nepready -f database/migrations/001_initial_schema.sql
```

*Note: For out-of-the-box evaluation without a running PostgreSQL daemon, the backend automatically initializes an embedded JSON-backed persistent store (`server/data/nepready_store.json`) with pre-seeded verified Nepal emergency data.*

---

## ☎️ Verified Emergency Directory

Every production emergency number in NepaReady is cross-verified against official government sources:

| Service | Number | Scope | Authoritative Source | Verification Date |
| :--- | :--- | :--- | :--- | :--- |
| **Nepal Police (नेपाल प्रहरी)** | `100` | National (Toll-Free) | Nepal Police Headquarters, Naxal | 2026-09-25 |
| **Fire Brigade (दमकल)** | `101` | National (Toll-Free) | Department of Fire Services, Nepal | 2026-09-25 |
| **Ambulance (एम्बुलेन्स)** | `102` | National (Toll-Free) | Nepal Red Cross Society & MoHP | 2026-09-25 |
| **Disaster Center (NEOC)** | `1155` | Disaster Operations | Ministry of Home Affairs / NDRRMA | 2026-09-25 |
| **Armed Police Force (सशस्त्र)** | `1114` | Search & Rescue | Armed Police Force HQ, Halchowk | 2026-09-25 |
| **Child Helpline (बाल हेल्पलाइन)** | `1098` | Child Protection | CWIN Nepal / National Child Rights Council | 2026-09-25 |
| **Traffic Police (ट्राफिक)** | `103` | Road Safety & Clearance | Nepal Traffic Police Directorate | 2026-09-25 |

---

## 🔌 Offline Architecture & PWA Testing

### How It Works Offline

1. **Service Worker Pre-caching**: Automatically precaches HTML shell, SVG logo, CSS, and JS.
2. **IndexedDB (Dexie.js)**: When a user clicks **Download Pack** on Biratnagar or Kathmandu, the bundle payload is stored into IndexedDB tables (`locations`, `guides`, `emergency_services`, `transport_routes`).
3. **No-Network Fallback**: When the browser goes offline, all queries directly query IndexedDB without network requests.

### Testing PWA Offline Mode

You can test offline capabilities in two ways:

#### Option A: Built-in Demo Mode (Zero Disconnection)
1. Click the **Simulate Offline** button in the top navigation header.
2. The app cuts simulated API egress. Observe the status bar turn to **🔴 You are offline** or **🟢 Offline Ready (Biratnagar)**.
3. Open the offline map, search for `"hospital"`, open the Earthquake guide, or view emergency numbers — all work instantly.

#### Option B: Browser DevTools Offline Emulation
1. Open Google Chrome DevTools (`F12`).
2. Navigate to the **Network** tab.
3. Change throttling from *No throttling* to **Offline**.
4. Refresh or navigate the app — the Service Worker serves the application and IndexedDB delivers data.

---

## 🧪 Demo Mode Walkthrough

To demonstrate the full offline lifecycle during a presentation:
1. **Online State**: Open `http://localhost:5000/`. Confirm top status shows `🟢 Online`.
2. **Download Pack**: Navigate to **Offline Packs**, select **Biratnagar (48 MB)**, and click **Download Pack**. Observe progress bar reach 100%.
3. **Turn Off Network**: Click **Simulate Offline** in the header banner. Notice connection state transition to `🟢 Offline Ready (Biratnagar)`.
4. **Offline Map**: Go to **Map**. Notice Biratnagar regional facilities appear with categories.
5. **Search**: Search `"Nobel"` or `"snake bite"` in the search bar. Real local IndexedDB search results appear.
6. **Guides**: Open the **Earthquake Guide**. Review immediate action steps (*01 DROP, 02 COVER, 03 HOLD ON*) and DO NOT warnings.
7. **Emergency SOS**: Open **SOS**. View exact GPS coordinates and trigger the audio distress siren.

---

## 🛡️ Admin Console & Credentials

The admin dashboard is protected via JWT role verification:

- **URL**: `/admin`
- **Email**: `admin@nepready.org.np`
- **Password**: `Admin@NepaReady2026`

Admin privileges allow:
- Creating and editing verified hospital, police, and pharmacy records.
- Toggling `✓ Verified` and `⚠️ Community Submitted` statuses.
- Generating and publishing regional offline pack versions.
- Reviewing real-time emergency telemetry logs.

---

## 🧪 Automated Testing

Run the automated verification suite:

```bash
npm run test
```

Verifies:
- Healthcheck and API connectivity
- JWT user registration, login, and profile validation
- Role-based authorization and security blocks
- Verified national emergency phone numbers
- Category-based hospital filtering
- Step-by-step disaster guide structures
- Offline pack bundle packaging
- PWA manifest and offline HTML fallback availability

---

## 🚢 Production Build & Deployment

To compile the production-ready client bundle:

```bash
npm run build
```

The compiled assets will be placed in `client/dist`. The Node.js Express server automatically serves this directory in production when visiting `http://localhost:5000/`.

---

## 📜 License

MIT License. Designed and built with dedication for the resilience, safety, and preparedness of the people of Nepal. 🇳🇵
