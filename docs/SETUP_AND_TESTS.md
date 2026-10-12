# Setup, dataset inventory & test results — Nepal Navigator

## 1. Setup (developer machine)

```bash
git clone <repo> && cd nepready
npm install                  # root + workspaces (server, client)
cp .env.example server/.env  # optional; server runs without it
npm run dev                  # API :5000 + web :5173 (concurrent)
```

Production web bundle + dataset export in one step:

```bash
npm run build    # export-bundled-data → vite build → client/dist/
npm test         # needs the API on :5000 (start it: npm start)
```

Android (needs JDK 17+ and the Android SDK, `ANDROID_HOME` set):

```bash
cd client && npm run build && npx cap sync android
cd android && ./gradlew assembleDebug   # → app/build/outputs/apk/debug/
```

## 2. Dataset inventory (what ships inside the app)

| Dataset | Records / size | Origin & licence | Offline? |
|---|---|---|---|
| Provinces + 77 districts | 7 / 77 | Constitution of Nepal; MoFA lists | Yes, bundled |
| Destinations | 18 + EN/NE, coords | OSM place nodes (rounded, approx) | Yes, bundled |
| Directory places | 37 (21 hospitals, 11 police, fire/pharmacy/transport) | Server seed: verified + honestly-flagged approximate pins | Yes, bundled (`data/locations.json`, auto-seeded) |
| Emergency numbers | 8 (100/101/102/1155/1114/103/1098/021-460111) | Nepal Police / NEOC, verified 2026-10-11 | Yes, bundled |
| Disaster guides | 6 (EN+NE steps) | Bundled seed | Yes, bundled |
| Transport routes | 3 regional | Bundled seed | Yes, bundled |
| Photos | 16 files, ~12 MB HD | Wikimedia Commons CC BY-SA (per-file credit in Attribution + `photos/attribution.json`) | Yes, bundled |
| Fonts | Inter + Noto Sans Devanagari, ~0.6 MB | Google Fonts (OFL) | Yes, bundled |
| Map base tiles | Cached on view only | © OpenStreetMap contributors, tile policy respected (no bulk) | Viewed areas only |
| Live directory (hospitals, police, schools, fuel, food, hotels…) | On-demand, ≤60/query | Overpass API / OSM (unverified, badged LIVE) | No — online only |
| Routing graph / turn-by-turn | — | Not bundled | No — straight-line plans only, labelled as such |
| Satellite imagery | — | No redistributable source packaged | Not included |
| Municipalities/wards | — | Not bundled (district level) | Documented gap |

Total install payload: web `dist/` ≈ 14 MB; debug APK ≈ 18 MB.

## 3. Test results

- `npm test` (API running): **16/16 pass** — auth, emergency, locations
  (verified + approximate model), guides, packs, transport, provinces (7/77),
  destinations (18, coord bounds), manifest, bundled photo files, Android
  package id + label, new routes present in the bundle.
- `vite build`: clean (~9 s). `cap sync android`: clean.
- Release APK: `apksigner verify` must print `Verified using v1/v2 scheme` —
  see `docs/DATA_COMPLETENESS.md` §6 for the verified artifact record.
- Offline acceptance (do on a phone): install APK → open once (seeds data) →
  **airplane mode ON** → reopen → map (previously viewed tiles), search,
  place details, photos, emergency, bookmarks must all work. Live directory,
  live tiles and OSM links honestly require internet.

## 4. Privacy

No account, no analytics SDKs, no tracking. GPS is consumed on-device only
(map + distances); coordinates are saved only as an anonymous
last-known-position on the device itself. No location ever leaves the phone
except user-initiated actions (SOS share, opening an OSM link).
