## Goal

Remove every Bangladesh-specific reference (country name, bKash, Nagad, Rocket, "BD traders", "Bangladeshi and South Asian traders") from the Exness review only. Replace with neutral, internationally relevant wording. Other broker pages and country guides (e.g. `/brokers/country/bangladesh`) are not touched.

## Where the BD wording still lives

Verified by reading the live DB row and grepping the codebase:

### A. Database — `brokers` row where `slug='exness'`

1. `**pros**` array contains: `"Native bKash/Nagad/Rocket integration for BD traders"` → replace with a neutral pro.
2. `**payment_methods**` array starts with `bKash, Nagad, Rocket, …` → drop those three.
3. `**tags**` array contains `bd-friendly` → remove.
4. `long_review.faq` — answer for "Does Exness accept clients from keep all but say no longer taking from India.
5. `**long_review.geo.accepted**` — currently leads with `"Bangladesh"` → remove that entry (other accepted countries stay).

(Other `long_review` fields — `verdict.summary`, `verdict.tldr`, `verdict.best_for`, `at_a_glance`, `sections[deposits-withdrawals].table.rows`, `payment_method_details` — were already cleaned in the previous turn and contain no remaining BD/bKash strings.)

### B. Frontend hard-coding

6. `**src/pages/BrokerDetail.tsx` line ~143** — `bestFor` is computed inline:
  ```ts
   bestFor: `${broker.tags?.includes("bd-friendly") ? "Bangladeshi and South Asian traders due to local payment support and low minimum deposit." : "Active forex traders looking for tight spreads and reliable execution."}`
  ```
   This is what renders the "Best for: Bangladeshi and South Asian traders…" line the user is complaining about. Change to read from `long_review.verdict.best_for` when present, and drop the `bd-friendly` branch entirely so the fallback is the neutral "Active forex traders…" sentence.
7. `**src/data/brokers.ts**` — Exness mock has `tags: ["forex", "ecn", "low-spread", "bd-friendly"]`. Remove `bd-friendly`. (This file is fallback data; matters for the BD branch in `BrokerDetail.tsx` until step 6 lands.)
8. `**src/components/sections/BrokerTrustHub.tsx` line 160** — same mock duplication for Exness. Remove `bd-friendly` from the tags array.

### What is intentionally NOT touched

- `src/data/countryGuides.ts` — the standalone Bangladesh country page legitimately lists `bKash`, `Crypto`, `Skrill`, `Neteller`. That page is country-specific, not Exness-specific.
- `src/components/layout/Footer.tsx` "Brokers in Bangladesh" link → still valid (links to the country page).
- `src/data/countries.ts` Bangladesh entry → it's the phone-prefix/country list, used in signup.
- Other brokers (`xm-global` etc.) keep their `bd-friendly` tag — only the Exness pros/tags are edited.

## Technical surface

- **One `supabase--insert` UPDATE** on `brokers` where `slug='exness'`:
  - `pros` — replace the "Native bKash/Nagad/Rocket…" entry with `"Multiple deposit rails: bank wire, cards, e-wallets and crypto"`
  - `payment_methods` — `['Bank Transfer', 'Visa', 'Mastercard', 'Skrill', 'Neteller', 'Perfect Money', 'WebMoney', 'Crypto (BTC, USDT)']`
  - `tags` — remove `bd-friendly`
  - `long_review.faq` — strip "Bangladesh" from the accepted-countries answer
  - `long_review.geo.accepted` — drop `"Bangladesh"`
- **Code edits**:
  - `src/pages/BrokerDetail.tsx` — `bestFor` now prefers `broker.long_review?.verdict?.best_for`; fallback is the generic sentence. The `bd-friendly` ternary is deleted.
  - `src/data/brokers.ts` — remove `"bd-friendly"` from the Exness tags array.
  - `src/components/sections/BrokerTrustHub.tsx` — remove `"bd-friendly"` from the Exness mock tags array.

No schema changes. No migration needed.