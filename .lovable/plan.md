## Problem

Currently every "View all" page (Brokers, News, Signals, Forecasts, Promotions, Scam Alerts, Reviews, Sports, Education, Ideas) fetches all rows and renders them at once. With 50+ items it's already heavy — when content grows to 1000+, the page will be unusable: slow load, infinite scroll, and the user gets lost.

## Idea: Paginated Listing Pages (12 per page) + Search + Sort

Industry-standard pattern used by Bloomberg, Investing.com, Forex Factory etc. Instead of dumping everything on one screen, we split content into clean numbered pages with quick filters on top.

Each "View all" page will get:

1. **Search bar** — instant client-side filter by title/name (300ms debounce)
2. **Sort dropdown** — Newest / Oldest / Top rated / A–Z (page-specific options)
3. **Pagination footer** — 12 cards per page with page numbers `[Prev] 1 2 3 … 25 [Next]`
4. **Result counter** — "Showing 1–12 of 487 brokers"
5. **Smooth scroll-to-top** when changing pages
6. **URL sync** — `?page=3&q=xm&sort=rating` so users can share/bookmark and back-button works

```text
┌───────────────────────────────────────────────────┐
│ Brokers                          487 results      │
│ [🔍 Search brokers...]   [Sort: Top rated  ▾]    │
├───────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ card │ │ card │ │ card │ │ card │   (12/page)   │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│ ... 3 rows of 4 ...                               │
├───────────────────────────────────────────────────┤
│   Showing 1–12 of 487   [‹ Prev] 1 2 3 … 41 [Next ›]│
└───────────────────────────────────────────────────┘
```

## What to build

### 1. Reusable components (`src/components/common/`)

- **`Pagination.tsx`** — page-number bar with ellipsis, prev/next, disabled states. Uses existing shadcn `Pagination` primitive but wraps it with our smart page-window logic (always shows first, last, current ±1).
- **`ListingToolbar.tsx`** — search input + sort dropdown + result counter in one row, fully themed (glass-card, primary accents, mono labels — matches NAFT design system).
- **`usePaginatedList` hook** (`src/hooks/usePaginatedList.ts`) — takes the full array + sort/search config, returns `{ visibleItems, page, setPage, totalPages, query, setQuery, sort, setSort, totalFiltered }`. Reads/writes `?page&q&sort` to URL via `useSearchParams`. Page size constant = 12.

### 2. Apply to every listing page

Same 4-line pattern in each page so behavior is consistent:

```tsx
const { visibleItems, ...controls } = usePaginatedList(allItems, {
  searchKeys: ['name', 'description'],
  sortOptions: [...],
  pageSize: 12,
});
```

Pages to update:
- `src/pages/Brokers.tsx` — search by name, sort by rating/newest/A-Z
- `src/pages/News.tsx` — search by title, sort by date/category
- `src/pages/Signals.tsx` — search by name, sort by win_rate/members
- `src/pages/Forecasts.tsx` — search by pair, sort by date/potential
- `src/pages/Promotions.tsx` — search by title/broker, sort by expiry/newest
- `src/pages/ScamAlerts.tsx` — search by broker, sort by severity/date
- `src/pages/Education.tsx` — search by title, sort by track/newest
- `src/pages/PropFirms.tsx` — search + sort by rating
- `src/pages/Sports.tsx` (Latest Results section) — paginate the settled-results list
- `src/pages/Ideas.tsx` — search + paginate
- Dashboard listings (reviews, complaints, watchlist) — same hook, pageSize 10

### 3. Loading & empty states

- Skeleton grid (12 placeholders) on first load — already exists in most pages, keep it.
- "No results found for 'xyz' — try clearing search" empty state with a Reset button.

## Why 12 per page (not infinite scroll)

- **Predictable performance** — page never renders >12 cards regardless of dataset size.
- **Better SEO** — Google indexes each page URL independently.
- **Shareable** — users can link friends to page 3.
- **Less mobile data** — rendering 12 vs 1000 cards is a huge difference.
- **No lost scroll position** — clicking a card and pressing back returns to the same page.

Infinite scroll was considered but rejected: it traps users, breaks the footer, and is exactly the "boring endless scroll" issue you flagged.

## Future-proof bonus (later, not in this pass)

When a single table genuinely passes ~500 rows in production, we can switch the hook from client-side slicing to server-side `.range(start, end)` Supabase queries — the component API stays identical, only the hook changes. No page rewrites needed.

## Files affected

- **New:** `src/components/common/Pagination.tsx`, `src/components/common/ListingToolbar.tsx`, `src/hooks/usePaginatedList.ts`
- **Edited:** ~10 listing pages (each gets a ~10-line diff replacing the bare `.map()` with `visibleItems.map()` + toolbar + pagination footer)
- **No DB changes**, no schema migration, no new dependencies.
