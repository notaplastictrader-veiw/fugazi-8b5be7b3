## Problem

"Upcoming Predictions" e goto mash/tarikh er match guloo show korche. Karon current logic shudhu `!p.result` check kore — match_date past ki future seta dekhe na. Fole admin/AI feed jodi result fill na kore, expired matches forever "Upcoming" e atke thake.

## Fix

`src/pages/Sports.tsx` (lines 129-131) e date-based filter add korbo:

```ts
const nowMs = Date.now();
const UPCOMING_GRACE_MS = 3 * 60 * 60 * 1000; // 3h grace (live match window)

const upcoming = filtered
  .filter((p) => !p.result && new Date(p.match_date).getTime() + UPCOMING_GRACE_MS > nowMs)
  .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
```

### Logic
- **Future matches** → Upcoming e thakbe ✓
- **Live (last 3h)** → grace window e thakbe (jate live match list theke vanish na hoy)
- **3 ghonta+ purono + no result** → Upcoming theke chole jabe (silently expire)

### Side effects
- Total count "52 matches" automatically kombe — shudhu valid future matches dekhabe
- Pagination o auto-correct hobe
- Popular pin window (48h) already future-only, tai oitar kono change lagbe na

### Optional polish (jodi chao)
Expired matches er jonno ekta separate "Awaiting Result" section — jate admin dashboard theke shob settle korte pare. Bolo lagbe ki na, default e shudhu hide kore dibo.

## Files
- `src/pages/Sports.tsx` — 1 filter line update
