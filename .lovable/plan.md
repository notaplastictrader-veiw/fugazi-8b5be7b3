# Fix: Restore Risk Color + Fix Wrong Match Date

## Issue 1 — Risk color
User wants the colored risk indicator back (green/yellow/red based on confidence), but keep the label as just "Risk" (no Low/Medium/High wording).

**Fix in `src/components/sports/PredictionCard.tsx`:**
```ts
const getRiskLevel = (confidence: number) => {
  if (confidence >= 75) return { label: "Risk", color: "text-primary" };       // green
  if (confidence >= 55) return { label: "Risk", color: "text-accent" };        // yellow
  return { label: "Risk", color: "text-destructive" };                          // red
};
```
Result: badge color still signals quality at-a-glance, but no "Low/Medium/High" wording.

## Issue 2 — "Yesterday" shown for a match starting in 15 minutes
**Root cause** (in `supabase/functions/get-sports-data/index.ts`, line 285):
The football-prediction API returns `start_date` as a string like `"2026-04-29 19:00:00"` **without a timezone suffix**. JavaScript's `new Date("2026-04-29 19:00:00")` interprets this as **local browser time**, not UTC. The API's intent is UTC, so:
- Match meant for 19:00 UTC (= 01:00 next day in BST)
- Browser parses as 19:00 local → renders as previous day after re-conversion
- Result: "Yesterday · 19:00" even though it's actually starting soon

**Fix:** Normalize the date in the edge function to a proper UTC ISO string before returning.

```ts
function toUtcIso(s: any): string {
  if (!s) return new Date().toISOString();
  const str = String(s).trim();
  // Already has TZ info (Z or ±HH:MM)
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
  }
  // Date-only "YYYY-MM-DD" → UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str + "T00:00:00Z").toISOString();
  }
  // "YYYY-MM-DD HH:MM[:SS]" without TZ → treat as UTC
  const m = str.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)/);
  if (m) {
    return new Date(`${m[1]}T${m[2]}Z`).toISOString();
  }
  // Fallback: let JS parse, but force ISO output
  const d = new Date(str);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}
```

Then change line 285 from:
```ts
date: p.start_date || p.iso_date || new Date().toISOString(),
```
to:
```ts
date: toUtcIso(p.start_date || p.iso_date),
```

This guarantees the frontend always receives a proper UTC ISO string. The frontend already converts to local timezone via `Intl.DateTimeFormat`, so each user sees the correct time in their own zone.

## Files
- `src/components/sports/PredictionCard.tsx` — restore risk colors
- `supabase/functions/get-sports-data/index.ts` — add `toUtcIso` helper, normalize date

## Notes
- After deployment, the cached payload may still have wrong dates for ~10 minutes. Manual refresh button will update it.
