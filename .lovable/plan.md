

# Fix Dashboard Visibility + Add "Back to Site" Navigation

## Problems
1. Dashboard sidebar and content get cut off at the bottom — not enough padding for the fixed bottom ticker
2. No "Back to Home" or "Back to Site" link anywhere in the dashboard — user gets stuck

## Solution

### 1. DashboardLayout.tsx — Fix bottom padding
Change `pb-16` to `pb-20` and ensure the wrapper has proper height calculation accounting for both top nav (92px) and bottom ticker (32px).

### 2. DashboardSidebar.tsx — Add "Back to Site" link
Add a `Home` / `Back to Site` link at the top of the sidebar with a house icon, linking to `/`. This gives a clear exit from the dashboard back to the main site.

Also add a `SidebarFooter` with a small "← Back to Site" link for extra visibility.

## Files Changed

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardLayout.tsx` | Increase bottom padding to `pb-20`, fix min-height calc |
| `src/components/dashboard/DashboardSidebar.tsx` | Add "Back to Site" link at top with Home icon + footer link |

