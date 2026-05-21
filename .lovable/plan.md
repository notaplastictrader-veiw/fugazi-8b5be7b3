## Problem
The "Min Deposit" stat card on `/brokers/pepperstone` is showing a long sentence ("$0 mandatory minimum. Broker recommends $200 for sufficient margin...") because `brokers.min_deposit` for Pepperstone was stored as a full descriptive string. The card should show one clean number.

## Fix
Update the `min_deposit` column for Pepperstone in the `brokers` table to a single clean value: **`$0`** (Pepperstone has no mandatory minimum; the $200 recommendation belongs in the long review, not the stat card).

The detailed context ($200 recommended, $10 for some payment methods) is already preserved in the `long_review` / account types section, so no information is lost.

## Scope
- One `UPDATE` on `public.brokers` where `slug = 'pepperstone'` setting `min_deposit = '$0'`.
- No code changes — the stat card already renders `broker.min_deposit` directly; once the DB value is a clean number, the card will display cleanly.

## Out of scope
- No schema change.
- No changes to other brokers.
- No frontend logic to parse/truncate strings (cleaner to keep `min_deposit` as a short display value by convention).
