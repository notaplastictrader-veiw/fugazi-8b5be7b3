## Fix Calendar day-header overlap

**Problem:** On `/calendar`, the per-day section headers ("TODAY", "TOMORROW", "THURSDAY, APR 30") visually overlap the event rows of the previous/next group. Cause: each group's header uses `sticky top-[200px]` (both mobile and desktop). When one group ends and the next begins, the next sticky header pins at `top-[200px]` while the previous group's last rows are still occupying that vertical space, producing the overlap shown in the screenshot. The `top-[200px]` value is also a guess — the filter bar above is `top-[92px]` and changes height responsively (3–4 rows of pill buttons), so the day header doesn't actually sit flush below it.

**Fix:** Drop sticky positioning from the per-day headers and make them clearly separated banners instead. The page already has a sticky filter bar at the top, so day headers don't need to be sticky too — losing them on scroll is fine and matches the rest of the calendar UX.

### Changes

**File: `src/pages/Calendar.tsx`**

1. Mobile day header (line 346):
   - Remove `sticky top-[200px] bg-background/80 backdrop-blur-sm py-2 z-10`.
   - Add a little top spacing so groups breathe: `mt-2`.

2. Desktop day header (line 400):
   - Remove `sticky top-[200px] z-10 backdrop-blur-md`.
   - Keep the `bg-primary/10 border-b border-primary/20` styling so it still reads as a banner.
   - The `glass-card rounded-xl overflow-hidden` wrapper already isolates each group visually.

3. Increase spacing between day groups so the boundary is unambiguous:
   - Change the outer `<div className="space-y-6 …">` (line 341) to `space-y-8`.

That removes the overlap entirely and keeps the visual hierarchy intact.

### Out of scope
- No changes to data, filters, sports integration, or the previously-fixed ticker work.

### Technical notes
- Both the mobile `<h3>` and desktop banner currently rely on the same `top-[200px]` offset, which doesn't match the actual filter-bar height (`top-[92px]` + ~3–4 rows of pills ≈ 180–230px depending on viewport / wrap). Removing sticky avoids having to maintain that magic number.
- No other component depends on these headers being sticky.