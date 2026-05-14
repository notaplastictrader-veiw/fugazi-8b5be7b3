## Goal

Show key offer info at a glance on every review card so users don't have to open the full review just to grab a code. One unified strip that combines: **discount/offer label → copy promo code → go-to-site button**. Single click on the code copies it AND opens the affiliate URL in a new tab.

## Unique design (not a clone of the reference)

The reference puts a small dashed "code" pill next to a "% OFF" pill. Ours does it differently:

```text
┌─────────────────────────────────────────────────┐
│  ◢ 25% OFF  ─ ─ ─  CODE  NAFT25   [↗ Claim]     │
└─────────────────────────────────────────────────┘
```

- A single horizontal **offer rail** sits at the bottom of the card (not two separate pills).
- Left chevron tag with the offer (e.g. `25% OFF`, `$50 BONUS`, `FREE VPS`) — accent-tinted, no border.
- A subtle dashed divider in the middle (theme-aware ticker style).
- Mono code text with a tiny copy icon — **clicking anywhere on the code copies it AND fires the affiliate redirect** (so one tap = code in clipboard + tab opens to broker signup).
- Right side: compact `Claim` arrow button (primary tint) — same action as clicking the code, just for users who only want the link.
- Toast confirms `Code copied — opening <broker>…`.
- If a broker has no code, the rail collapses to just `[↗ Visit Site]`.
- If a broker has no offer at all, the rail is hidden (card stays clean).

Visual differentiators vs the reference: single-row rail (not two boxes), chevron tag instead of rounded pill, dashed divider as connector, one-tap copy+redirect, subtle accent gradient sweep on hover.

## Where it appears

Reusable component used on:
1. `BrokerCard` and `PropFirmCard` in `src/components/sections/BrokerTrustHub.tsx` (homepage)
2. `src/pages/Brokers.tsx` and `src/pages/PropFirms.tsx` listing cards
3. `src/components/sports/BettingSiteCard.tsx`
4. Signal group cards on `src/pages/Signals.tsx` / `SignalGroupDetail.tsx`
5. Top of the full review pages (`BrokerDetail`, `SignalGroupDetail`) as a wider variant

## Data model changes

Add three nullable columns to each "reviewable" table so admins can fill in the offer per entity:

- `brokers`: `promo_code text`, `promo_label text` (e.g. `25% OFF`, `$50 BONUS`), `affiliate_url text`
- `betting_sites`: same three columns
- `signal_groups`: same three columns
- `courses`: same three columns (for course discount codes)

Existing `website_url` (brokers) and `url` (betting_sites) remain the fallback when `affiliate_url` is empty.

Admin forms (`BrokersAdmin`, `BettingSitesAdmin`, `SignalsAdmin`, `CoursesAdmin`) get three new inputs in the existing edit dialogs.

## Component plan

New file: `src/components/common/OfferRail.tsx`
- Props: `code?`, `label?`, `url`, `entityName`, `variant?: "card" | "wide"`
- Click handler: copy `code` to clipboard → toast → `window.open(url, "_blank", "noopener")` → fire `useTrackEvent("offer_claim", { entityName, code })`.
- Falls back gracefully when `code` is empty.

Existing `PromoCodeButton` stays for places that only need a copy action (no redirect), so we don't break promotions hub.

## Implementation order

1. Migration: add the three columns to the four tables.
2. Build `OfferRail` component + analytics event.
3. Wire it into the homepage `BrokerCard` and `PropFirmCard` (replaces nothing — added below the existing footer row).
4. Add it to `Brokers.tsx`, `PropFirms.tsx`, `BettingSiteCard.tsx`, signal cards.
5. Add it as the wide variant on `BrokerDetail` and `SignalGroupDetail` headers.
6. Extend the four admin forms with the three new fields.
7. Seed a few demo offers for the existing curated brokers so the homepage shows the rail right away.

## Out of scope

- No expiry countdown, no stacking multiple offers (one rail per entity for now).
- No changes to the existing Promotions hub page.
- No copyright-risky elements: no "TRUSTED" green pill, no purple coupon-ticket icon, no dual-box layout from the reference.
