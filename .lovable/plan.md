

# Profile Settings Fix & Role-Based Dashboard Settings

## সমস্যা (3টা)

1. **Save কাজ করছে না** — Profile data update করলে save হচ্ছে না। Console এ error নেই, তার মানে RLS policy ঠিক আছে কিন্তু likely signup এর data trigger দিয়ে save হচ্ছে কিন্তু পরে edit করলে data load হচ্ছে না কারণ `profiles` table এ data নেই বা query issue।

2. **Social links কম** — শুধু Telegram ও Twitter আছে, Facebook/Instagram নেই। Database এ column নেই।

3. **সব role এর জন্য same settings page** — Broker, Signal Provider, Betting Site, Admin সবাই same user profile settings দেখছে। এদের জন্য আলাদা context-aware settings দরকার।

## সমাধান

### 1. Database Migration — Add social columns
```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS social_facebook text,
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_youtube text,
  ADD COLUMN IF NOT EXISTS social_tiktok text,
  ADD COLUMN IF NOT EXISTS social_linkedin text;
```

### 2. Fix ProfileSettings.tsx — Save working + new social fields
- Add state for `socialFacebook`, `socialInstagram`, `socialYoutube`, `socialTiktok`, `socialLinkedin`
- Update mutation to include all new fields
- Add error logging to mutation for debugging
- Load all fields from profile data on fetch

### 3. Role-Based Settings Page
`ProfileSettings.tsx` তে `useUserRole` hook use করে role detect করবো:

- **Regular User (no special role)**: Full settings — Basic Info, Trading Profile, Social Links, Privacy (current + new fields)
- **Broker**: Basic account info (email, name, phone) + link to portal settings (`/portal/broker`). Trading Profile ও Privacy sections hide।
- **Signal Provider**: Basic account info + link to portal settings (`/portal/signal`). Trading Profile hide।
- **Betting Site**: Basic account info + link to portal settings (`/portal/betting`). Trading Profile hide।
- **Admin/Super Admin**: Basic account info only — no trading profile, no social links। Admin panel link।

Each role will see a card saying "Manage your [Broker/Signal/Betting] profile from the Portal" with a button linking to their portal dashboard.

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Add 5 new social columns to `profiles` |
| `src/pages/dashboard/ProfileSettings.tsx` | Add new social fields, role-based section visibility, fix save, portal redirect cards |

## Technical Notes
- The `profiles` RLS policy allows `UPDATE` where `auth.uid() = user_id` — this should work. Will add error logging to debug if still failing.
- New columns are nullable with no default — safe migration.
- `useUserRole` hook already exists with all role detection logic.

