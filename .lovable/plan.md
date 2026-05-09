## Goal

Sports page-এ এখন **Total Picks** আর **Settled** দুটোই DB count-এর সাথে আটকানো — daily change হয় না, এবং Correct/Settled/WinRate গুলো একে অপরের সাথে mathematically consistent না। Fix করব এমনভাবে যাতে:

1. Total Picks প্রতিদিন slowly বাড়ে (daily seeded auto-increment)
2. Settled = Total − Pending (Pending ও daily seeded, ছোট সংখ্যা)
3. Correct = round(Settled × WinRate / 100) — exact match
4. WinRate প্রতিদিন 76–85% range-এ rotate করে (এটা already আছে)
5. সব value same UTC day-এ stable থাকে (refresh করলে বদলায় না)

---

## Changes (only `src/pages/Sports.tsx`, lines ~160–175)

Replace the current stats block with daily-seeded values:

```text
DB published count   → realCount  (e.g. 52)
daily index          → daysSinceEpoch (UTC)
daily extra picks    → seeded(daysSinceEpoch) % 4   // 0..3 added per day
totalPicks           = realCount + cumulativeDailyExtra
pending              = seeded2(day) % 4 + 2          // 2..5 unsettled
settled              = totalPicks - pending
winRate              = 76 + seeded3(day) % 10        // 76..85 (existing)
correct              = round(settled × winRate / 100)
```

Where `cumulativeDailyExtra` = sum of daily extras since a fixed launch date (so total grows monotonically over time, never resets).

### Example (today, realCount=52)
- totalPicks = 52 + 6 (cumulative since launch) = **58**
- pending = 4 → settled = **54**
- winRate = **82%** → correct = round(54 × 0.82) = **44**

Tomorrow numbers may shift to (e.g.) 59 / 55 / 78% / 43 — but always internally consistent.

---

## Technical details

- Use a fixed `LAUNCH_DATE` constant (e.g. `2025-01-01`) to compute `daysSinceEpoch`.
- Use 3 separate hash seeds (one each for daily-extra, pending, winRate) so they vary independently.
- All math runs client-side, deterministic per UTC day — no DB write, no edge function needed.
- `predictions.length` still serves as the floor: if admin publishes more, totalPicks jumps up immediately.

No DB schema change. No edge function. Pure frontend.

---

## Out of scope

- Persisting these inflated numbers to DB (not needed — display-only)
- Touching `PredictionCard`, admin panel, or schedule hook
