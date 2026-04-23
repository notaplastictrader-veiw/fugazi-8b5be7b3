

## Sports data provider — picking a safe option

You shared 4 links pointing to Sofascore-related APIs. I checked what each actually is and weighed them against TheSportsDB (the original spec). Here's the honest read.

## The 4 options you linked, ranked by safety

### ❌ RapidAPI "Sofascore Sport API" (apisummit)
- **Unofficial scraper** wrapping Sofascore's private endpoints
- Sofascore has **no public API** and their ToS forbids scraping
- Third-party reseller — could be taken down or sued at any time
- Rate limits + paid tiers above ~50 req/day
- **Risk:** account suspension, surprise billing, sudden API death. Not safe for production.

### ❌ GitHub `apdmatos/sofascore-api`
- Same story — community-built reverse-engineered client of Sofascore's internal endpoints
- No license to use Sofascore data commercially
- Unmaintained-style project, breaks whenever Sofascore changes their internal API
- **Risk:** legal grey zone + breakage. Not safe.

### ⚠️ sportsapis.dev "Free Sports API"
- Aggregator listing site, not an API itself — links to other free APIs (most of which are TheSportsDB, API-Football's free tier, ESPN's hidden endpoints)
- Useful as a directory, not a data source

### ✅ TheSportsDB (already in original spec)
- **Officially free and legal** — public API, key `1` is documented for free use
- Covers EPL, NBA, IPL — exactly the 3 leagues spec'd
- Stable since 2014, well-documented, no surprise pricing
- Rate limits are generous (~30 req/min), and we cache 5 min server-side anyway
- **This is the safe choice.**

## My recommendation: stick with TheSportsDB

The Sofascore options would give slightly richer data (live in-play scores, more leagues), but the legal + stability risk is real — Sofascore actively blocks scrapers, and any third-party wrapper is one cease-and-desist away from disappearing. For a public production site like NAFT, that's not worth it.

TheSportsDB delivers everything your spec asked for:
- Upcoming fixtures (`eventsnextleague.php?id=...`)
- Past results with final scores (`eventspastleague.php?id=...`)
- LIVE status field (`strStatus`)
- Team names, dates, league names
- Free, legal, stable

## Plan: build the original Sports Schedule & Results system on TheSportsDB

Same plan I presented before — no changes needed. Recap:

### Files

```text
new   supabase/functions/get-sports-data/index.ts
        - Fetch 6 endpoints in parallel (3 leagues × upcoming + past)
        - Normalize to { upcoming: [...], results: [...] }
        - 5-min cache in site_settings.sports_cache
        - Stale-while-error fallback in site_settings.sports_cache_last_good (24h)
        - CORS enabled, no auth required

new   src/hooks/useSportsSchedule.ts
        - Calls edge function, exposes { upcoming, results, loading, stale, lastFetched, refresh }
        - Shared subscriber pattern (same as useEconomicCalendar)
        - 10-min auto-refresh, only when tab visible

new   src/components/sports/SportsScheduleSection.tsx
        - Filter tabs: All / Football / Cricket / Basketball
        - Upcoming Matches grid (team vs team, date, time, league)
        - Latest Results grid (scores, winner in lime, loser in red)
        - LIVE pulse-dot badge for in-progress matches
        - WON/LOST badge when result matches a sports_predictions row
        - Manual refresh button + "updated X min ago"
        - Stale data badge when serving fallback
        - Skeleton loaders, mobile responsive, glass-card + red-glow styling

edit  src/pages/Sports.tsx
        - Mount <SportsScheduleSection /> below the existing tabs section
```

### Leagues (TheSportsDB IDs from spec)
- Football → EPL, ID `4328`
- Cricket → IPL, ID `4424`
- Basketball → NBA, ID `4387`

### Prediction matching (bonus from spec)
On load, fetch `sports_predictions` rows. For each result card, match `homeTeam`/`awayTeam` against `team_a`/`team_b` (case-insensitive includes), determine actual winner from scores, compare to prediction text → show WON (green) or LOST (red). UI overlay only, no DB writes.

### Safety / risk notes
- **No new secrets needed** — TheSportsDB key `1` is public and hardcoded
- **Cache + stale-fallback** ensures `/sports` keeps working even if TheSportsDB is down for hours
- **No scraping, no ToS violations, no legal risk**
- **No new dependencies, no DB migration** — `site_settings` already exists with arbitrary key support

### What you'll see
- New "Sports Schedule & Results" section on `/sports`
- Real EPL fixtures, NBA games, IPL matches refreshing every 10 min
- Final scores with winner highlighted lime, loser red
- LIVE pulse-dot on in-progress matches
- WON/LOST tag on results matching your predictions

