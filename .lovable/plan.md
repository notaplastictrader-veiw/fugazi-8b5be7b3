

## Live Forex News — Finnhub Integration

Wire the live `/news` page (and add a homepage section) to **Finnhub's free forex news feed**, with the same caching pattern we used for the price ticker so the API key stays server-side and we never hit rate limits.

## Architecture

```text
Browser (News page + LatestForexNews homepage section)
        ↓ on mount + every 5 min
Edge Function: get-forex-news
        ↓ checks cache (site_settings.forex_news_cache)
        ↓ if cache > 5 min old → fetch Finnhub
        ↓ else → return cached JSON
Finnhub /news?category=forex&token=***
```

**Why server-side + cache**
- Hides the Finnhub API key (server-only secret)
- Single shared cache → 1 Finnhub call per 5 min serves all visitors (~288 calls/day, well under Finnhub free 60 calls/min limit)
- Identical pattern to the working `get-live-prices` function

## Steps

### 1. Store API key as runtime secret
Add `FINNHUB_API_KEY` = `d7l44m1r01qm7o0ae5ngd7l44m1r01qm7o0ae5o0` via the secrets tool.

### 2. Edge function `get-forex-news`
- Path: `supabase/functions/get-forex-news/index.ts`
- Public (no JWT), CORS enabled
- Logic:
  1. Read `site_settings.forex_news_cache`
  2. If `fetched_at` < 5 min ago → return cached articles
  3. Else → `GET https://finnhub.io/api/v1/news?category=forex&token=***`, take first 10 articles, normalize to:
     ```json
     { "headline", "summary", "source", "url", "image", "datetime" }
     ```
  4. Upsert cache row, return
  5. On Finnhub failure → return last cached value; on no cache ever → empty array + error flag

### 3. Database
- Insert seed row `site_settings.forex_news_cache` with empty initial value

### 4. Frontend hook `useForexNews`
- New file: `src/hooks/useForexNews.ts`
- Calls `supabase.functions.invoke('get-forex-news')` on mount
- `setInterval` re-fetch every 5 min (300_000 ms)
- Shared module-level cache so multiple components share one fetch
- Returns `{ articles, loading, lastUpdated }`

### 5. Homepage section: `LatestForexNews`
- New file: `src/components/sections/LatestForexNews.tsx`
- Inserted into `src/pages/Index.tsx` between `ForecastSection` and `HowItWorks`
- Layout: `max-w-6xl mx-auto`, section-tag eyebrow `📡 LIVE FOREX NEWS`, headline "Latest Forex News", grid of **6 cards** (md:2 cols, lg:3 cols)
- Card design (matches existing `glass-card` style):
  - 80×80 thumbnail (image with fallback gradient if Finnhub image is missing/broken)
  - Source pill (e.g. "Reuters") + relative time ("2h ago")
  - Headline (2-line clamp, font-bold)
  - One-line summary (muted, 2-line clamp)
  - Whole card is a link → opens article in new tab (`target="_blank" rel="noopener noreferrer"`)
- "View all news →" CTA link to `/news` at bottom-right of section header
- Skeleton loaders during initial fetch

### 6. Update `/news` page
- Replace the editorial-only `news_articles` query with a **two-source merge**:
  - **Top**: 10 live Finnhub forex articles (via `useForexNews`)
  - **Below**: existing `news_articles` from Supabase (editorial / NAFT-authored)
- Add a new filter chip `live-forex` at the top of the filter row
- Live articles get badge `forex • live` with a small pulsing green dot
- Same card style as the homepage section for consistency
- Time formatter handles unix seconds (Finnhub) AND ISO strings (Supabase)

### 7. Visual polish
- Pulsing green dot next to "LIVE" badge (uses existing `pulse-dot` keyframe from `index.css`)
- Hover state: thumbnail subtle zoom, headline turns primary color
- Image lazy-loading (`loading="lazy"`)
- Graceful image fallback: if `image` empty or fails to load, show category-colored gradient with `Newspaper` icon

## Files touched

| File | Action |
|---|---|
| `supabase/functions/get-forex-news/index.ts` | **new** — Finnhub fetch + 5-min cache |
| `src/hooks/useForexNews.ts` | **new** — client hook with 5-min polling, shared cache |
| `src/components/sections/LatestForexNews.tsx` | **new** — homepage section, 6 cards |
| `src/pages/Index.tsx` | edit — insert `<LatestForexNews />` after `<ForecastSection />` |
| `src/pages/News.tsx` | edit — merge live Finnhub feed above editorial articles, add `live-forex` filter |
| `site_settings` table | one-row insert: `forex_news_cache` |
| Secret `FINNHUB_API_KEY` | added via secrets tool |

## After deploy

- Homepage shows a live "Latest Forex News" section with 6 real forex headlines, auto-refreshing every 5 min
- `/news` page shows live Finnhub forex news at the top + your editorial articles below
- API key stays hidden server-side
- Max ~288 Finnhub calls/day shared across all users (free tier safe)
- Click any card → opens original article in new tab

## Out of scope (for later)
- Saving Finnhub articles into `news_articles` table for archival/SEO
- Per-article SEO pages (live news goes off-site)
- Other Finnhub categories (crypto, general market) — easy to add later by parametrizing the edge function
- Push notifications when breaking news drops

