

## Issue
Heading reads "What Traders About Us" — missing the word "Say". Should be "What Traders Say About Us".

## Root cause
In `src/components/sections/CommunityReviews.tsx`:
- `sectionTitle` defaults to `"What Traders Say"`
- `accentText` defaults to `"About Us"`
- Rendered as: `{sectionTitle} {accentText}` → "What Traders Say About Us"

But the CMS (`site_settings.community_reviews`) likely has `section_title` overridden to `"What Traders"` (without "Say"), so the live output becomes "What Traders About Us".

## Fix
Update the `community_reviews` row in `site_settings` so:
- `section_title` = `"What Traders Say"`
- `accent_text` = `"About Us"`

This is a one-line DB update via migration — no code change needed since the component already renders correctly when defaults are used.

### Files touched
- New migration: `UPDATE site_settings SET value = jsonb_set(jsonb_set(value, '{section_title}', '"What Traders Say"'), '{accent_text}', '"About Us"') WHERE key = 'community_reviews';`

### Out of scope
- Changing the component fallback (already correct)
- Editing other CMS sections

