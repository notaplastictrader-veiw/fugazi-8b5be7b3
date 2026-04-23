

## Forex Factory data — manual vs API

Forex Factory **does not offer a public API** — they explicitly forbid scraping in their ToS. So your two real options are:

### Option A — Use what's already built (JBlanked + admin)
You already have this set up and working:
- **JBlanked Forex Factory feed** — pulls the same Forex Factory data automatically once per day (free tier limit). Already wired into `get-economic-calendar` edge function.
- **Admin panel** (`/admin/calendar`) — lets you manually add/override events anytime. Manual entries take priority over the live feed on the `/calendar` page (already merged by date+title).

This means **you don't have to choose** — both work together right now.

### Option B — Manual only
Visit forexfactory.com weekly, copy the high-impact events you want, paste them into `/admin/calendar`. Slower but you control exactly what shows. JBlanked feed can be disabled if you prefer.

### Option C — Scrape Forex Factory directly
**Not recommended.** Violates their ToS, breaks whenever they change their HTML, and risks IP bans. Skip.

## Recommendation

Keep the current setup (Option A). JBlanked is literally a licensed reseller of Forex Factory data — same source, legal access, auto-refresh. Use the admin panel only when you want to:
- Highlight a specific event with custom commentary
- Add an event JBlanked missed
- Override the description/impact

## What I'd do (when approved)

Nothing to build — the system is already in place. Just confirm you want to:
1. **Keep JBlanked auto-feed running** (current state) — calendar fills itself daily.
2. **Use admin panel only when needed** for overrides or custom highlights.

If you want any of these tweaks, tell me which:
- Add an "Auto-imported from JBlanked" badge to live events vs manual ones on `/calendar`
- Add a "Refresh now" button in `/admin/calendar` to force-fetch JBlanked (uses your daily quota)
- Filter the live feed to only high-impact events (cleaner page)
- Disable JBlanked entirely and go full manual

Pick any combination, or say "keep as is" and we're done.

