## Problem

Google Search Console reports `/brokers/goldfx-pro` (and likely other inner pages) as "Alternative page with proper canonical tag" — meaning Google chose a different URL as the canonical and dropped this one from the index.

Two causes in the current SEO setup:

### 1. Static canonical in `index.html` points to the homepage

```html
<link rel="canonical" href="https://www.notafugazitrader.com/" />
<meta property="og:url" content="https://www.notafugazitrader.com/" />
```

The per-route `SEO` component overwrites this in a `useEffect` after hydration, but if Googlebot's render snapshot captures the initial HTML (or rendering is deferred/queued), Google sees every URL canonicalized to `/`. Result: inner pages get folded into the homepage as "alternates".

### 2. Hreflang variants create indexable duplicates

`SEO.tsx` emits 15 `<link rel="alternate" hreflang="xx" href=".../brokers/goldfx-pro?lang=xx">` tags. These `?lang=xx` URLs are crawlable, return the same content, and self-canonical back to the clean URL — which is exactly what triggers the "Alternative page with proper canonical tag" status in GSC's coverage report (often informational, but here it's flagging the canonical mismatch loudly).

## Fix

### A. `index.html`
- Remove `<link rel="canonical" href="https://www.notafugazitrader.com/" />` entirely. Each route owns its canonical via the `SEO` component.
- Change `<meta property="og:url" content="https://www.notafugazitrader.com/" />` to stay as a sitewide fallback for non-JS social crawlers — leave as-is (Helmet/SEO replaces it for Googlebot which does execute JS).

### B. `src/components/SEO.tsx`
- Keep hreflang alternates (they help international SEO), but ensure the `?lang=xx` URLs themselves are not indexed independently. Two options:
  - **Preferred:** make hreflang URLs use the clean path (no `?lang=` suffix) and rely on the `Accept-Language` / i18n context to serve the right language. Simpler and avoids duplicate URLs entirely.
  - Alternative: keep `?lang=xx` but add a `noindex` `<meta>` on the page when `?lang=` is present in the URL.
- Recommend option 1: drop the `?lang=xx` query from the hreflang `href` and point all 15 hreflang entries plus `x-default` at the same canonical URL. This is valid when the same URL serves multiple languages via client-side detection (which the site already does via `I18nContext`).

### C. Verification
- After deploy, request re-indexing of `/brokers/goldfx-pro` in GSC.
- Note that GSC coverage updates take days to weeks; the "Alternative page" status will clear once Google re-renders and sees the self-canonical.

## Files changed
- `index.html` — remove one `<link rel="canonical">` line
- `src/components/SEO.tsx` — change hreflang `href` construction to drop the `?lang=` query

## Out of scope
- SSR/prerendering (would be the bulletproof fix but is a much larger change). Happy to plan that separately if you want.
