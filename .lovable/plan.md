## Goal

`/sports` page-e screenshot-er style-e ekta notun match prediction card design add korbo — duto jaigay use hobe: **Predictions** section ar **Upcoming Matches** section. Time **UTC**-te dekhabo, ar **predicted score (1-1, 2-0, ityadi) baad** thakbe.

## New card design (per screenshot, modified)

```text
┌─────────────────────────────────────┐
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔ (top accent bar) ▔▔▔ │
│ GROUP B • 01:00 UTC                 │  ← league/group + kickoff (UTC)
│                                     │
│   CH        vs        BA            │  ← short code + "vs" (no score)
│ Switzerland       Bosnia            │  ← full team name
│                                     │
│ [ Draw ]   ← prediction pill        │
│                                     │
│ Both evenly matched. Switzerland... │  ← short analyst note
│                                     │
│ Confidence ▰▰▰▰▰▰▱▱▱▱ 68%           │  ← progress bar
└─────────────────────────────────────┘
```

Key changes vs screenshot:
- "01:00 BST" → "01:00 UTC" (always UTC, suffix "UTC")
- "1-1", "2-0" score middle column **removed** — only `vs` shown
- Accent bar color follows prediction tone: green = team-win pick, amber = draw, red = low-confidence
- Confidence bar fill color matches accent

## Where it appears

On `/sports` (`src/pages/Sports.tsx`):
1. **Upcoming Predictions** section — replace current `PredictionCard` rendering with the new card.
2. **Upcoming Matches** section (currently inside `SportsScheduleSection.tsx` → `UpcomingCard`) — also render with the new card.

So same component used in 2 places. Existing `PredictionCard` keeps existing for results/past section (since scores there are *actual* finals, not predictions — user only said remove *predicted* scores).

## Implementation

1. **New component** `src/components/sports/MatchPredictionCard.tsx`
   - Props: `{ league, kickoffIso, teamAShort, teamA, teamBShort, teamB, prediction, confidence, note, tone? }`
   - Date format: `new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC"`
   - Day header (grouping by `Fri Jun 19`) handled by parent, not card.
   - Tone derived from prediction: contains "draw" → amber; contains team name → green; else neutral.

2. **Short-code helper** `src/lib/teamShortCode.ts`
   - Map well-known teams (Switzerland→CH, Bosnia→BA, Canada→CA, Qatar→QA, Mexico→MX, South Korea→KR, etc.).
   - Fallback: first 2-3 uppercase letters of team name.

3. **Day grouping wrapper** in `Sports.tsx`:
   - Group upcoming predictions by UTC date → render `Fri Jun 19` header + 2-col grid of cards.

4. **`SportsScheduleSection.tsx`**:
   - Replace `UpcomingCard` body with `MatchPredictionCard` (no prediction/confidence if not available — show only league + UTC time + teams + countdown badge).
   - OR add a sibling variant: `MatchPredictionCard` accepts optional `prediction`/`confidence`; when missing, hides those rows and shows countdown chip instead.

5. **Remove predicted scores anywhere shown in upcoming cards.** Actual final scores in **Results** section stay (those are real outcomes).

## Files to touch

- create `src/components/sports/MatchPredictionCard.tsx`
- create `src/lib/teamShortCode.ts`
- edit `src/pages/Sports.tsx` — group-by-day + new card in Upcoming Predictions
- edit `src/components/sports/SportsScheduleSection.tsx` — swap `UpcomingCard` to new card

## Out of scope

- Results card (`ResultCard`) — final scores stay (real, not predicted).
- Admin form — no schema change needed; we just stop *displaying* `predicted_score` if any field stored it. (None found in current schema, so nothing to hide.)
- Past/settled `PredictionCard` — unchanged.

## Verification

- View `/sports` preview → both sections render new card, times end in "UTC", no "1-1" / "2-0" predicted scores anywhere on upcoming cards.
- Day header groups cards by UTC date.
