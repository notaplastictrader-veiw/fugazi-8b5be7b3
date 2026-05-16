## Merge disclaimer + unclaimed notice into one line

**Problem:** Currently two separate banners feel redundant:
1. "This review is based on our independent research..." (affiliate disclosure)
2. "Unclaimed profile — information is sourced from public data... Are you from Exness? Claim this profile"

The red-highlighted empty space below the header (between "Claim This Profile" pill and the bonus banner) is wasted.

**Fix:** In `src/pages/BrokerDetail.tsx`, place ONE compact single-line notice in that empty space:

```
ⓘ  Independent research + community data · NAFT may earn commission via links — doesn't affect our rating.
```

- Subtle muted text, small font-mono, info icon on the left
- Sits right above the "Claim 100% Bonus" promo strip
- Remove the separate "Unclaimed profile..." banner since the "Claim This Profile" pill already exists in the header (no need to repeat the ask)
- Remove the standalone affiliate disclosure block lower on the page (now consolidated here)

**Out of scope:** No changes to the Claim pill, bonus banner, stats tiles, or sidebar.