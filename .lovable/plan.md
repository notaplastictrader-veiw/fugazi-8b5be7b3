

## What you're asking
In the admin Reviews modal (`/admin/reviews`), the current "Avatar URL" field requires pasting a URL. You want a proper **photo upload** option so admins can upload an image file directly when creating/editing a review.

## Plan

### `src/pages/admin/ReviewsAdmin.tsx`
Replace the plain "Avatar URL" text input with the existing reusable `ImageUpload` component (already used elsewhere in admin):

- Import `ImageUpload` from `@/components/admin/ImageUpload`.
- Swap the current `<Input>` for avatar with:
  ```tsx
  <ImageUpload
    value={form.avatar}
    onChange={(url) => setForm(f => ({ ...f, avatar: url }))}
    label="Profile Photo"
    bucket="review-avatars"
  />
  ```
- Keep the field optional (no validation change).
- Keep storing the resulting public URL in `reviews.avatar` (existing column — no schema change).

### Storage bucket
Create a new public Supabase storage bucket `review-avatars` with policies:
- Public read (so avatars render on the homepage Community Reviews section)
- Authenticated insert/update/delete (admins only — managed by RLS via `has_role('admin')`)

### Files touched
- `src/pages/admin/ReviewsAdmin.tsx` — swap avatar input for `ImageUpload`
- New migration — create `review-avatars` storage bucket + RLS policies

### Out of scope
- Changing the user-side review submission form (separate component, already has photo upload)
- Resizing / cropping the uploaded image (uses ImageUpload as-is)
- Migrating existing avatar URLs (they continue to work — column unchanged)

