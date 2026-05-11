## Broker Card Cleanup (Homepage Trust Hub)

Tone down the visual noise on the broker/prop firm cards based on the screenshot feedback.

### Changes (frontend only — `src/components/sections/BrokerTrustHub.tsx`)

1. **Remove "Verified Xd ago" badge**
   - Drop the bottom-row "Verified 23d ago" pill from `BrokerCard`.
   - Keep `last_verified_at` data flowing (still shown on `BrokerDetail` page); just hide it on homepage cards.
   - The bottom row will only render when there's a complaint warning to show.

2. **Merge duplicate "Full review" + "View Profile" CTAs**
   - Remove the small "Full review ↗" link next to the star rating (top-right of footer row).
   - Rename the main button from **"View Profile →"** to **"Read Full Review →"**.
   - Apply the same change to `PropFirmCard` for consistency.

3. **Mute the highlights** (so the trust score + CTA stop fighting each other)
   - Score bar: replace solid `bg-primary` / `bg-accent` / `bg-destructive` fills with a softer tone (e.g. `bg-primary/70`) so the lime bar doesn't dominate.
   - Main CTA button: drop the colored border + colored text, switch to a quieter style — neutral border (`border-border`), `text-foreground`, subtle hover (`hover:bg-secondary`). The card stops looking like everything is a primary action.
   - "Trust Score X/10" number: keep `text-foreground` but lighten the surrounding label weight; the bar already conveys the value.
   - Verified/Featured pills at top: keep as-is (they're meaningful brand signals), but they'll feel calmer once the bar + button quiet down.

### Out of scope
- No DB changes.
- No changes to `BrokerDetail` page (Last Verified badge there stays).
- No changes to listing pages (`/brokers`, `/prop-firms`) — only the homepage Trust Hub cards.
