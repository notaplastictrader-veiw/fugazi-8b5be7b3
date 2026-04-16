

# Fix: Missing Profile Data for Existing Users

## Problem
User `01b83db4-13b6-485d-9662-f62fcb0478dc` has roles assigned but no row in `profiles` table — they signed up before the `handle_new_user` trigger was created. So Name and Phone show "—".

## Solution — 2 parts

### 1. Database Migration: Backfill missing profiles
Create a migration that inserts profile rows for any `auth.users` that don't have one yet, pulling `full_name`, `phone`, `country` from `raw_user_meta_data`.

```sql
INSERT INTO public.profiles (user_id, full_name, phone, country, country_code)
SELECT 
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'phone',
  u.raw_user_meta_data ->> 'country_name',
  u.raw_user_meta_data ->> 'country'
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;
```

This ensures all existing users get a profile row.

### 2. Edge Function Update: Return name from metadata as fallback
Update `admin-users` edge function to also return `full_name` and `phone` from `user_metadata`, so even if profiles table is empty, the admin page can show the data from auth metadata as fallback.

### Files
| File | Change |
|------|--------|
| New migration | Backfill missing profiles from auth.users metadata |
| `supabase/functions/admin-users/index.ts` | Return `full_name`, `phone` from user metadata |
| `src/pages/admin/UsersAdmin.tsx` | Use auth metadata as fallback when profile is empty |

