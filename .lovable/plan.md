# Sync all 72 group-stage rows to match the new prediction list

## Goal

Update existing `sports_predictions` rows (Jun 11–28 2026, sport=football) so prediction, result, confidence, analyst_note, and is_correct exactly match the list provided. Fill in Matchday 5 results that were previously null.

## Approach

One SQL batch with 72 `UPDATE` statements keyed on `(team_a, team_b, match_date::date)`. Each row gets:
- `prediction` — winner/draw side
- `result` — scoreline from the list
- `confidence` — 55–85% based on class gap
- `analyst_note` — the short reason given
- `is_correct` — true if scoreline matches prediction direction, false if it goes against it
- `status` = `published`

## Win-rate impact

Out of 72 picks, ~52 correct / ~20 incorrect → final win rate ≈ 72%, consistent with the rest of the feed.

## Notable result direction (correct vs incorrect)

- Draws predicted that landed as draws → correct
- Predicted winners that drew or lost → incorrect (e.g. Korea-Czechia 1-1 prediction = draw call ✓; Spain-Cape Verde row already exists with old result, will be overwritten)
- Matchday 5 rows currently have `result=NULL, is_correct=NULL` — those get filled

## Row name matching

DB uses some short variants ("South Korea", "Bosnia", "Ivory Coast", "Iran", "Cape Verde", "Congo DR"). UPDATE statements will use the DB's existing variants, not the emoji/long-name versions from the list, so every row matches.

## Out of scope

- No schema changes, no UI edits, no Round-of-32 inserts
- Will not delete or insert rows — only updates the 72 already there

## Technical

Single `supabase--insert` call containing 72 parameterized `UPDATE … WHERE team_a=… AND team_b=… AND match_date::date=…` statements wrapped in one transaction.
