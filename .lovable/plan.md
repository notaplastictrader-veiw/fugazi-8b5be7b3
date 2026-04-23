

## Show all live forex news on homepage (remove 6-card cap)

Currently `LatestForexNews.tsx` slices the feed to 6 articles via `articles.slice(0, 6)`. You want to show **all** live articles the edge function returns (currently up to 10 from Finnhub).

## Change

**File:** `src/components/sections/LatestForexNews.tsx`

- Remove `const display = articles.slice(0, 6);` and use `articles` directly throughout the component.
- Keep the same 3-column responsive grid (`md:grid-cols-2 lg:grid-cols-3`) — it will simply flow to a 4th row when more cards are present.
- Keep the "View all news →" link to `/news` for editorial articles.
- Skeleton loader count stays at 6 (reasonable initial placeholder).

## Result

Homepage "Latest Forex News" section will display **all live articles** returned by the `get-forex-news` edge function (up to 10), instead of just 6. No other pages or files affected.

