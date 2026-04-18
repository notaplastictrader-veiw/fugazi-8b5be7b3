

## Issue
User updated `full_name` to "MotoMan" in Profile Settings (saved to DB successfully), but the navbar UserDropdown top-right still shows "Plastic" (old name).

## Root Cause
The navbar `UserDropdown` component fetches the profile **once on mount** via `useQuery` and caches it. When the user saves changes in `ProfileSettings.tsx`, the dropdown's cached query is **not invalidated**, so it keeps showing the stale name until a hard page reload.

## Investigation Plan
1. `code--view src/components/UserDropdown.tsx` — confirm it uses `useQuery(["profile", user.id])` and reads `full_name`
2. `code--view src/pages/dashboard/ProfileSettings.tsx` save handler — check whether it calls `queryClient.invalidateQueries` after save

## Fix
In `ProfileSettings.tsx` save handler, after successful update:
```ts
queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
queryClient.invalidateQueries({ queryKey: ["public-profile"] });
```

This will force `UserDropdown` (and any other component caching this profile) to refetch, so the new name + avatar appear immediately everywhere without page reload.

## Files Changed (~1)
- `src/pages/dashboard/ProfileSettings.tsx` — add `useQueryClient` + invalidate after save

## Out of Scope
- Realtime profile sync via Supabase channels (overkill for this)
- Refactoring UserDropdown to use a shared profile context

