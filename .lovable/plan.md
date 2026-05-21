## Goal

`BrokersAdmin.tsx` modal e ekta notun **"Long Review"** tab add kora, jate admin form fill kore dilei `brokers.long_review` jsonb te **canonical schema** save hoy — exactly jeta `LongReview.tsx` (Full Review tab) ar `BrokerDetail.tsx` (Overview) porhe. Last 3 brokers (Exness, Bullwaves, XM) er moto Full Review properly render hobe.

Kono backend/schema migration lagbe na — `brokers.long_review` already `jsonb nullable` ache. Sudhu admin UI + ekta save mapper.

## Notun tab structure (form sections)

Ekta naya tab `<TabsTrigger value="long-review">Long Review</TabsTrigger>` add hobe, niche grouped sub-forms thakbe:

1. **Verdict block**
   - tldr (textarea, 1–2 line)
   - summary (textarea)
   - best_for (input)
   - not_ideal_for (input)
   - bottom_line (textarea)
   - star_rating (number 0–5, 0.1 step)
   - trust_score (number 0–10, 0.1 step)
   - trust_breakdown (repeater rows: label / score / max / weight)

2. **At a glance** (key/value repeater)
   - Pairs of label + value (regulation, min_deposit, max_leverage, avg_spread_eurusd, withdrawal_speed, platforms, islamic_account, deposit_methods, etc.)

3. **Geo availability**
   - accepted (comma-separated → string[])
   - excluded (comma-separated → string[])

4. **Sections repeater** (sob theke important — eta full review er backbone)
   Prottek section card e:
   - id (slug input — auto-suggest: quick-verdict / regulation-safety / geo-availability / spreads-accounts-fees / deposits-withdrawals / platforms-tools / pros-cons / final-verdict)
   - heading (input)
   - body (textarea, multi-paragraph — `[INTERNAL: /path]` token supported)
   - optional **table**: headers (CSV), rows (textarea — prottek line ekta row, cells pipe `|` separated), footnote
   - optional **bullets** (one per line)
   - optional **for** / **not_for** (one per line — for "Best for / Not ideal for" lists)
   - optional **practical_note**
   - Add row / Remove row / Move up-down buttons

5. **Affiliate CTA**
   - label (input — default "Open Account")
   - url (input — fallback: broker.website_url)
   - promo_code (input)
   - friction_reducers (one per line)

6. **Trustpilot**
   - rating (number)
   - reviews (number)
   - source_note (input)

7. **FAQ repeater**
   - q (input) / a (textarea)

8. **Meta**
   - reading_time_minutes (number — auto-calc button optional)
   - word_count (number — auto-calc from sections bodies)

## Save logic

`handleSave` e ekta `buildLongReview(form)` helper:
- Sob block ke canonical schema te assemble korbe
- Empty strings/arrays drop korbe (cleaner JSON)
- `payload.long_review = buildLongReview(form)` set korbe
- Existing fields (account_types, pros, cons, platforms, payment_method_details, etc.) **untouched** thake — Overview tab oi gula porhe

Editor open korle existing `broker.long_review` JSON ke form state e load korbe (reverse mapper).

## Touched files

- `src/pages/admin/BrokersAdmin.tsx` — notun tab, form state extension, mapper functions
- `src/components/admin/LongReviewEditor.tsx` (notun) — boro tab content ke alada component e rakhbo, jate parent file 700+ line na hoye jay

## Out of scope

- Kono DB migration na (column already exists)
- `LongReview.tsx` public component touch na — already canonical schema porhe
- Sections-er drag-and-drop reorder (simple up/down button diye)
- Markdown rich-text editor (plain textarea — existing convention)

Approve korle build mode e implement korbo.