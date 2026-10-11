# Data completeness report — NepaReady v2.0 (2026-10-11)

Generated from the live `/api/packages/manifest` endpoint and the repo.
Nothing below is estimated: every number was read from the built artifacts.

## Bundled (ships with the app, works on first open, zero downloads)

| Dataset | Count / size | Source & license |
|---|---|---|
| Provinces | 7 | Constitution of Nepal 2015 |
| Districts | 77 (14+8+13+11+12+10+9) | MoFA district lists |
| Destinations | 18, with EN+NE names, categories, approx coords | OSM place nodes (rounded); individual `verified` flags in data |
| Emergency numbers | 8 (100, 101, 102, 1155, 1114, 103, 1098, 021-460111) | Nepal Police / NEOC public listings, verified 2026-10-11 |
| Real photos | 16 files, 6.3 MB | Wikimedia Commons (CC BY-SA 2.5–4.0); per-file author+license+source URL in `client/public/photos/attribution.json` and in-app Attribution page |
| Disaster guides | 6 (earthquake, flood, landslide, fire, snake-bite, first-aid) | bundled seed |
| Transport routes | 3 regional routes | bundled seed |
| App bundle | `client/dist` ≈ 7.2 MB total (JS/CSS ≈ 0.8 MB + photos 6.3 MB) | measured `du` |

## Downloadable while online (retained offline)

- 5 regional data packs (Biratnagar, Dharan, Itahari, Kathmandu Valley, Pokhara)
  via `/api/offline-packs/:id/download`, integrity-checked per pack.
- “Download All Nepal Data” stamps manifest `nepal-full-2026-10` with
  per-pack completion + failed-item list (partial state is reported, never hidden).

## Honestly missing / limited

1. **Municipality & ward data** — not bundled (district level only). The UI says so
   on Province pages and in the manifest (`municipalities_note`).
2. **Map tiles** — cached only for areas the user actually views (OSM tile
   policy forbids bulk scraping). The Download All screen and Help page state
   this explicitly. No offline routing graph exists: distances are labelled
   straight-line approximations; full routing needs internet (OSM link provided).
3. **Hotels/restaurants** — no verified commercial directory; the Stays page
   refuses to invent listings and shows saved stays + guidance instead.
4. **2 destinations (Pathibhara, Gosaikunda)** ship without photos — they show
   an explicit image-unavailable state, not a placeholder.
5. **District Nepali names** omitted (null) pending verification.
6. **No APK artifact** — Android project is scaffolded/synced but no SDK exists
   in this environment, so no APK was built or claimed (see `docs/android-build.md`).
7. **No public web URL** — deployment not performed; no URL claimed
   (see `docs/deployment.md`).

## Verification run (2026-10-11)

- `npm test` (server running): **16/16 pass** (10 existing + 6 new:
  province/district counts, destination structure+coord bounds, manifest,
  photo files on disk, Android package id, new routes in bundle).
- `vite build`: clean in ~8s.
- `cap sync android`: plugins (app, preferences, status-bar) synced;
  `applicationId np.nepaready.app`, `app_name NepaReady` confirmed in project.
