

## Issues found
1. **Photo upload silently fails** — `PlatformReviewForm` uploads to the `media` bucket, but its RLS policy only allows `super_admin` to insert. Regular users get a permission error → photo never appears in the form, never saved with the review.
2. **"Approved reviews appear on the homepage" copy** — needs to be removed/softened.
3. **Ticker too slow + not draggable** — currently `60s linear infinite` CSS animation that users can't interact with.

## Plan

### 1. Fix photo upload (RLS migration)
Add a storage policy so authenticated users can upload to `media/reviews/{their_user_id}/...`:
```sql
-- INSERT: users can upload to media/reviews/<own uid>/
-- DELETE: users can remove their own files
-- (Public read already exists)
```
Folder check: `(storage.foldername(name))[1] = 'reviews' AND (storage.foldername(name))[2] = auth.uid()::text`

### 2. Remove approval copy in `PlatformReviewForm.tsx`
- Subtitle: "Share your experience with the platform. Approved reviews appear on the homepage." → **"Share your experience with the platform."**
- Footer hint: "All reviews require admin approval before appearing on the homepage." → **remove**
- Success toast: "Thanks! Your review will appear after approval." → **"Thanks for your review!"**

### 3. Make ticker faster + draggable in `CommunityReviews.tsx` + `index.css`
Replace the pure-CSS infinite animation with a JS-driven scroll that:
- Auto-scrolls **right → left** at a faster speed (~0.6 px/frame ≈ 36 px/sec, vs current ~30s/cycle equivalent).
- Pauses on **hover**.
- Supports **mouse drag** and **touch swipe** (pointer events) — user can grab and move freely.
- Loops seamlessly by resetting scroll position when reaching the duplicated end.

Implementation approach:
- Use a `ref` on the scroll container with `overflow-x: auto` (hidden scrollbar via CSS).
- `requestAnimationFrame` loop increments `scrollLeft`; when `scrollLeft >= contentWidth/2`, reset to `0` (since items are duplicated).
- Pointer handlers: `pointerdown` → start dragging, pause auto-scroll; `pointermove` → adjust `scrollLeft` by delta; `pointerup/leave` → resume auto-scroll after short delay.
- Add `cursor: grab` / `active:cursor-grabbing` styling.
- Remove the `.ticker-track-slow` keyframe usage (keep CSS class for layout: flex + gap, no animation).

### Files touched
- New migration — add user INSERT/DELETE policies on `storage.objects` for `media/reviews/<uid>/...`
- `src/components/PlatformReviewForm.tsx` — copy tweaks
- `src/components/sections/CommunityReviews.tsx` — drag-scroll logic
- `src/index.css` — remove animation from `.ticker-track-slow`, add grab cursor

### Out of scope
- Changing review moderation flow (admin approval still required server-side via `status='pending'` — we just don't tell the user upfront)
- Touch momentum / inertia scrolling (basic drag only)
- Mobile-specific speed tuning

