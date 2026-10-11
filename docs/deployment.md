# Web / PWA deployment — NepaReady

The web app is a static Vite build (`client/dist/`) plus an optional Node API.
No deployment has been performed from here, and **no public URL is claimed**.
Deploy with the steps below; only then write the real URL into this file.

## Option A — static PWA only (recommended start)

Any static host works: Cloudflare Pages, Netlify, GitHub Pages, nginx.

```bash
cd client
npm install
npm run build
# deploy the client/dist/ directory as-is
```

- `dist/sw.js` + `dist/manifest.webmanifest` + `dist/offline.html` make it
  installable and offline-capable. Serve over **HTTPS** (required for SW/PWA).
- Custom domain: point DNS at the host, add the domain in the host dashboard,
  wait for its automatic TLS certificate. No app change needed.

## Option B — web + API on one server

```bash
npm install
cd client && npm install && npm run build && cd ..
PORT=5000 node server/src/index.js   # serves API + client/dist together
```

Copy `.env.example` to `server/.env` first. `DATABASE_URL` is optional
(the server runs a zero-config file store when unset).

## Verifying offline after deploy

1. Open the deployed URL, install the PWA (browser menu → Install).
2. Open **Download All Nepal Data**, download everything.
3. Enable airplane mode, reload — map (cached areas), search, destinations,
   photos, emergency and bookmarks must all work.

## Deployed URL

_Not deployed yet — paste the real URL here after publishing._
