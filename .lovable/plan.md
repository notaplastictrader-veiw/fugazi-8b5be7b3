## Revert to compact card layout (image-102 style)

Switch back to the previous compact footer in `src/components/sections/BrokerTrustHub.tsx`:

- Remove the full-width "Read Full Review" button at the bottom of `BrokerCard` and `PropFirmCard`.
- Bring back the single footer row: star rating + count on the left, a small link on the right.
- Rename that link from **"Full review ↗"** → **"Read Full Review ↗"**.
- Keep the muted score bar (opacity-70) and muted Trust Score number from the last change.
- Keep "Verified Xd ago" badge removed.
- Complaint warning (>20 complaints) keeps showing on the right side of the footer row when applicable (replaces the link in that case, same as before).

Frontend-only, no DB changes.
