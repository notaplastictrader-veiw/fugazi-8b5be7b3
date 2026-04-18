

## Two Issues

### Issue 1: "Failed to submit review" 
RLS on `reviews` table requires:
```
WITH CHECK (user_id = auth.uid())
```
But `ReviewSubmissionForm.tsx` (line ~58) inserts WITHOUT `user_id`:
```ts
await supabase.from("reviews").insert({
  author, content, rating, role, broker_id, status: "pending"
  // ❌ user_id missing
});
```
For authenticated users this violates RLS → fail. For anonymous users RLS denies INSERT entirely (policy is `TO authenticated`).

### Issue 2: Broker replies not visible to other users
Checking `review_replies` RLS — there IS a public SELECT policy:
```
Policy "Public can view review replies" — SELECT — TO public — USING (true)
```
So DB-side replies ARE public. The issue is **frontend**: `BrokerDetail.tsx` likely fetches replies only inside the broker dashboard, not on the public broker detail page where reviews are listed. Need to verify by reading `BrokerDetail.tsx`.

## Fix Plan

### Fix 1: Reviews submission
Update `src/components/ReviewSubmissionForm.tsx`:
- Get current `user` from `useAuth()` 
- If logged in → include `user_id: user.id` in insert
- If NOT logged in → show auth modal / toast "Please log in to submit a review" (since RLS blocks anon)
- Add proper error message showing actual Supabase error for debug

Also add an **anonymous review path** option:
- Either (a) require login (cleanest, current RLS), OR
- (b) Add new RLS policy `TO anon WITH CHECK (user_id IS NULL)` to allow guest reviews

**Recommend (a)** — login required. Matches the form already collecting Name/Email anyway, and prevents spam. Show inline "Sign in to leave a review" CTA for guests.

### Fix 2: Show broker replies on public broker detail page
- Read `src/pages/BrokerDetail.tsx` to confirm where reviews are rendered
- Update review fetch query to also fetch related `review_replies` (LEFT JOIN style):
  ```ts
  supabase.from("reviews")
    .select("*, review_replies(id, content, created_at, user_id)")
    .eq("broker_id", brokerId)
    .eq("status", "published")
  ```
- Render replies under each review with a "Reply from broker" badge (use `BrokerTierBadge` if reply author owns a Verified/Featured profile)

## Files to Touch
- `src/components/ReviewSubmissionForm.tsx` — add `user_id`, login gate, better error toast
- `src/pages/BrokerDetail.tsx` — fetch & render `review_replies` under each review on public page

## Out of Scope
- Allowing anonymous (logged-out) review submissions
- Threaded reply conversations (single reply per review)
- Editing/deleting own reviews from public page
- Realtime reply updates

