## Change

Navbar logo er niche subtitle text replace kora:

- **Old:** `Built by Traders, for Traders`
- **New:** `We worked for brokers. Now we work for you.`

## Implementation

`src/components/layout/Navbar.tsx` line 161 — text content swap.

Tagline ektu lomba (43 chars vs 30), tai existing styling (`text-[9px] font-mono tracking-[0.15em] uppercase`) thik thakbe — uppercase + mono e fit korbe single line. Mobile e logo er pashe space tight thakle ektu chap pore, kintu existing class structure already handle korbe (`leading-none` + `flex-col`).

## Out of scope

- Footer e logo subtitle nei (footer e brand description ache, separate text — change kora hocche na)
- About page er "Built by traders, for traders" (different context — community value prop, untouched)
- Hero headline (alada decision)
