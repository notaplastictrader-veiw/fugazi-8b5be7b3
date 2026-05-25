## Goal

Make the platform a first-class home for prop-firm reviews using the v4.9 master prompt — without breaking the existing v4.8 broker flow. Same `brokers` table, same `long_review` JSONB, same `/brokers/:slug` detail page. Just teach the renderer the new prop-firm shape and clean up labels that currently say "Min Deposit" on prop-firm cards.

No database schema changes. `type = 'prop-firm'` already exists, listing page already works, importer already works.

---

## What changes

### 1. Save v4.9 as the canonical prop-firm prompt
- Copy `naft-prop-firm-review-v4.9.md` into project under `src/content/prompts/prop-firm-review-v4.9.md`.
- Add memory entry `mem://content/prop-firm-review-master-prompt` pointing to it (so future imports/agents use it).
- Update `mem://content/master-prompt-index` to list both v4.8 (broker) + v4.9 (prop-firm).

### 2. Renderer: teach `LongReview.tsx` v4.9 prop-firm blocks
Detect by `broker.type === 'prop-firm'` OR `long_review.schema_version === '4.9'`. Render in this order, after the existing hot-take/verdict:

1. **At-a-Glance card** — `long_review.at_a_glance` (model, profit target, daily DD, max DD, time limit, profit split, payout freq, backing broker). Two-column grid with mono values.
2. **Drawdown Explainer** — `long_review.drawdown_explainer` with the worked example highlighted as a callout. This is the "money section" the prompt emphasizes.
3. **Pass Rate** — small stat strip (claimed_by_firm vs industry_benchmark vs naft_estimate).
4. **Red Flag Scan** — only render if `flags_found > 0`; show found flags as warning chips.
5. **Payout Verification** — stat tiles: verified payouts seen, largest payout, processing days, denial reports 90d.
6. **Geo accepted / excluded** — reuses existing `GeoAvailability` component if compatible, else inline list.
7. **Comparison block** — `comparison_table` (already partially supported, keep as-is).

Reuse existing card / glass-card styles + semantic tokens. No new colors.

### 3. UI label polish for prop firms
- `PropFirms.tsx` card: change "Min Deposit" label → "Challenge Fee" when `type === 'prop-firm'`. Replace "Leverage" with "Profit Split" pulled from first `account_types[].profit_split` if available.
- `BrokerDetail.tsx` quick-stats strip: same label swap behind a `isPropFirm` flag.

### 4. Kill-switch visual
When `warning_note` starts with `AVOID` or `WARNING`, render a red top banner on the detail page (already partially exists for brokers — confirm it triggers for prop-firm rows too, fix if not).

### 5. Importer
`ImportJsonAdmin.tsx` already routes by `type`. Confirm v4.9 payloads round-trip cleanly (the extra long_review keys are JSONB so they pass through). No code change expected — verification only.

---

## Out of scope (for this pass)

- No new pages, no new routes.
- No new DB tables/columns. `long_review` is already JSONB and absorbs the v4.9 additions.
- Anti-AI tone rules stay in the prompt only — not enforced at render time.
- Removing the duplicate `comparison_table` / `comparison_block` — leave both supported, prefer `comparison_table` when both present.

---

## Files touched (technical)

- new: `src/content/prompts/prop-firm-review-v4.9.md`
- edit: `src/components/broker/LongReview.tsx` — add prop-firm sub-renderer (gated, ~150 lines)
- edit: `src/pages/PropFirms.tsx` — label swaps + profit-split tile
- edit: `src/pages/BrokerDetail.tsx` — `isPropFirm` flag, label swap, verify warning banner
- new memory: `mem://content/prop-firm-review-master-prompt`
- edit memory: `mem://content/master-prompt-index`

---

## Deliverable

After this lands, you can paste a v4.9 prop-firm JSON into the importer and the resulting `/brokers/<slug>` page will render at-a-glance, drawdown explainer with worked example, pass rate, red-flag scan, payout verification — all themed to your existing 3 themes — with prop-firm-correct labels on cards and detail.
