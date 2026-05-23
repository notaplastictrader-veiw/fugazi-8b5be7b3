## Problem

The "NAFT Editorial Team" author card is rendering at the top of the **Full Review** tab (via `AuthorCard` in `src/components/broker/LongReview.tsx`), but the **Reviews (0)** tab stays empty. The intent is the opposite: the editorial entry should appear as the first review (so the counter goes 0 → 1), with a **"Read Full Review →"** CTA that jumps to the Full Review tab.

Root cause: the JSON uploads contain two separate fields:
- `long_review.author` — used by `AuthorCard` on the Full Review page (shouldn't be there).
- `long_review.editorial_review_row` — meant to become a row in the `reviews` table, but the importer never inserted it. So Reviews stays at 0.

`BrokerDetail.tsx` already has the correct CTA logic (lines 1405–1417) — it shows "Read Full Review →" whenever a review's `author === "NAFT Editorial"` or `role === "editor"`. It just needs that row to actually exist.

## Changes

### 1. Hide AuthorCard on Full Review tab
`src/components/broker/LongReview.tsx` (~line 433): remove the `<AuthorCard …>` render (or gate it off). The author info now lives only inside the Reviews tab as the first entry.

### 2. Backfill editorial review rows for the 2 already-imported brokers
Insert one row into `public.reviews` for each of `cmc-markets` and `cxm-trading`, sourced from `brokers.long_review->'editorial_review_row'`:
- `author = 'NAFT Editorial'`
- `role = 'editor'`
- `status = 'published'`
- `verified_account = true`
- `rating`, `content` from the JSON (e.g. CMC: 3.6 / full paragraph)
- `broker_id` = matching broker's id

The existing `sync_broker_avg_rating` trigger will auto-bump `review_count` to 1 and recompute `stars`.

### 3. Update the importer for future broker uploads
Update `/tmp/import_broker.mjs` so that whenever the source JSON contains an `editorial_review_row`, the script also upserts a matching row into `reviews` (idempotent: skip if a row with `broker_id + author='NAFT Editorial'` already exists). This way every future broker import (e.g. next time you drop a `*.json`) automatically lands the editorial review in the Reviews tab.

## Result

- Full Review tab: no more author card at the top — only the actual review content (TOC + sections).
- Reviews tab: counter shows **Reviews (1)** with the NAFT Editorial entry + star rating + **Read Full Review →** button that switches to the Full Review tab.
- Future imports: editorial row is created automatically; no manual step needed.