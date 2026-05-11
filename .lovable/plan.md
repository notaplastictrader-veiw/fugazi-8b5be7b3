## Goal
Keep the top "This Week's Important News" board (`WeekNewsBoard`) exactly as-is. Remove only the section **below** it on `/calendar` — the sticky filter bar (range/timezone/impact/currency/category) and the grouped events list (mobile cards + desktop table + empty/loading states).

## Changes

**File: `src/pages/Calendar.tsx`** (only file touched)

Remove:
- Filter state: `impactFilter`, `currencyFilter`, `categoryFilter`, `rangeFilter`, `timezone`, `selected`
- `useEconomicCalendar` hook usage and the `grouped`/`dateKeys`/`updatedAgo` memos
- Helpers: `adjustForTz`, `parseNum`, `compareColor`, `impactStyles`, `MAJORS`, `CATEGORIES`, `TZ_KEY`, `formatDateHeader`, `clearFilters`, `filtersActive`
- Timezone localStorage `useEffect`s
- JSX: sticky filter bar, loading skeletons, empty state, mobile cards, desktop table, `<EventDetailModal>` (modal already lives inside `WeekNewsBoard`)
- Now-unused imports: `useEffect`, `useMemo`, `useState`, `Clock`, `Globe`, `Badge`, `Skeleton`, `useEconomicCalendar`, `EconomicCalendarEvent`, `EventDetailModal`, `categoryBucket`, `CATEGORY_LABELS`. Remove `CalendarDays` too if only used by the empty state.

Keep untouched:
- `MainLayout`, `SEO`, `JsonLd` breadcrumb
- Header block (badge, H1 "Market Calendar", subtitle) — drop the `updatedAgo` line since the hook is gone
- `<WeekNewsBoard />` — exactly as-is

## Out of scope
No changes to `WeekNewsBoard`, `EventDetailModal`, `useEconomicCalendar`, DB, or admin tools.