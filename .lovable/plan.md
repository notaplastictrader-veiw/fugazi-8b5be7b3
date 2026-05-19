## Goal
Replace the existing Bullwaves broker record's content with the new May 2026 review you provided, mapped correctly to our database schema so it renders in the existing `LongReview` component on the broker detail page.

## What I'll update

Target row: `brokers` where `slug = 'bullwaves-1776493644406'` (id `54dda4db-09e7-4b21-b6d6-ae217cb24973`).

Top-level columns (refreshed from the new content):
- `score` → 7.2, `stars` → 3.7
- `min_deposit` → "$100", `leverage` → "1:500", `avg_spread` → "1.6"
- `regulation` → ["FSA Seychelles — SD185", "MISA Comoros — T2022122"]
- `license_number` → "SD185"
- `founded_year` → 2023, `headquarters` → "Victoria, Seychelles"
- `platforms` → ["MetaTrader 5", "MT5 Mobile", "MT5 WebTrader"]
- `withdrawal_time` → "24–48 hours (verified)"
- `tags` → ["mt5", "high-leverage", "ecn", "islamic-account", "bonus"]
- `pros` / `cons` → derived from "for / not_for" + red flags
- `last_verified_at` → now()

`long_review` JSONB → the full review, normalized to what `LongReview.tsx` expects:
- `seo`, `verdict` (trust_score, star_rating, tldr → mapped to `summary`, best_for, not_ideal_for, bottom_line)
- `at_a_glance` (regulation, founded, min_deposit, max_leverage, avg_spread_eurusd, withdrawal_speed, platforms, islamic_account)
- `geo` (cleaned accepted/excluded arrays — the source JSON had unquoted strings in `excluded`; I'll fix and dedupe Iran etc.)
- `sections` mapped one-for-one; renamed `entity_table` / `account_table` → `table` (the only key the renderer reads); kept `bullets`, `for`, `not_for`, `steps`, `practical_note`, `cta_after`
- `faq`, `internal_links`, `reading_time_minutes`, `word_count`
- `affiliate_cta` (label, friction_reducers, telegram note appended). URL left as `AFFILIATE_PLACEHOLDER` since you haven't provided the actual affiliate link — the mid-CTA renderer hides itself in that case, which is the intended behavior until you supply it.

## What I'll NOT change
- Slug stays `bullwaves-1776493644406` (changing it would break existing inbound links and the sitemap). Tell me if you want it renamed to `/brokers/bullwaves`.
- `affiliate_url` / `promo_code` columns on the broker row — give me the real link + bonus terms and I'll wire them through both the row and the CTA.
- The promo ticker text (`💰 Bullwaves — Start with $10`) in `src/data/brokers.ts` — current copy is stale ($10 vs $100). I'll fix it to "Start with $100 + 30% Bonus" only if you confirm.

## Open questions before I run the migration
1. Affiliate link URL to use (otherwise the mid-page CTA stays hidden).
2. OK to fix the promo-ticker line to match the new minimum + bonus?
3. Keep the existing slug, or rename to `bullwaves`?

Once you answer (or say "just do it with placeholders"), I'll execute one migration `UPDATE` and confirm in the preview.
