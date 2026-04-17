

## Goal
1. **Image uploads everywhere** — broker logos, betting site logos, course thumbnails, education hero images, promotion banners, news images, signal group logos, scam alert evidence, **user profile avatars** — সব URL input এর পাশে file upload button থাকবে।
2. **Frontend reviews seed** — `src/data/reviews.ts`-এ থাকা hardcoded reviews DB-র `reviews` table-এ seed করা।

## Investigation Plan

I need to verify a few things before writing the plan:
1. Existing `src/data/reviews.ts` content + count
2. Existing storage buckets (currently zero — need to create)
3. Which admin pages have image fields and what column names they use

## Plan

### 1. Storage Setup (1 migration)
Create **3 public buckets** (using SQL migration):
- `logos` — broker logos, betting site logos, signal group logos (public read, admin write, 2MB limit)
- `media` — promotion banners, course thumbs, education hero, news images, scam evidence (public read, admin write, 5MB limit)  
- `avatars` — user profile pictures (public read, owner write, 2MB limit)

RLS policies on `storage.objects`:
- Public SELECT on all 3 buckets
- `logos` + `media`: only `super_admin` INSERT/UPDATE/DELETE
- `avatars`: authenticated users can manage files where path starts with their `auth.uid()`

### 2. Reusable ImageUpload Component (1 new file)
Create `src/components/admin/ImageUpload.tsx`:
- Drag-or-click zone
- Shows current image preview if URL exists
- Uploads to specified bucket via `supabase.storage.from(bucket).upload()`
- Returns public URL via `getPublicUrl()`
- Replace/Remove buttons
- File validation (type, size)
- Calls `onChange(url)` to update parent form state

Props: `value`, `onChange`, `bucket`, `folder`, `maxSizeMB`, `label`

### 3. Wire ImageUpload into Admin Pages (8 files)
Replace plain URL `<input>` with `<ImageUpload />` in:
- `BrokersAdmin.tsx` → `logo_url` (bucket: `logos/brokers`)
- `BettingSitesAdmin.tsx` → `logo` (bucket: `logos/betting`)
- `SignalsAdmin.tsx` → add new logo field if needed (bucket: `logos/signals`)
- `PromotionsAdmin.tsx` → `image_url` (bucket: `media/promotions`)
- `NewsAdmin.tsx` → `image_url` (bucket: `media/news`)
- `CoursesAdmin.tsx` → add `thumbnail_url` column + upload
- `EducationAdmin.tsx` → add `hero_image_url` column + upload
- `ScamAlertsAdmin.tsx` → keep URL input, add upload option for evidence

Keep URL textbox as fallback (user can paste OR upload).

### 4. Profile Avatar Upload (1 file)
Update `src/pages/dashboard/ProfileSettings.tsx`:
- Add ImageUpload component for `avatar_url` field
- Bucket: `avatars`, folder: user's `auth.uid()`
- Updates `profiles.avatar_url` on save

### 5. Schema additions (same migration)
- `courses` table: add `thumbnail_url text default ''`
- `education_articles` table: add `hero_image_url text default ''`
- `signal_groups` table: add `logo_url text default ''`

### 6. Seed Reviews from frontend data
Use `supabase--read_query` first to confirm `reviews` table has zero or few rows, then INSERT (~10-15 reviews from `src/data/reviews.ts`):
- author, content, rating, role, broker_id (NULL since no FK match), status='published'
- All marked `published` so they show on frontend immediately

## Files Changed (~12)
- 1 migration: storage buckets + RLS + 3 schema columns
- 1 data insert: seed reviews
- 1 NEW: `src/components/admin/ImageUpload.tsx`
- 8 admin page updates: `BrokersAdmin`, `BettingSitesAdmin`, `SignalsAdmin`, `PromotionsAdmin`, `NewsAdmin`, `CoursesAdmin`, `EducationAdmin`, `ScamAlertsAdmin`
- 1 profile update: `ProfileSettings.tsx`

## Out of Scope
- Image cropping/resizing UI (browser handles file selection only)
- Multi-image gallery uploads (single image per field for now)
- CDN/optimization (Supabase Storage public URLs used directly)
- WebP conversion

## Approach
Migration first (buckets + columns) → ImageUpload component → wire into admins one by one → ProfileSettings → seed reviews last.

