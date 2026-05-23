# Add BDSwiss Broker Review

Same import pattern as the BCS Markets review.

## Steps

1. **Read** `user-uploads://BDSWISS.json` in full.
2. **Check** if a broker with `slug = 'bdswiss'` already exists in the `brokers` table.
3. **Map** allowed top-level columns:
   - `name`, `slug`, `type`, `founded_year`, `headquarters`, `website_url`, `logo_url`, `description`
   - `regulation`, `license_number`, `min_deposit`, `leverage`, `avg_spread`
   - `score`, `stars`, `platforms`, `payment_methods`, `pros`, `cons`, `account_types`
4. **Build `long_review` jsonb** by merging all rich/extra fields from the JSON (author, conflict_note, regulatory_risk_warning, target_locale, toc, assets, comparison_block, video_embed, social_snippet, deep sections, etc.) so the `LongReview` renderer picks them up.
5. **Insert or upsert** via service-role REST call:
   - If no existing row → `INSERT` with `status = 'draft'`, `naft_verified = false`.
   - If exists → `PATCH /brokers?slug=eq.bdswiss` merging the new `long_review` onto the existing one (preserve other fields).
6. **Leave** `status = 'draft'` and `naft_verified = false` so:
   - The broker is not publicly visible until you flip it to `published` in `/admin/brokers`.
   - The "Verification Pending" safe-zone disclaimer auto-shows once published.

## No code changes

Pure data import — no schema migration, no frontend changes. Renderer already supports v4.7 `long_review` shape.

## After import

You'll need to (in `/admin/brokers`):
- Set status → **Published** when ready.
- Toggle **NAFT Verified** ON only once you've personally checked all facts.
