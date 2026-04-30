# Plan: GA4 (consent-gated) + GDPR banner + SEO refresh

## Overview

Three coordinated changes:

1. Replace the current direct gtag.js integration with `react-ga4`, gated behind explicit cookie consent.
2. Rewrite `CookieConsent` to a GDPR-compliant Accept All / Reject banner that controls GA4 initialization.
3. Refresh `public/sitemap.xml` (add `lastmod`) and confirm `public/robots.txt` allows GPTBot, Googlebot, Bingbot.

Measurement ID stays `G-4PD1ZKK0YD` (already provided), read from `VITE_GA_MEASUREMENT_ID` with that as the fallback. Debug mode via `VITE_GA_DEBUG=true`.

## Notes on requirements vs. existing project

- The project already has a `CookieConsent` banner with 4 categories (essential/analytics/personalization/marketing) saved under `naft-cookie-consent`. The new spec calls for a simpler Accept All / Reject pair stored under `cookie_consent`. **Plan: keep the rich preferences modal but change the primary banner to the spec'd Accept All / Reject buttons, write the simple `cookie_consent` key (`"accepted" | "rejected"`) for GA gating, and keep the existing `naft-cookie-consent` JSON for the granular preferences.** This preserves current behavior while satisfying the new GA-gating contract.
- Routes in the spec (`/services`, `/blog`) don't exist here. Sitemap will use the project's actual routes (already in `public/sitemap.xml`) and just add `lastmod`.
- Current `index.html` hard-loads gtag.js unconditionally. That must be **removed** so GA truly does not load before consent.
- Domain in robots.txt/sitemap will use the published domain `https://fugazi.lovable.app` (current sitemap uses `naftreview.lovable.app` — will update to `fugazi.lovable.app` since that is the live published URL).

## Changes

### 1. Dependency

- Add `react-ga4` via package install.

### 2. `index.html`

- Remove the inline `<script async src=".../gtag/js?id=G-4PD1ZKK0YD">` block and the inline `gtag('config', ...)` script. GA must not load until consent.

### 3. `src/lib/analytics.ts` (rewrite)

- Switch to `react-ga4`.
- Export:
  - `MEASUREMENT_ID` (env or `G-4PD1ZKK0YD` fallback)
  - `GA_DEBUG` (`import.meta.env.VITE_GA_DEBUG === "true"`)
  - `hasConsent()` — reads `localStorage.cookie_consent === "accepted"`
  - `initGA()` — no-op if already initialized, no consent, or no ID; otherwise calls `ReactGA.initialize(MEASUREMENT_ID, { gaOptions: { send_page_view: false }, testMode: false })` and logs in debug mode.
  - `trackPageView(path)` — `ReactGA.send({ hitType: "pageview", page, title })` only if initialized + consent; debug log.
  - `trackEvent(name, params)` — `ReactGA.event(name, params)` only if initialized + consent; debug log.
  - `resetGA()` — for "Reject" path, clears initialized flag.

### 4. `src/components/AnalyticsTracker.tsx`

- Listen for the custom `cookie-consent-changed` event (dispatched by the banner) and call `initGA()` when consent flips to accepted.
- On mount: try `initGA()` (will no-op without consent).
- On `useLocation()` change: call `trackPageView(pathname + search)`.

### 5. `src/hooks/useTrackEvent.ts` (new)

```ts
export const useTrackEvent = () => {
  return useCallback((name: string, params?: Record<string, any>) => {
    trackEvent(name, params ?? {});
  }, []);
};
```

Type-safe signature: `(eventName: string, params?: Record<string, unknown>) => void`.

### 6. `src/components/CookieConsent.tsx` (rewrite)

- Banner buttons: **Accept All**, **Reject**, **Manage** (opens existing preferences modal).
- On Accept All: write `localStorage.cookie_consent = "accepted"`, also store the granular `naft-cookie-consent` JSON with all true. Dispatch `window.dispatchEvent(new Event("cookie-consent-changed"))`.
- On Reject: write `localStorage.cookie_consent = "rejected"`, granular JSON with only essential. Dispatch event. Do **not** init GA.
- Visibility logic uses the new `cookie_consent` key (banner hidden once it's set to either value).
- Tailwind styling stays consistent with current dark/light/sentinel themes (uses `bg-card`, `border-border`, `text-foreground`).

### 7. Footer "Cookie Settings" entry

- `src/components/layout/Footer.tsx` already links to `/cookies`. Add an additional "Cookie Settings" anchor in the bottom row that dispatches a `window.dispatchEvent(new Event("open-cookie-settings"))`. `CookieConsent` will listen and re-show the banner/preferences modal so users can change consent later.

### 8. `public/robots.txt`

- Already allows Googlebot, Bingbot, `*`. Add explicit `GPTBot` allow block. Update sitemap URL to `https://fugazi.lovable.app/sitemap.xml`.

### 9. `public/sitemap.xml`

- Update domain to `https://fugazi.lovable.app`.
- Add `<lastmod>2026-04-30</lastmod>` to every `<url>`.
- Keep current route list (matches actual app routes).

### 10. `src/App.tsx`

- No structural change; `AnalyticsTracker` and `CookieConsent` remain mounted.

## Files

- modify: `package.json` (add `react-ga4`)
- modify: `index.html` (remove unconditional gtag scripts)
- rewrite: `src/lib/analytics.ts`
- modify: `src/components/AnalyticsTracker.tsx`
- create: `src/hooks/useTrackEvent.ts`
- rewrite: `src/components/CookieConsent.tsx`
- modify: `src/components/layout/Footer.tsx` (Cookie Settings trigger)
- modify: `public/robots.txt` (GPTBot + domain)
- modify: `public/sitemap.xml` (domain + lastmod)

## Acceptance

- Fresh visitor sees banner; no request to `googletagmanager.com` in network tab until "Accept All" clicked.
- After Accept: GA4 initializes, `page_view` fires on every route change, `trackEvent` works from `useTrackEvent`.
- After Reject: no GA requests for the session; banner stays hidden.
- `VITE_GA_DEBUG=true` logs `[GA4] init`, `[GA4] pageview <path>`, `[GA4] event <name>` to console.
- `/sitemap.xml` and `/robots.txt` resolve at site root with updated domain and `lastmod` dates.
