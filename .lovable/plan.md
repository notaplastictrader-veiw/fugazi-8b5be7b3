# Simplify Risk Label & Confirm Time Display

## Changes

### 1. Risk warning — remove Low/Medium/High
In `src/components/sports/PredictionCard.tsx`, change the risk warning text from "Low Risk / Medium Risk / High Risk" to just **"Risk"**, with neutral muted color (no green/red/yellow).

New line will read:
> ⚠ Risk — Betting involves financial risk. Never bet more than you can afford to lose.

This avoids implying any bet is "safe" — protects against objections.

### 2. Time display — keep auto local time (browser timezone)
Already implemented in last turn. Each visitor sees the match start time in their own local timezone (e.g. user in Dhaka sees BST, user in London sees GMT/BST). No code change needed for this.

### 3. "Yesterday · Awaiting result" behavior
This is **correct, not a bug**: the match in the screenshot was scheduled Yesterday 20:00, started >3h ago, and admin hasn't entered the result yet. So "Awaiting result" is accurate. The card properly shows:
- When it was scheduled: `Yesterday · 20:00`
- Current state: `Awaiting result`

No change needed. Once you enter the result in `/admin/sports`, the badge will switch to "CORRECT" or "WRONG" automatically.

## Files
- `src/components/sports/PredictionCard.tsx` (edit risk label only)
