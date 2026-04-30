## Goal
Apply the same pagination + search + sort system used on Brokers/News/Signals/etc. to the Sports page so the Upcoming Predictions list stays performant as data grows.

## Scope
File: `src/pages/Sports.tsx` (only).

## Changes

1. **Replace the manual "show 6 / View all" toggle** on Upcoming Predictions with `usePaginatedList` + `ListingToolbar` + `SmartPagination`.
   - Page size: **12** (matches the rest of the site).
   - URL params namespaced with `paramPrefix: "up"` so they don't clash with the betting tab or future lists.
   - Sort options:
     - `soonest` — match_date ascending (default)
     - `latest` — match_date descending
     - `confidence` — confidence desc
   - Search keys: `team_a`, `team_b`, `title`, `prediction`.
   - Empty state via `EmptyResults` with a reset button.

2. **Preserve the "Popular Teams first" behavior** as the default ordering when no search/sort is active:
   - Build `upcomingDefault` (popular first, then rest) exactly like today.
   - Feed `upcomingDefault` into `usePaginatedList` so page 1 still leads with popular matches.
   - When the user types a query or picks a sort, the hook's filter/sort takes over naturally.

3. **Apply the same to Betting Sites grid** (when the `betting` tab is active):
   - 12 per page, search keys: `name`, `sports`, `features`, `license`.
   - Sort options: `featured` (current `display_order` order — default, no compare), `rating-desc`, `name-asc`.
   - Uses `paramPrefix: "bs"`.

4. **Remove now-unused state**: `showAllUpcoming`, `POPULAR_LIMIT` usage for slicing (kept only for the "popular header label" check).

5. **Keep untouched**:
   - Stats bar, filter tabs (all/football/cricket/tennis/betting), refresh button.
   - "See latest results" jump button.
   - `SportsScheduleSection` at the bottom.
   - AI predictions merge + dedupe logic.

## Technical notes
- Toolbar placed directly above each grid; pagination directly below.
- Auto scroll-to-top on page change is handled by the hook.
- No new files; only `Sports.tsx` is edited.
- No DB or type changes.

## Acceptance
- `/sports` Upcoming list shows max 12 cards with pagination controls.
- Searching by team name filters results and resets to page 1.
- Sort dropdown works and is reflected in the URL (`?up_sort=confidence`).
- Betting tab also paginates at 12 per page with its own search/sort.
- Default view (no query, no sort) still shows popular-team matches first on page 1.