## Goal
Card footer-e clear visual hierarchy: Bonus CTA = loud primary action, Read Review = quiet secondary link.

## Change

**File**: `src/components/common/OfferRail.tsx` — only the active no-code branch (the broker bonus button, lines 77-95).

Replace transparent muted button with solid lime CTA:
- `bg-primary text-primary-foreground hover:bg-primary/90`
- Soft lime drop-shadow (`shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)]`) that lifts on hover
- Slightly larger arrow (w-3.5) with translate animation
- Keeps full-width, same padding, same font (Barlow Condensed extrabold uppercase)

Unchanged:
- "No active bonus — check back soon" → still dashed muted (correct, it's not actionable)
- Coupon-code variant (the chevron rail) → already has its own colored treatment
- `BrokerCard` "Read Review" link → already `text-foreground/70 hover:text-primary` which works as the quiet secondary; no edit needed
- Works automatically across Dark (lime), Light (green), Sentinel (red) themes via `--primary` token

## Out of scope
- No data/logic changes
- No PropFirmCard or section-level changes
- No layout shifts (same height/padding)

After approval I'll apply the edit and screenshot the result for QA.