## Goal

Brokers admin er date filter ekhon kaj korche na (most rows er created_at same/seed time, tai date pick korle list khali hoy). Date filter er bodole **Type dropdown** dao, plus shob admin edit modal — Betting Sites, Promotions, Signals, Scam Alerts, News, Education, Sports, Calendar, Courses, Forecasts — Brokers er motoi clean, wide, **tabbed/sectioned** kore user-friendly banao.

## Phase 1 — Brokers admin toolbar fix

`src/pages/admin/BrokersAdmin.tsx`:
- `AdminTableToolbar` (date from/to) **shoraye dao**.
- Tar bodole ekta horizontal toolbar:
  - Search input (already ache)
  - **Type** select dropdown: All / Forex / Crypto / Binary / ECN / Prop Firm / Scam Watch
  - **Status** select dropdown: All / Draft / Pending / Published / Rejected
  - Right side: **Download Excel** button (handleExport already ache)
- `filtered` useMemo update: name search + type filter + status filter.
- `filterByDateRange` import & date state remove.
- Result count chip (`{filtered.length} of {brokers.length}`) toolbar er pashe.

`AdminTableToolbar.tsx` shei moto onno admin page-eo use hoy (ReviewsAdmin, ComplaintsAdmin, etc.) — oi gulo touch korbo na, shudhu Brokers theke shoranor.

## Phase 2 — Reusable tabbed modal pattern

Brokers er current 5-tab modal pattern (sticky header, max-w-5xl, Tabs) jeta already ache, sheta-i template. Ekta common helper file lagbe na — pattern direct copy korbo prottek admin e to keep diff small.

Common rules prottek modal er jonno:
- `DialogContent` width: `max-w-3xl` (small forms) ba `max-w-5xl` (boro forms with repeaters).
- Sticky header: title + Save/Cancel button right e.
- Body `max-h-[75vh] overflow-y-auto` with tab panels.
- 2-column responsive grid for related fields (`grid-cols-1 md:grid-cols-2`).
- Empty repeater rows e dashed border + "Add" button.
- Status select shobshomoy "Settings/Status" tab e.

## Phase 3 — Per-page modal redesigns

Each page er edit modal ke tab e bhag korbo:

| Page | Tabs | Width |
|------|------|-------|
| BettingSitesAdmin | Basics (name, slug, logo, license, url) • Offer (bonus, min deposit, withdrawal speed, sports, features) • Settings (warning, display order, status) | max-w-3xl |
| PromotionsAdmin | Basics (title, slug, broker, type) • Offer (amount, conditions, expiry) • Display (image, cta, order) • Status | max-w-3xl |
| SignalsAdmin | Basics (pair, direction, entry/SL/TP) • Analysis (rationale, timeframe) • Status | max-w-3xl |
| ScamAlertsAdmin | Basics (broker, severity, title) • Details (description, evidence) • Status | max-w-3xl |
| NewsAdmin | Basics (title, slug, category) • Content (excerpt, body, image) • SEO/Status | max-w-3xl |
| EducationAdmin | Basics (title, slug, level) • Content (body, video, image) • Meta (tags, order) • Status | max-w-5xl |
| SportsAdmin | Basics (event, league, kickoff) • Prediction (pick, confidence) • Status | max-w-3xl |
| CalendarAdmin | Basics (event, currency, importance) • Schedule (date, time) • Values (forecast/previous/actual) | max-w-3xl |
| CoursesAdmin | Basics (title, slug, instructor) • Content (description, modules, duration) • Pricing (price, discount) • Status | max-w-3xl |
| ForecastsAdmin | Basics (asset, category, direction) • Forecast (entry, target, rationale) • Status | max-w-3xl |

## Phase 4 — QA

- Brokers admin e Type dropdown switch korle list filter hocche kina.
- 1-2 admin modal kholo, Save kaj korche kina, repeater add/remove kaj korche kina.

## Out of scope

- DB schema change nai.
- Admin table column change nai (only toolbar).
- Onno admin page er date toolbar (Reviews/Complaints) jeegulor real `created_at` ache shegulo aagey moto thakbe.
- Validation/dirty-state warning nai.

## Notes

User asked specifically "type er ekhane drop down" — interpret kortechi Brokers admin e Type filter dropdown chai (jeta most cluttered list).