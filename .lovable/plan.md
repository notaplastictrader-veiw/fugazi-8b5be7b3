

## Issue
User profile update (avatar + other fields) frontend-এ submit হলেও DB-তে save হচ্ছে না বা reflect হচ্ছে না।

## Investigation Needed
1. `ProfileSettings.tsx` save handler দেখা — `update()` call ঠিক আছে কিনা, error handle করছে কিনা
2. `profiles` RLS policies — UPDATE policy আছে কিনা check করা
3. Console logs / network tab error দেখা

## Root Cause Hypothesis
Looking at the `profiles` table RLS policies provided:

```
Policy Name: Users can update own profile
Command: UPDATE
Roles: {public}
Using Expression: (auth.uid() = user_id)
```

**Problem**: UPDATE policy-তে `WITH CHECK` expression **missing**! Postgres-এ UPDATE policy-র জন্য `USING` (which rows can be updated) এবং `WITH CHECK` (what the new row values can be) **দুটোই** দরকার। `WITH CHECK` না থাকলে update silently fail হতে পারে অথবা rows match না করলে 0 rows affected return করে কিন্তু error throw করে না।

আরো একটা সম্ভাব্য issue: যদি `ProfileSettings.tsx` save handler `error` properly handle না করে বা wrong filter (`.eq("id", ...)` vs `.eq("user_id", ...)`) ব্যবহার করে।

## Plan

### Step 1: Read code & verify
- `code--view src/pages/dashboard/ProfileSettings.tsx` — save handler, filter clause, error handling
- `code--read_console_logs` & `code--read_network_requests` — actual PATCH request response

### Step 2: Fix RLS policy (migration)
Update the `profiles` UPDATE policy to include `WITH CHECK`:

```sql
DROP POLICY "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Also change `TO public` → `TO authenticated` (anon shouldn't update profiles).

### Step 3: Fix ProfileSettings.tsx save handler
- Ensure update uses `.eq("user_id", user.id)` (not `id`)
- Properly catch and toast errors so user knows update failed
- Add success toast + refetch profile after save
- Add `updated_at` to update payload (or rely on trigger — none exists, so manual)

### Step 4: Test
After fix: change name → click save → toast shows success → reload → value persists.

## Files Changed (~2)
- 1 new migration: `fix_profiles_update_policy.sql`
- `src/pages/dashboard/ProfileSettings.tsx` — save handler error handling + correct filter

## Out of Scope
- Adding update trigger for `updated_at` (will set manually in update payload)
- Changing other table policies

