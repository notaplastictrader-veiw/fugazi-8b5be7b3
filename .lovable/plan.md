## Issue

Homepage IC Markets card e "NAFT Testing In Progress" dekhache, "Read Review" CTA nai. Karon `BrokerCard` ar `PropFirmCard` `review_count === 0` hole shoja "testing in progress" dekhay — IC Markets er long_review (full editorial) thakleo community review row nai.

## Fix

Logic update: "NAFT Testing In Progress" tokhonoi dekhabe jokhon broker er **kichui nai** (review_count 0 AND long_review missing). Editorial review (long_review) thakle "Read Review" CTA dekhabe.

### Files to edit

**`src/components/broker/BrokerCard.tsx`**
- `Broker` type e `long_review?: any` add
- Line 181 condition: `(broker.review_count || 0) === 0` → `(broker.review_count || 0) === 0 && !broker.long_review`

**`src/components/sections/BrokerTrustHub.tsx`** (PropFirmCard inline, line 141)
- Shame condition update

Out of scope: separate `nfft-testing` tag badge in PropFirms list page (sheta tag-based, intentional).

## Note for IC Markets specifically

Tomi homepage e dekhachho karon BrokerTrustHub `show_on_homepage=true` brokers er por top-scored brokers diye slot fill kore — IC Markets score 8.3 tai top fill e ese gese. Ei fix er por shob brokers jara editorial review ache tara "Read Review" dekhabe.