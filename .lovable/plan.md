

## Issues to Fix

### 1. Review photos not displayed on broker detail page
Reviews submission accepts photo upload (per memory `community-reviews`), but `BrokerDetail.tsx` reviews list doesn't render the photos. Need to check schema — `reviews` table currently has no `photo_urls` column. Either:
- (a) Column exists but not selected/rendered, OR
- (b) Column missing entirely (uploads going nowhere)

**Action**: Verify schema. If `photo_urls` (text[]) doesn't exist, add via migration. Update `ReviewSubmissionForm.tsx` to actually upload to `media` storage bucket and save URLs. Update `BrokerDetail.tsx` reviews render to show photo thumbnails (clickable to enlarge in dialog).

### 2. Star rating not aggregating per broker
Currently `brokers.stars` field is static. Need it to auto-recompute as average of all `published` reviews for that broker.

**Action**: Create DB trigger `sync_broker_avg_rating()` on `reviews` (INSERT/UPDATE/DELETE) that updates `brokers.stars = AVG(rating)` AND `brokers.review_count = COUNT(*)` for the affected broker (where status='published'). Existing `sync_broker_review_count` already handles count — extend or add new trigger for avg.

Backfill existing brokers with current averages.

### 3. Reaction failing — `review_reactions_reaction_check` constraint
DB has a CHECK constraint limiting `reaction` to old values (love/care/helpful/thanks). Our new emoji palette (❤️👍👎😂...) violates it.

**Action**: Migration to `DROP CONSTRAINT review_reactions_reaction_check` (no replacement — let any text emoji through; reasonable since we control the UI).

## Plan

### DB Migration
1. `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}'`
2. `ALTER TABLE review_reactions DROP CONSTRAINT IF EXISTS review_reactions_reaction_check`
3. Create function `sync_broker_avg_rating()` + trigger on `reviews` (AFTER INSERT/UPDATE/DELETE) → recalc `brokers.stars` from AVG of published reviews. Backfill all brokers.

### Frontend Changes
- `ReviewSubmissionForm.tsx`: 
  - Add file input (multiple, image/*, max 4 photos, max 2MB each)
  - On submit: upload files to `media` bucket under `reviews/{user_id}/{timestamp}-{name}`
  - Save returned public URLs to `photo_urls` column
- `BrokerDetail.tsx` reviews list:
  - Select `photo_urls` in query
  - Render thumbnail row (small rounded squares) under content
  - Click → open `Dialog` lightbox showing full image

### Files to Touch
- 1 SQL migration (3 changes above)
- `src/components/ReviewSubmissionForm.tsx` — photo upload + insert with `photo_urls`
- `src/pages/BrokerDetail.tsx` — render photos + lightbox

### Out of Scope
- Editing/deleting photos after submission
- Photo moderation (admin can already reject the whole review)
- Star rating shown on broker cards/list — `stars` field updates will propagate automatically since trigger updates the source

