

## Homepage news: show only 3 cards, full feed on /news

User wants the homepage "Latest Forex News" section trimmed to **3 cards** (most recent/important) to keep the homepage less crowded. The `/news` page continues to show the full feed (up to 12 articles) — already working correctly.

## Change

**File:** `src/components/sections/LatestForexNews.tsx`

- Slice the articles array to the first 3 before rendering: `const display = articles.slice(0, 3);`
- Use `display` in the grid map and the empty/length checks.
- Update the skeleton loader count from 6 to 3 to match.
- Change the grid to `md:grid-cols-3` (drop `lg:grid-cols-3` since we only have 3 cards — they'll sit in a single clean row on desktop, stack on mobile, 3-up on tablet+).
- Keep the "View all news →" link to `/news` — that's where users go to see the full 12-article feed.

**No other files affected.** The `useForexNews` hook and `/news` page stay untouched.

## Result

- Homepage: clean 3-card row of the latest live forex/market headlines.
- `/news` page: full feed of up to 12 articles, unchanged.
- Finnhub returns articles sorted by recency, so the top 3 are always the freshest.

