

## What you're asking
Surface the same red "Full Investigation Report" + "Repeat Offender" badge from `ScamAlertDetail` on the linked broker's own profile page (`BrokerDetail`). Right now scam alerts can be linked to a broker via `broker_id` but the broker page never queries `scam_alerts`, so nothing shows up.

## Plan

### `BrokerDetail.tsx`
1. After fetching the broker, query `scam_alerts` for any rows where `broker_id = broker.id` AND `status = 'published'`.
2. Render a new red-highlighted block above the Reviews section when at least one alert exists:
   - Header: ⚠️ "ACTIVE INVESTIGATIONS" in red, count chip
   - For each alert, show: title, severity chip, "REPEAT OFFENDER" badge (if `is_repeat_offender`), short description, and the `full_report` long-form text inside a `bg-destructive/5 border-destructive/30 rounded-xl` block (only when `show_full_report && full_report`).
   - "View Full Alert →" link to `/scam-alerts/{id}`
3. Also show a small persistent **"⚠ Under Investigation"** chip in the broker header next to the existing badges if any published alert exists for this broker.

### Files touched
- `src/pages/BrokerDetail.tsx` — add query + render block + header chip

### Out of scope
- New schema (already added in previous migration)
- Auto "repeat offender" detection
- Editing alerts from the broker page (admin-only, stays in admin panel)

