## Diagnosis

Runtime error: `Failed to fetch dynamically imported module: SignalHub.tsx`.

Root cause: `SignalHub.tsx` was edited with an IIFE (`{(() => { ... return <>...</>; })()}`) wrapped around the grid + pagination JSX. While syntactically valid, this is producing a broken/stale lazy chunk that the browser can't fetch — which makes the lazy `<SignalHub />` throw inside `<Suspense>`. When that section crashes mid-scroll, the surrounding `LazySection` / Suspense tree unmounts every section after it (Forecasts, Calendar, News, Community Reviews, etc.), so the rest of the homepage **vanishes** and the scroll position jumps back up — exactly the symptom you described.

## Fix Plan

Refactor `src/components/sections/SignalHub.tsx` to match the clean pattern already used in `PayoutSpeedLeaderboard` and `ScamPulseRadar`:

1. Move the pagination math (`pageCount`, `currentPage`, `pagedGroups`) to top-level `const`s right after the `useEffect`, before the `return`.
2. Remove the IIFE / fragment wrapper around the JSX.
3. Render `pagedGroups.map(...)` directly inside the existing grid.
4. Render the Prev/Next pagination block (same style as the other two sections) right below the grid, still inside the `max-w-7xl` container.

No other files need to change. No data, styling, or routing changes.

## Expected Result

- Homepage renders top → bottom without jumping.
- All sections below Signal Hub (Forecasts, Calendar, News, Community Reviews, Forum, How It Works, Broker Join) reappear.
- Pagination on Payout Speed, Scam Pulse, and Signal Hub continues to work (5 per page, Prev/Next).