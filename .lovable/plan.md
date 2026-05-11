## Diagnosis
Two places set the homepage title:
- `index.html` line 6 — static title shown briefly: `Not A Fugazi — Broker Reviews & Signals` ✅
- `src/pages/Index.tsx` line 21 — runtime SEO override: `Not A Fugazi Trader — Broker Reviews & Signals` ❌ (this is what shows on the live domain after React mounts)

The `SEO` component updates `document.title` on mount, so the runtime value wins.

## Fix
**File: `src/pages/Index.tsx`** — change the `<SEO title>` from `"Not A Fugazi Trader — Broker Reviews & Signals"` to `"Not A Fugazi — Broker Reviews & Signals"` so the tab matches `index.html`.

## Out of scope
- `SITE_NAME` constant in `SEO.tsx` (used for OG site_name, JSON-LD, etc.) stays "Not A Fugazi Trader" — that's the brand name, not the tab title.
- Other pages' titles unchanged.