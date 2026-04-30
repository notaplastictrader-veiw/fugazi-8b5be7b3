## Goal

Make the **Settled / Correct / Win Rate** stats on `/sports` actually move. Auto-settle returns 0 because the upstream RapidAPI feed doesn't cover the obscure leagues we're snapshotting (Kazakhstan, Israel, Estonia, etc.). Solution: give admin a fast manual settle UI, and improve auto-settle as a bonus.

## Changes

### 1. `src/pages/admin/SportsAdmin.tsx` — Manual settle controls

For each row whose `match_date` is in the past AND `is_correct` is null, show inline controls in the table:

- **Score input** (e.g. `2-1`) — small text field, 60px wide
- **Win** button (green) → sets `is_correct = true`, `result = score`
- **Loss** button (red) → sets `is_correct = false`, `result = score`
- **Void** button (gray) → sets `is_correct = null`, `result = "VOID"` (excluded from win rate since `is_correct` stays null)
- **Reset** button (only shown for already-settled rows) → clears `result` + `is_correct`

For rows already settled, show a colored badge: ✅ WIN / ❌ LOSS / ⊘ VOID with the score, plus the Reset button.

For future matches (match_date > now), show "—" (no controls).

All updates go through `supabase.from('sports_predictions').update(...)` with toast confirmation and table refresh.

### 2. `supabase/functions/settle-sports-predictions/index.ts` — Better logging + 2nd endpoint

- Add `console.log` for every unmatched row showing what the upstream API returned (so we can see the actual team-name format)
- Add a 3rd fallback endpoint path `/football-get-all-matches-by-date?date=...` to try one more variant
- No behavior change for matched rows — just better diagnostics for next time

### 3. `src/pages/Sports.tsx` — Stat copy tweak

Current bottom text: `"51 picks still pending — win rate updates as matches settle."`

Change to: `"Stats update as admin settles past matches. Cron auto-settles when upstream data is available."` (so users understand it's not broken).

## Files

- `src/pages/admin/SportsAdmin.tsx` — add settle column + handlers
- `supabase/functions/settle-sports-predictions/index.ts` — extra logging + fallback endpoint
- `src/pages/Sports.tsx` — one-line copy change

## Out of scope

- No DB migration (table already has `result` + `is_correct` columns)
- No new edge function
- No changes to snapshot job or cron schedule

## After deploy

You go to `/admin/sports`, type a score, click Win/Loss for past matches → stats on `/sports` update instantly.