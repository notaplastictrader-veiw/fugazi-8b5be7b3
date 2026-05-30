## Goal

Pull all 49 prop firm reviews from `gogang735-oss/PROP` (branch `feat/tier2-prop-reviews-v4.10`) and publish them on the site as live prop-firm broker pages with their editorial sidecar reviews.

## What's in the repo

49 files, one per firm, each named `<slug>-review-v4.10.json`. Each file contains **two concatenated JSON objects** (per the v4.10 master prompt):

1. **`prop_firm_payload`** — flat broker row (name, slug, type, regulation, score, long_review, etc.)
2. **`{ editorial_review_row: { ... } }`** — editor sidecar (author, role, rating, content)

Firms include: FTMO, FundedNext, The5ers, Topstep, MyForexFunds, FundingPips, E8 Markets, Apex Trader Funding, Bulenox, ThinkCapital, TheFundedTrader, FunderPro, FXIFY, Tradeify, etc. (full list of 49 already inspected).

## Approach

Reuse the same pattern as the existing `import-naft-reviews` edge function (used for the 50 broker reviews from the KIRO repo), but adapt it for the PROP repo's single-file-with-two-objects format.

### New edge function: `import-prop-reviews`

- **Auth**: super_admin only (same check as `import-naft-reviews`).
- **List**: `GET https://api.github.com/repos/gogang735-oss/PROP/contents/?ref=feat/tier2-prop-reviews-v4.10`, filter `*.json` excluding `README.md`.
- **For each file**:
  - Fetch raw text from `download_url`.
  - Split the two concatenated JSON objects using `JSON.parse` with index tracking (or a small helper that calls `JSON.parse` on progressive slices).
  - **Object 1 → upsert into `brokers`** (on conflict `slug`) with:
    - All scalar fields from the payload (`name`, `slug`, `headquarters`, `website_url`, `logo_url`, `regulation`, `min_deposit`, `leverage`, `score`, `stars`, `pros`, `cons`, `tags`, `badge`, `affiliate_url`, `long_review`, `warning_note`, etc.)
    - Force `type = 'prop-firm'` (so they show on `/prop-firms`)
    - `status = 'published'`, `updated_at = now()`, `last_verified_at = now()`
  - **Object 2 → insert into `reviews`** as the editor sidecar:
    - Look up `broker_id` by `slug`.
    - Delete any prior rows with `role IN ('editor','editorial')` for that broker (idempotent re-runs).
    - Insert new row with `author`, `role='editor'`, `rating`, `content`, `status='published'`, `verified_account=true`, `user_id = <caller>`.
- **Return** `{ firms_upserted, editorials_inserted, errors: [] }`.

### Trigger from the admin UI

Add a one-click "Import Prop Firm Reviews (v4.10)" button on `src/pages/admin/ImportJsonAdmin.tsx` (the existing JSON-import admin page) that calls the new edge function via `supabase.functions.invoke('import-prop-reviews')` and shows the result toast.

## Technical details

- Files: new `supabase/functions/import-prop-reviews/index.ts` + small UI addition in `src/pages/admin/ImportJsonAdmin.tsx`.
- No DB schema changes — `brokers` and `reviews` already support `type='prop-firm'` and editor sidecar rows; the existing `sync_broker_avg_rating` trigger correctly ignores `role IN ('editor','editorial')` so stars stay imported.
- No new secrets needed — uses the public GitHub raw URLs and the existing `SUPABASE_SERVICE_ROLE_KEY`.
- Idempotent: re-running upserts brokers by slug and replaces editorial rows.
- After import, the firms automatically appear on `/prop-firms` (filters by `type='prop-firm'` + `status='published'`) and each detail page at `/brokers/<slug>` renders the v4.10 `long_review` (challenges tab, at_a_glance shorts, payout_verification, affiliate_cta, hot_take).

## Outcome

One click in the admin panel publishes all 49 prop firms with their editorial reviews. List of firms imported is returned in the response toast.
