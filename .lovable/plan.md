

## What you're asking
Three things on the homepage Community Reviews:

1. **Photos uploaded with reviews are not displaying** — only the avatar + text shows, not the gallery.
2. **Detect & alert when same user submits multiple reviews** — show admin a warning in the Reviews admin panel ("This user has X previous reviews"), and let admin see what their previous ones were.
3. **Section heading rename** — "What Traders Say" → "What Traders Say About Us" (since this section is now exclusively platform reviews).

## Plan

### 1. Show photos in homepage review cards (`CommunityReviews.tsx`)
- Each review row already has `photo_urls: string[]` from DB.
- Render a small horizontal photo strip below the review content (max 4 thumbnails, ~48px square, rounded, border).
- Click a thumbnail → open a lightweight lightbox (full-size image in a Dialog).
- Skip rendering if `photo_urls` is empty.

### 2. Detect repeat submissions in admin (`ReviewsAdmin.tsx`)
- Compute per-user counts client-side: group `items` by `user_id` (skip nulls).
- In the **table row**, when a review's user has >1 total reviews, append a small badge next to the "User submitted" pill: `↻ 2nd` / `↻ 3rd` etc.
- In the **View modal**, when viewing a user-submitted review, add a "Previous reviews from this user" collapsible section showing:
  - Date, rating, status, first 80 chars of content
  - Link/button to switch the View modal to that previous review
- This requires no schema change — just smarter client-side grouping by `user_id`.

### 3. Rename homepage heading
- In `CommunityReviews.tsx` change the section title from "What Traders Say" → **"What Traders Say About Us"**.
- Update the eyebrow/description if needed to match the platform-only positioning.

### Files touched
- `src/components/sections/CommunityReviews.tsx` — render photo strip + lightbox, rename heading
- `src/pages/admin/ReviewsAdmin.tsx` — repeat-submission badge in table + previous-reviews list in View modal

### Out of scope
- Blocking duplicate submissions (admin can still approve/reject each one)
- Rate-limiting how often a user can submit
- Comparing review content for similarity / spam detection

