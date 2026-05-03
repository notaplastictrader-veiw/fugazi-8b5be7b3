# Plan: Make NAFT installable on mobile (manifest-only PWA)

Goal: Users can "Add to Home Screen" on iPhone/Android and get a standalone app window with the NAFT candlestick icon — no service worker, no offline caching, no editor preview interference.

## What gets added

1. **`public/manifest.webmanifest`** — Web app manifest with:
   - `name`: "Not A Fugazi — Broker Reviews & Signals"
   - `short_name`: "NAFT"
   - `start_url`: "/"
   - `scope`: "/"
   - `display`: "standalone"
   - `orientation`: "portrait"
   - `theme_color`: dark theme charcoal (`#0a0a0a`)
   - `background_color`: `#0a0a0a`
   - `icons`: 192px, 512px (any), 512px (maskable), Apple touch icon
   - `categories`: ["finance", "business"]
   - `lang`: "en"

2. **PWA icons in `public/icons/`** — generated from `public/images/naft-candlestick-dark-lime.svg`:
   - `icon-192.png` (192x192, any)
   - `icon-512.png` (512x512, any)
   - `icon-512-maskable.png` (512x512, maskable, with safe-area padding on dark bg)
   - `apple-touch-icon.png` (180x180, dark bg, no transparency — iOS requirement)

3. **`index.html`** updates in `<head>`:
   - `<link rel="manifest" href="/manifest.webmanifest">`
   - `<meta name="theme-color" content="#0a0a0a">`
   - `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
   - `<meta name="apple-mobile-web-app-title" content="NAFT">`
   - `<meta name="mobile-web-app-capable" content="yes">`

## What is NOT added (intentional)

- No `vite-plugin-pwa`
- No `sw.js` / service worker
- No offline caching
- No install-prompt page (browser handles it natively via "Add to Home Screen")

## Technical notes

- Icons generated with ImageMagick from the existing SVG, composited on the dark theme background (`#0a0a0a`) so the lime candlestick stays visible on iOS (which doesn't honor transparency for home-screen icons).
- Maskable icon uses ~20% safe-area padding so Android adaptive-icon masks don't crop the candlestick.
- No changes to React code, routing, or existing analytics/consent logic.

## How users install after this ships

- **iPhone (Safari)**: Share button → "Add to Home Screen"
- **Android (Chrome)**: Browser menu → "Install app" or "Add to Home Screen"

Install only works on the **published** site (`fugazi.lovable.app`), not the editor preview iframe — that's a browser limitation, not something we can change.
