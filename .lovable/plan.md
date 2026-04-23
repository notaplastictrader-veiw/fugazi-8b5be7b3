

## Fill the news grid with broader market news

Finnhub's `forex` category is currently returning only 1 article (its forex feed is sparse during low-news periods). User wants the grid filled, so we'll **supplement with Finnhub's `general` market news** when forex alone doesn't fill enough cards. Both homepage and `/news` page benefit automatically since they share the same hook.

## Architecture

```text
get-forex-news edge function
  ├─ Fetch /news?category=forex   (primary, all returned)
  ├─ Fetch /news?category=general (fallback fill)
  ├─ Dedupe by URL, forex first
  ├─ Trim to 12 articles
  └─ Cache 5 min in site_settings.forex_news_cache
       ↓
useForexNews hook (unchanged)
       ↓
LatestForexNews (homepage, shows all)
News page (shows all)
```

## Changes

**1. `supabase/functions/get-forex-news/index.ts`** — fetch both feeds in parallel, merge

- Add `fetchFromFinnhub(apiKey, category)` taking a category param (`"forex"` or `"general"`).
- In the handler, run both fetches in parallel with `Promise.allSettled`.
- Merge results: forex articles first, then general articles, deduped by `url`.
- Cap at 12 articles total (was 10 forex-only).
- Cache structure unchanged — same `forex_news_cache` key, same TTL.
- If only one category succeeds, use whatever we got (graceful degradation).

**2. Frontend** — no code changes required

- `useForexNews` hook, `LatestForexNews` section, and `News` page all consume the merged feed transparently.
- The homepage "Latest Forex News" badge stays — broader market news is still relevant to forex traders (Fed, oil, geopolitics all move FX).

## Result

- Homepage and `/news` will display **up to 12 cards** instead of 1.
- Forex-specific articles always rank first; general market news fills the rest.
- API key still server-side; same 5-min cache means no extra rate-limit risk (2 calls per refresh = ~576 calls/day, well under Finnhub free tier).
- No editorial DB query — `/news` stays pure live feed as before.

