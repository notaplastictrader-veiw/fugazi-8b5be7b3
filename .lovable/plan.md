# Update `/how-we-review` copy

Frontend-only edits to `src/pages/HowWeReview.tsx`. No DB, no logic changes.

## Goals
- Stop referencing "Last verified" badge (removed from broker cards).
- Soften "Independent & unpaid" so it doesn't claim "no affiliation" (since Open Account CTAs will be affiliate-linked).
- Rewrite the conflict-of-interest block so it stays truthful and trust-building, without naming affiliate links or commissions. Focus the promise on **scoring integrity** (revenue never moves Trust Scores), not on revenue sources.

## Changes

### 1. "Update cadence" section
Remove the sentence about a "Last verified" timestamp on every broker page. Keep only the auto-recalculation line.

New copy:
> Trust Scores recalculate automatically whenever a new review, complaint, or regulatory change is recorded — so the score you see today reflects the most recent signals from our community.

### 2. Principles → "Independent & unpaid" tile
Rename + reword. Don't claim we have no commercial relationships; claim our scoring is not for sale.

- **Title:** `Scores you can't buy`
- **Text:** `No broker can pay to raise their Trust Score, hide complaints, or escape a scam alert. Scoring is driven entirely by regulator data, user reviews, and complaint history — not commercial relationships.`

(Keep the other two principle tiles — "Continuously updated" and "Right of reply" — but drop the "Last verified date" mention from "Continuously updated":)

- **Continuously updated text:** `Scores recalculate as new reviews, complaints, and regulator updates come in. The picture you see is always the latest one.`

### 3. Conflict-of-interest section
Rename to something less legalistic, and reframe around the firewall between revenue and scoring — without listing what the revenue *is*.

- **Heading:** `Editorial firewall`
- **Body (replaces all three current paragraphs):**
  > NAFT operates a strict separation between commercial activity and editorial scoring. Whatever commercial arrangements exist on the platform, **none of them affect a broker's Trust Score, ranking position, or visibility in scam alerts.**
  >
  > Sponsored placements — when they appear — are clearly labelled "Sponsored" or "Featured" and are visually distinct from organic listings.
  >
  > If you ever feel a listing looks unfair or compromised, email [hello@notafugazitrader.com](mailto:hello@notafugazitrader.com). We investigate every report and publish corrections.

## Out of scope
- No changes to other pages (About, Footer, etc.).
- No changes to broker cards, scoring logic, or DB.
- No new "Affiliate disclosure" page (intentionally omitted per user direction).

## Files touched
- `src/pages/HowWeReview.tsx` — text-only edits inside the existing `principles` array and JSX sections.
