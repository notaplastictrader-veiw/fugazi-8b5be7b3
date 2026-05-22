## Goal
Broker/PropFirm card er left side rail ke `w-1.5` (6px) theke `w-0.5` (2px) e komano — chikon, premium look er jonno. Color, data, layout, spacing kichu change hobe na.

## Changes
1. **`src/components/broker/BrokerCard.tsx`** — rail div er class `w-1.5` → `w-0.5`
2. **`src/components/sections/BrokerTrustHub.tsx`** — PropFirmCard er same rail pattern, `w-1.5` → `w-0.5`

## Out of scope
- Rail color, gradient, ba glow change na
- Card padding, shadow, border radius unchanged
- Data, logic, OfferRail CTA — kichu touch na