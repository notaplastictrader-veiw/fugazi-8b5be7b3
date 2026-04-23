

## Show only live Finnhub news on /news page

Right now `/news` merges live Finnhub articles **with** the editorial cards from the `news_articles` Supabase table (plus a hard-coded `fallbackEditorial` array of 4 fake articles when the DB is empty). You want **only live forex news** there. Editorial cards should appear only if you manually add them later via the DB — never as fallback.

## Why only 1 live card shows now

The Finnhub edge function returns up to 10 articles, but they all share the same category `live-forex`. The current page mixes them with 4 fallback editorial cards, which dominate the grid visually. We'll strip editorial entirely so all 10 live cards show.

## Changes

**File:** `src/pages/News.tsx`

- Remove the `EditorialArticle` interface, `fallbackEditorial` array, and the entire `supabase.from("news_articles")` fetch.
- Remove `editorial`, `editorialLoading`, `editorialToUnified` state and helpers.
- `allArticles` becomes just the live Finnhub articles mapped through `liveToUnified`.
- Remove the dynamic categories built from editorial entries — keep only `["all", "live-forex"]` as filter chips (or drop filters entirely since there's just one category — we'll keep the chip row but with just those two for visual consistency).
- Update the page subtitle to reflect live-only: "Real-time forex headlines from trusted sources, auto-refreshed every 5 minutes."
- Loading state depends only on `liveLoading`.
- Empty state message updates to: "No live news available right now. Check back in a few minutes."

**Homepage (`LatestForexNews.tsx`):** No changes — already live-only.

**Editorial in future:** When you want to add editorial cards back, you'll insert rows into the `news_articles` table directly. We can add the merge logic back at that point — for now the component is clean and live-only.

## Result

`/news` will display **all live Finnhub articles** (up to 10) in the grid, no editorial fallback, no DB query. Homepage section unchanged.

