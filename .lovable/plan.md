
## Goal
`gogang735-oss/KIRO` repo (branch `naft/all-50-reviews`) theke shob `*-REVIEW-2026.json` + `*-EDITORIAL-REVIEW-ROW-2026.json` files pull kore Supabase `brokers` table-e bulk import korbo.

## Steps

**1. Download phase (script)**
- GitHub Contents API diye full file list pull (already verified: ~50 broker + 50 editorial pairs)
- All `*.json` raw URLs `curl` kore `/tmp/kiro-jsons/` te save
- Concatenated JSON file gulo `tryParseJson` logic diye split (existing handler already supports this)

**2. Validation phase**
- Existing `src/lib/jsonValidator.ts` + `researchPrompts.ts` broker schema use kore validate
- Existing `nestSidecarsIntoLongReview()` apply (sidecar keys auto-nest into `long_review`)
- Per-file result: ✅ valid / ⚠️ warnings / ❌ errors

**3. Import phase**
- Existing `importEntity()` function use, mode = **`overwrite`** (slug match → full update)
- `autoPublish = true` so brokers immediately go live
- Editorial sidecar (`*-EDITORIAL-REVIEW-ROW-2026.json`) → separate insert into `reviews` table with `role: 'editorial'`
- Sequential to respect DB triggers (review_count + scam detect + health score)

**4. Report**
- Final summary: X imported / Y updated / Z failed with per-broker breakdown
- Failed JSONs: error message + which field caused issue (for manual fix)

## Technical Notes
- Run as one-off Node/Bun script in sandbox using Supabase service_role key (via edge function OR direct insert via `supabase--insert` tool)
- Existing trigger `sync_broker_avg_rating` will NOT overwrite imported `stars` because zero community reviews exist on import
- `sync_broker_review_count` excludes `role='editorial'` so editorial row doesn't pollute counts
- Estimated runtime: ~2-3 min for 50 brokers

## What you'll get after
- All 50 brokers published with full v4.8 `long_review` jsonb
- Editorial review rows attached to each broker
- BrokerDetail pages instantly renderable at `/brokers/{slug}`
- Sitemap edge function auto-includes them on next request

## Risk
- Some files (e.g., OANDA, SWISSQUOTE, CMC, CXM, D-PRIME, EXNESS, XTB) were recently fixed in commit `7e0fb01` ("split concatenated JSON"). I'll re-fetch latest commit so we get clean versions.
- If any broker slug collides with existing DB rows, overwrite mode will replace — confirming this is desired (matches your "already done 26" list which needs refresh anyway).

Confirm korle build mode-e implement shuru kori.
