## Goal
Replace hardcoded `900+` / `928` jaygayguloke ek dynamic `useBrokerCount()` hook diye, jate DB count badle UI shob jaygay auto-update hoy.

## Approach

### 1. New hook: `src/hooks/useBrokerCount.ts`
- React Query (already in project) diye `brokers` table theke published count fetch korbe (`select count`, `head: true`).
- Cache: `staleTime: 1 hour`, `gcTime: 24 hours` — page navigation e refetch hobe na.
- Return shape:
  ```ts
  { exact: 928, rounded: "900+", loading: boolean }
  ```
  - `rounded` = `Math.floor(exact / 100) * 100 + "+"` (e.g. 928 → "900+", 1050 → "1000+").
- Fallback: load na hole `exact: 928, rounded: "900+"` (current values), jate first paint e empty na dekhay.

### 2. Update call sites
Hook use korar jonno **React components only**:

| File | Current | After |
|---|---|---|
| `src/components/sections/HeroSection.tsx` (line 16) | `"928"` hardcoded | `exact` from hook |
| `src/pages/Index.tsx` (line 35, SEO desc) | `"900+"` | `rounded` |
| `src/pages/Brokers.tsx` (lines 106-107, title+desc) | `"900+"` | `rounded` |
| `src/pages/Ask.tsx` (line 131) | `"900+"` | `rounded` |
| `src/components/sections/AIMatcherTeaser.tsx` (line 79) | `"900+"` | `rounded` |
| `src/components/sections/BrokerJoinSection.tsx` (line 64) | `"900+"` | `rounded` |
| `src/pages/admin/SiteSettingsAdmin.tsx` (lines 72, 180) | default text e `"900+"` | leave hardcoded (admin defaults, not user-facing) |

### 3. Static HTML files (NOT touched by hook — JS can't reach them)
Eikhane runtime e hook chalano jay na, kintu meta description gulo `react-helmet`/SEO component already dynamically replace kore — so problem nai.
- `index.html` lines 20, 57, 125, 126, 133 — eta **left as `900+`** because:
  - Per-route SEO component already overrides these for JS-executing crawlers.
  - Number er rounded form (`900+`) DB count `928` er sathe still accurate.
  - Crossing 1000 hole ek line manual update lagbe (rare, acceptable).

### 4. Cleanup
- Already not using "280" anywhere — researcher er claim invalid, no fix needed for that.
- `signals.ts` `"8,900"` (signal group members) unrelated — left alone.

## Out of scope
- (a) OG image verification — next step
- (c) Prerendering plan — next step
- Admin site_settings default templates (admin-only, marketing copy)

## Verify
- Open `/` and `/brokers` — Hero stat should show `928`, meta description should say `900+`.
- DB count badle (insert/delete broker), 1 hour stale time er por refresh e auto-update.