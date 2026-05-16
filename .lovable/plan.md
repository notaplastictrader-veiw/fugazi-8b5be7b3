## Goal

Add demo/example data to trust sections so the site looks alive while you collect real submissions. You'll later override with live DB data once users start uploading.

## Changes

### 1. `src/components/sections/TrustTimeline.tsx`
- Already has a curated `EVENT_LIBRARY` for 6 brokers (Exness, IC Markets, Pepperstone, FTMO, XM, Quotex) and a `FALLBACK_EVENTS` for unknown brokers — it's already demo-filled. ✅ No change needed unless you want more brokers added. I'll add 2-3 more example slugs (e.g. `xtb`, `oanda`, `forex-com`) so any broker tab shows rich events.

### 2. `src/components/broker/WithdrawalProofGallery.tsx` (Verified Withdrawals on broker pages)
- Currently shows empty state when DB has zero verified proofs.
- Add a `DEMO_PROOFS` fallback array (4-6 example payouts: amount, method, payout time, date, demo screenshot URL, optional note).
- When `proofs.length === 0`, render the demo cards with a subtle `DEMO` ribbon/badge on each card and a small caption: _"Example payouts shown — submit yours to replace these with real verified proofs."_
- Keep the existing "Submit your payout" button.

### 3. `src/components/sections/PayoutSpeedLeaderboard.tsx`
- Already has `FALLBACK` with 8 brokers — works fine. ✅
- Update the footer caption from:
  > Data sourced from verified user-submitted withdrawal proofs · updated continuously
  
  to something that signals both demo + public + community sourcing, e.g.:
  > Sourced from public broker disclosures + NAFT user-submitted proofs. Demo data shown until live submissions reach threshold · updated continuously
- Also add a tiny `DEMO` chip in the header when running off `FALLBACK` so it's transparent.

### 4. `src/components/sections/WithdrawalProofWall.tsx` (homepage Verified Withdrawals section, if present)
- I'll inspect it and add the same demo fallback pattern as #2 if it currently shows an empty state.

## Notes
- All demo data is hard-coded in the component files — easy to remove once real data flows.
- Each demo item is clearly labeled `DEMO` so users aren't misled.
- No DB / migration changes. Pure frontend.

Approve and I'll implement.