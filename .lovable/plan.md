

## Findings (verified in DB)
- ✅ Review IS published, broker_id correctly = Bullwaves id, status='published'
- ✅ Logo URL IS saved correctly: `https://...supabase.co/storage/v1/object/public/logos/brokers/...png`
- ❌ **BrokerDetail header** ignores `logo_url` — only shows first letter of name as placeholder
- ❌ Header shows `(broker.review_count)` from stale DB column (=0) instead of `reviews.length` (=1)
- ❌ Reviews tab has no **broker reply** UI — claimed broker owners can't respond

## Fix Plan

### 1. Show real logo in BrokerDetail header
- Add `logo_url` to the `Broker` interface
- Replace the letter-placeholder div with `<img src={broker.logo_url} ... />` and fall back to the letter only if no logo

### 2. Fix review count display
Change `(broker.review_count) reviews` → `(reviews.length) reviews` so it reflects actual published reviews. (Optional small follow-up: a DB trigger to keep `brokers.review_count` in sync, but for now reading from the array is simplest and accurate.)

### 3. Add broker reply feature on reviews
**DB migration** — new table:
```sql
review_replies (
  id, review_id (FK), broker_id, user_id (replier),
  content text, created_at, updated_at
)
```
RLS:
- Public can read replies on published reviews
- Only `claimed_by` user of the broker (or super_admin) can insert/update/delete a reply

**UI in BrokerDetail Reviews tab**:
- Each review card shows existing reply (if any) below in a nested "Broker Response" box
- If current user is the claimed owner of this broker (or super admin), show a "Reply" button → inline textarea → save

### 4. Same logo fix for BrokerTrustHub homepage card
The card currently doesn't render `logo_url` either — add `<img>` with fallback.

## Files Touched
- `src/pages/BrokerDetail.tsx` — interface, header logo, review count, reply UI
- `src/components/sections/BrokerTrustHub.tsx` — render logo on card
- 1 SQL migration — `review_replies` table + RLS

## Out of Scope
- DB trigger to auto-sync `brokers.review_count` (using array length is enough for now)
- Threaded multi-reply (only one reply per review for now)
- Editing/deleting reviews by users
- Reply notifications (can add later)

