# GA4 Integration Plan

## Note on the env variable

Vite only exposes env vars to the browser when prefixed with `VITE_`. A bare `GA_MEASUREMENT_ID` won't be readable client-side. I'll use **`VITE_GA_MEASUREMENT_ID`** (you set it in your hosting env, e.g. `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`). If unset, GA simply no-ops — no errors, no broken pages.

## What gets built

1. **New file: `src/lib/analytics.ts`**
   - Reads `import.meta.env.VITE_GA_MEASUREMENT_ID`
   - `initGA()` — injects `https://www.googletagmanager.com/gtag/js?id=<ID>` async into `<head>` exactly once, sets up `window.dataLayer` + `gtag()`, calls `gtag('config', ID, { send_page_view: false })` (we send page_views manually for SPA accuracy)
   - `trackPageView(path)` — fires `gtag('event', 'page_view', { page_path, page_location, page_title })`
   - TypeScript declarations for `window.gtag` / `window.dataLayer`

2. **New component: `src/components/AnalyticsTracker.tsx`**
   - Mounted inside `<BrowserRouter>` (so `useLocation` works)
   - On mount: calls `initGA()`
   - On every `location.pathname + location.search` change: calls `trackPageView()`
   - Renders nothing

3. **Edit `src/App.tsx`**
   - Mount `<AnalyticsTracker />` inside `<AppContent />` (already inside `BrowserRouter`)

## Why this approach

- **Async loading** — gtag.js is injected with `script.async = true`, no render blocking
- **SPA-aware** — `send_page_view: false` on config + manual `page_view` events on every route change avoids the common GA4 SPA double-count / missed-route bug
- **Global** — single mount point covers every route
- **Safe** — if `VITE_GA_MEASUREMENT_ID` is missing, all functions early-return; no console errors

## Files

- create `src/lib/analytics.ts`
- create `src/components/AnalyticsTracker.tsx`
- edit `src/App.tsx` (one-line mount)

## After approval

You'll need to add `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in your project env (Lovable Project Settings → Environment, or your deploy host) and republish for it to take effect.
