

## Issues

### 1. Photos missing in admin approval modal
`ApprovalQueueAdmin.tsx` review modal shows author/content/rating/profile but doesn't render `photo_urls`. Admins can't moderate photos before approving.

**Fix**: Select `photo_urls` in the reviews query and render thumbnail row in the review modal (same lightbox pattern as `BrokerDetail.tsx`, or just clickable thumbnails opening in new tab).

### 2. Star icons only fill 4 even when avg = 4.5
`BrokerDetail.tsx` header renders stars with `fill={i < Math.floor(stars)}` (or similar floor logic), so 4.5 → only 4 filled stars. Need **half-star** rendering for fractional averages.

**Fix**: Replace floor logic with proper half-fill — render 5 star icons where:
- `i + 1 <= floor(stars)` → fully filled
- `i + 0.5 <= stars && i + 1 > stars` → half-filled (use overlay or `fill-[url(#half)]` mask, or simpler: stack a clipped filled star over an empty one with `clip-path: inset(0 50% 0 0)`)
- otherwise → empty

Apply same fix to any other place that renders the broker average (e.g. broker list cards) if they use the same util — quick grep.

### 3. Verify "4.5 from 4★ + 5★" math
That's correct: `(4+5)/2 = 4.5`. The display is right, just the star icons are wrong (issue #2). Will confirm with a quick DB read of the two reviews.

## Files to Touch
- `src/pages/admin/ApprovalQueueAdmin.tsx` — add `photo_urls` to review query, render thumbnails in modal
- `src/pages/BrokerDetail.tsx` — half-star renderer in header rating row
- (If shared) extract a small `<StarRating value={4.5} />` helper in `src/components/reviews/` and reuse in broker cards/list — only if grep shows duplicate logic

## Out of Scope
- Lightbox in admin modal (open in new tab is enough for moderation)
- Fractional precision beyond 0.5 (rounding to nearest 0.5 is industry standard)
- Animated star transitions

