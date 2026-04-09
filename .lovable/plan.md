

# Prop Firms Section — Show Only Prop Firm Cards (3-6)

## Current State
The Prop Firms section in `BrokerTrustHub.tsx` already has prop firm name chips, filter buttons, and a grid of cards fetched from Supabase (`type === "prop-firm"`). But currently no prop firm data may be in the DB, so the section appears empty.

## Change
- Limit the prop firm cards to a max of 6 (`slice(0, 6)`) so only 3-6 show on the homepage
- Remove the filter buttons from the prop firms section (filters belong on the full `/prop-firms` page)
- Keep: section tag, title, description, name chips, card grid (3-6 cards), "View All Prop Firms" link

## File: `src/components/sections/BrokerTrustHub.tsx`

1. **Remove** `propFilter` state and `propFirmFilters` array usage from the prop firms section
2. **Remove** the filter buttons block (lines 184-191)
3. **Limit** `filteredPropFirms` to `.slice(0, 6)` in the grid rendering
4. Keep everything else (chips, title, cards, view all link)

