## Final batch — 4 fixes

### 1. Hero — keep two-tone tagline (muted), drop CTA
**File:** `src/components/sections/HeroSection.tsx`

- Keep the two-tone line `We Test Brokers. You Trade Smarter.` but make it visually muted (single muted color, smaller weight, no `text-primary` accent on second half) so it acts as a soft sub-eyebrow, not a bold tagline.
- Remove the `See How We Test →` CTA block entirely.
- Keep the existing muted subtitle paragraph (`hero.subtitle`) below it.

### 2. Footer — drop ValueProp tagline
**File:** `src/components/layout/Footer.tsx`

- Remove `<ValueProp variant="inline" className="mb-2" />` and its `import ValueProp …` line.
- `brandDescription` paragraph stays as before.
- `ValueProp.tsx` file kept (unused, harmless).

### 3. Prop Firms — fix chips + rewording
**File:** `src/pages/PropFirms.tsx`

DB check confirms actual tags on prop-firm rows: `instant-funding`, `1-step`, `2-step`, `no-time-limit`, plus `prop-firm`, `low-cost`, `funded`, `futures`. No `discount` or `crypto-funded` tag exists on any current prop-firm.

Fix:
- Replace `filters` array with the exact requested order/labels:
  `All Prop Firms`, `Instant Funding`, `1-Step Challenge`, `2-Step Challenge`, `No Time Limit`, `Discount Offers`
  (drops `Crypto Funded`)
- Update `filterMap`:
  ```
  Instant Funding   → "instant-funding"
  1-Step Challenge  → "1-step"
  2-Step Challenge  → "2-step"
  No Time Limit     → "no-time-limit"
  Discount Offers   → "discount"   (kept; will gracefully show empty state until tag is added in admin)
  ```
- Filter logic stays the same (`tags?.includes(filterMap[filter])`); already-empty chips show the existing `EmptyResults` component.

### 4. Today's Market Movers — confirmed source
No code change. Data comes from `useEconomicCalendar()` → `calendar_events` table (admin-managed, same feed as `/calendar` page and `WeekNewsBoard`). Filters to today (UTC) + impact = high, top 3.

---
Optional, deferred until you ask:
- News fallback when calendar is empty
- Add a `Crypto Funded` chip back if/when relevant
- Delete unused `ValueProp.tsx`