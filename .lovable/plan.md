

## What you're asking
Currently the homepage "Community Reviews" section only shows reviews that admins manually create from the admin panel. You want users to be able to **submit their own review about NAFT (the platform itself)** from the public site, and once approved, those reviews automatically appear in the "What Traders Say" section on the homepage.

Already exists: `ReviewSubmissionForm.tsx` and `Write a review →` button on the homepage. Need to verify it submits **platform reviews** (no broker_id), not broker-specific reviews.

## Plan

### 1. Verify / wire up the existing "Write a review" button
- Check `CommunityReviews.tsx` — confirm the "Write a review →" button opens a modal containing `ReviewSubmissionForm`.
- If it currently requires a `broker_id`, add a "platform review" mode that submits with `broker_id = null`.

### 2. Public review submission flow (`ReviewSubmissionForm.tsx`)
- **Auth gate**: must be logged in (uses existing `AuthModal` if not).
- **Prefill** from `profiles`: `full_name` → author, `avatar_url` → avatar, `experience_level` → role.
- Fields: Rating (1–5 stars), Content (textarea), optional photo upload to `avatars/reviews/`.
- Insert into `reviews` table with:
  - `user_id` = current user
  - `broker_id` = `null` (platform review)
  - `status` = `'pending'` (admin must approve)
- Show success toast: "Thanks! Your review will appear after approval."

### 3. Homepage display (`CommunityReviews.tsx`)
- Already fetches from `reviews` table where `status='published'`.
- Confirm it shows reviews regardless of `broker_id` (so platform reviews appear).
- Order by `created_at DESC` so newest approved reviews appear first.

### 4. Admin moderation (`ReviewsAdmin.tsx`)
- Already supports approve/reject — no changes needed.
- Add a small "Source" column showing "User submitted" vs "Admin created" (based on whether `user_id` is set).
- Add a filter chip to view only pending user-submitted reviews.

### 5. Notifications (optional, light touch)
- On user submission → notify admins via existing `notifyAdmins` helper so they see it in the approval queue.
- On admin approval → send notification to the user: "Your review is now live."

### Files touched
- `src/components/sections/CommunityReviews.tsx` — wire "Write a review" button to open modal
- `src/components/ReviewSubmissionForm.tsx` — verify platform-review mode (broker_id=null), add prefill
- `src/pages/admin/ReviewsAdmin.tsx` — add Source column + pending filter

### Database
- No schema changes — `reviews` table already has `user_id` (nullable) and `broker_id` (nullable).
- RLS already allows: authenticated users to insert own reviews, public to view published.

### Out of scope
- Editing/deleting own reviews from a user dashboard (separate feature)
- Spam/profanity filtering beyond admin approval
- Replies/comments on platform reviews

