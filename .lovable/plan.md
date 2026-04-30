## Goal
Tweak pagination counts on `/sports` and limit "Latest Results" to today + yesterday only. Nothing else changes.

## Changes

### 1. `src/pages/Sports.tsx`
- Upcoming Predictions `usePaginatedList`: `pageSize: 12` → **`pageSize: 9`**.
  (Betting Sites stays at 12.)

### 2. `src/components/sports/SportsScheduleSection.tsx`
- Upcoming Matches `usePaginatedList`: `pageSize: 12` → **`pageSize: 6`**.
- Latest Results `usePaginatedList`: `pageSize: 12` → **`pageSize: 6`**.
- Before passing `results` into the popular-first ordering, filter to keep **only matches whose date falls between start-of-yesterday and now**. Older results never show, even via pagination.

```ts
const startOfYesterday = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d.getTime();
})();
const recentResults = results.filter((m) => {
  const t = new Date(m.date).getTime();
  return Number.isFinite(t) && t >= startOfYesterday && t <= Date.now() + 60_000;
});
// then: filteredResults = orderPopularFirst(applyFilters(recentResults))
```

## Out of scope
- Section structure, filters, headers, "View all" buttons — unchanged.
- No new components, no removed sections.

## Acceptance
- Upcoming Predictions shows max 9 cards per page.
- Upcoming Matches and Latest Results each show max 6 cards per page.
- Latest Results never shows a match older than the start of yesterday, regardless of page navigation.