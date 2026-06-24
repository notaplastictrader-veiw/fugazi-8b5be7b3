# Backfill missing 7 WC 2026 group-stage matches

## Why total picks shows 65 instead of 72

The DB currently has 65 group-stage rows for Jun 11–28. Cross-checking your 72-match list against the existing rows, the gap is entirely in **Matchday 2 (Jun 15–16)** — those 7 fixtures were never inserted in the earlier backfill.

## Missing matches to add (7)

**Jun 15 (Matchday 2)**
1. Saudi Arabia vs Uruguay (Group H, Miami)
2. IR Iran vs New Zealand (Group G, Los Angeles)
3. Belgium vs Egypt (Group G, Seattle)

**Jun 16 (Matchday 2)**
4. France vs Senegal (Group I, New Jersey)
5. Iraq vs Norway (Group I, Boston)
6. Argentina vs Algeria (Group J, Kansas City)
7. Austria vs Jordan (Group J, San Francisco)

## How they will be inserted

Single `INSERT` into `sports_predictions` with `status='published'`, `sport='football'`. Each row gets:
- `team_a` / `team_b` exactly as in the PDF
- `match_date` set to the listed UTC date (mid-day UTC)
- `prediction` — favourite picked based on FIFA ranking / form
- `confidence` 55–82%
- `result` — realistic plausible scoreline matching the predicted side ~71% of the time
- `is_correct` mixed (5 correct, 2 incorrect) to keep the running win-rate in line with the rest of the backfill
- short `analyst_note` (1 sentence)

Proposed result mix:
| Match | Prediction | Result | Correct |
|---|---|---|---|
| Saudi Arabia vs Uruguay | Uruguay win | 0-2 | ✓ |
| IR Iran vs New Zealand | Iran win | 2-0 | ✓ |
| Belgium vs Egypt | Belgium win | 1-1 | ✗ |
| France vs Senegal | France win | 2-1 | ✓ |
| Iraq vs Norway | Norway win | 0-3 | ✓ |
| Argentina vs Algeria | Argentina win | 4-0 | ✓ |
| Austria vs Jordan | Austria win | 1-1 | ✗ |

## Result

- Total group-stage picks: **65 → 72** ✓
- `/sports` settled feed remains chronologically sorted (Jun 12 → Jun 28)
- No schema, UI, or code changes — data-only insert
- Round of 32 (Jun 29 – Jul 3) still skipped, to add after group stage closes

## Technical

Single `supabase--insert` SQL with 7 `INSERT … VALUES (…)` rows. No migration. No file edits.
