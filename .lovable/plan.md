

# Make Super Admin + Fix Dashboard Layout

## Step 1: Assign super_admin role
Insert into `user_roles` table for user `01b83db4-13b6-485d-9662-f62fcb0478dc` with role `super_admin`.

## Step 2: Fix Dashboard Layout Issues

**Problem**: The dashboard is wrapped in `MainLayout` which has a fixed bottom ticker (32px) and top nav (92px). The dashboard content uses `pt-24 pb-12` but the bottom ticker overlaps content. The sidebar also gets clipped.

**Fix in `DashboardLayout.tsx`**:
- Change `pb-12` to `pb-16` (64px) to account for the fixed bottom ticker bar (32px)
- Ensure the sidebar has proper overflow handling
- Add `overflow-auto` to the main content area so the "My Reviews" section and sidebar don't get cut off

## Files Changed

| Change | Details |
|--------|---------|
| DB Insert | `user_roles` — super_admin for user `01b83db4-13b6-485d-9662-f62fcb0478dc` |
| `src/components/dashboard/DashboardLayout.tsx` | Increase bottom padding, fix overflow for sidebar and content area |

