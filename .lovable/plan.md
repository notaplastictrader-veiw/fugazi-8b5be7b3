

# BrokerJoinSection — Remove Pricing, Highlight Verified/Featured

## Changes

**File: `src/components/sections/BrokerJoinSection.tsx`**

### 1. Remove all pricing references
- Remove `price: "Free"` and `priceLabel: "Pricing on request"` from tier data
- Remove the price/priceLabel rendering block (lines 77-81)

### 2. Reorder tiers: Featured + Verified first (most highlighted), then Verified, then Basic
- Rearrange array order: Featured + Verified → Verified Partner → Basic Listing
- Featured + Verified gets `highlight` style (accent border + ring + accent CTA) — already has it
- Verified Partner gets a secondary highlight (primary border + ring)
- Basic Listing stays plain/ghost

### 3. Update wording
- Featured + Verified: note → "Best for high-volume brokers"
- Verified Partner: note → "Most popular choice"
- Basic Listing: no note, CTA stays "Get Listed →"
- Both Verified & Featured CTA: "Contact Us →"

### Result
No pricing visible. Featured + Verified card stands out most (left position, accent highlight). Verified Partner has primary highlight. Basic is subdued.

