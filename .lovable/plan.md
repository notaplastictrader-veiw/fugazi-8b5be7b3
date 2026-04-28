## Goals

1. Add a clear button under **Upcoming Predictions** that smooth-scrolls to the **Latest Results** section (in `SportsScheduleSection`).
2. Fix the **stats bar** — it currently looks hardcoded because of how the numbers are computed.

## Problem with the stats bar (verified against the database)

The DB currently has **6 published predictions**:
- 4 are upcoming (`is_correct = null`) — Alcaraz, Celtics, MI vs CSK, Arsenal vs Man City
- 2 are settled (`is_correct = true`) — Real Madrid–Barça draw, RCB vs KKR

Today the stats compute:
```
totalPast  = predictions.filter(p => p.is_correct !== null)  → 2
correct    = totalPast.filter(p => p.is_correct)             → 2
accuracy   = 100%
```

So "Total Picks = 2 / Correct = 2 / Accuracy = 100%" is mathematically correct, but **semantically wrong** — the label "Total Picks" reads like it should count every prediction we've ever published, not just settled ones. That mismatch is why it looks like a fake/hardcoded value.

## Fix

In `src/pages/Sports.tsx`:

- Rename the metrics so they describe what's actually counted:
  - **Total Picks** → counts all published predictions (`predictions.length`) — currently 6
  - **Settled** → count of resolved picks (`is_correct !== null`) — currently 2
  - **Win Rate** → `correct / settled` (only shown when settled > 0; otherwise show "—")
- Add a 4th tile or inline subtitle "(N pending)" so users see why win-rate is based on a small sample.
- Hide/grey-out Win Rate when `settled === 0` instead of showing "0%".

This way every number traces directly to a real DB row and the bar updates as admins resolve picks.

## Scroll-to-results button

- Add `id="latest-results"` to the **Latest Results** `<h3>` (or its wrapper) inside `src/components/sports/SportsScheduleSection.tsx`.
- In `src/pages/Sports.tsx`, after the Upcoming Predictions grid, add a CTA:
  - Label: **"See latest results →"**
  - Style: matches the existing "View all" pill (primary outline, mono uppercase).
  - Behaviour: `document.getElementById("latest-results")?.scrollIntoView({ behavior: "smooth", block: "start" })`.
- Place it next to the existing "View all (N)" button when both exist; show standalone when there are no extra upcoming items to expand.

## Files touched

- `src/pages/Sports.tsx` — stats labels/logic + new scroll CTA
- `src/components/sports/SportsScheduleSection.tsx` — add `id="latest-results"` anchor

No DB or edge-function changes needed.