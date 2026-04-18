

## Issue
Broker portal-এ (`/portal/broker`) দেখা যাচ্ছে:
1. **Reviews count = 0** কিন্তু আসলে 1টা review আছে ("Super broker by Test") — count সবজায়গায় sync হচ্ছে না
2. Reviews list-এ broker reply করতে পারছে না
3. Review-এ react/emoji (love, care, etc.) দেওয়ার option নেই
4. Public broker page-এ reply UI add করা হয়েছে কিন্তু broker portal dashboard-এ নেই

## Root Causes
- `BrokerDashboard.tsx`-এ score card `broker.review_count` (stale DB column = 0) থেকে read করছে — actual `reviews.length` (=1) ignore করছে
- Analytics block-ও same `broker.review_count` use করছে
- Reviews list শুধু text + rating দেখাচ্ছে — কোনো reply input বা reaction button নেই
- `review_replies` table আছে কিন্তু broker portal-এ এর interaction নেই
- Reactions store করার কোনো table নেই

## Fix Plan

### 1. Sync review count display (no DB change)
`src/pages/admin/BrokerDashboard.tsx`-এ:
- Score card-এ `broker.review_count` → `reviews.length`
- Analytics block-এ same fix
- Same logic পরে চাইলে homepage card-এও apply করা যাবে (already done in earlier fix)

### 2. Add broker reply UI in Broker Portal
Reviews section-এ প্রতিটি review-এর নিচে:
- Existing reply থাকলে "Official Response" box দেখাবে
- না থাকলে "Reply" button → inline textarea → save to `review_replies`
- RLS already permits claimed broker owner (approved) to insert/update/delete

### 3. Add review reactions (NEW)
**DB migration** — new `review_reactions` table:
```sql
review_reactions (
  id, review_id (FK), user_id, reaction text  -- 'love' | 'care' | 'helpful' | 'thanks'
  created_at, UNIQUE (review_id, user_id, reaction)
)
```
RLS:
- Public can SELECT (counts visible to all)
- Authenticated users can INSERT/DELETE their own reactions
- Broker owner & super_admin same access pattern

**UI** in both Broker Portal dashboard AND public BrokerDetail reviews:
- Reaction bar under each review with 4 emoji buttons (❤️ Love, 🤗 Care, 👍 Helpful, 🙏 Thanks)
- Click toggles user's reaction; show count next to each emoji
- Brokers can react to reviews on their own listing (positive ones), and reply for all (negative ones get text response)

### 4. Optional: keep `brokers.review_count` accurate
Add a small DB trigger that updates `brokers.review_count` whenever a review is inserted/updated/deleted with status='published'. Keeps homepage cards and other places automatically correct without changing every component.

```text
trigger fn:
  on INSERT/UPDATE/DELETE on reviews →
    UPDATE brokers
       SET review_count = (SELECT count(*) FROM reviews
                            WHERE broker_id = X AND status='published')
     WHERE id = X
```

## Files to Touch
- 1 SQL migration → `review_reactions` table + RLS + `brokers.review_count` sync trigger
- `src/pages/admin/BrokerDashboard.tsx` → fix counts, add reply UI, add reaction bar
- `src/pages/BrokerDetail.tsx` → add reaction bar to public review cards (reuse same component)
- 1 small reusable component `src/components/reviews/ReviewReactions.tsx` (4 emoji buttons + counts)

## Out of Scope
- Custom emoji picker / unlimited reaction types
- Threaded multi-reply per review (still 1 reply per review)
- Notifications when broker replies or reacts (can be a follow-up)
- Mobile app push for new reviews

