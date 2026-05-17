## Goal

Take the full Exness review article you pasted and publish it live at `/brokers/exness` — with proper SEO meta, structured trading data, and a rich long-form section on the broker detail page.

## Problem

The current `brokers` table only stores compact fields (description, pros, cons, account_types, etc.). Your article is a full 3,850-word SEO review with 14 narrative sections, a verdict card, an FAQ, and dedicated SEO meta — there's no place for it today. So I need to (a) extend the schema with a single long-form column, (b) render those sections on the broker page, and (c) insert/update the Exness row.

## Plan

### 1. Database — add one column
Add `long_review jsonb` to `public.brokers` (nullable, default `null`). Single JSON blob holding the article structure:

```text
{
  seo: { title, description, og_image_alt, focus_keyword, secondary_keywords[] },
  verdict: { summary, best_for, not_ideal_for, trust_score, star_rating },
  sections: [
    { id: "introduction", heading, body },
    { id: "regulation", heading, body },
    { id: "trading-conditions", heading, body },
    { id: "deposits-withdrawals", heading, body },
    { id: "trust-breakdown", heading, body },
    { id: "pros-cons", heading, body },
    { id: "best-for", heading, body },
    { id: "comparison", heading, body },
    { id: "how-to-open", heading, body },
    { id: "support", heading, body },
    { id: "final-verdict", heading, body }
  ],
  faq: [{ q, a }, ...],
  affiliate_cta: { label, url }
}
```

No RLS change needed — existing broker policies cover it.

### 2. BrokerDetail page — render the long review
- New `<FullReview />` block rendered between the existing overview and the reviews section, only shown when `broker.long_review` is present.
- Sticky in-page TOC on desktop (left rail) listing the section headings.
- Verdict card at the top (trust score, stars, best-for / not-ideal-for chips).
- FAQ rendered as an `<Accordion>` (already in the design system).
- Internal-link placeholders (`[INTERNAL LINK: …]`) auto-converted to real `<Link>` tags using a small mapping (How We Review → `/how-we-review`, Exness vs XM → `/compare/exness-vs-xm`, withdrawal proofs → `#withdrawal-proofs` anchor on same page, file complaint → `/file-complaint`, write a review → scrolls to existing review form).
- Affiliate CTA reuses the existing `<AffiliateDisclosure>` component.

### 3. SEO upgrades on BrokerDetail
When `long_review.seo` exists:
- Override `<SEO title>` and `description` with the article's values.
- Append `FAQPage` JSON-LD (using existing `faqSchema` helper) alongside the current `brokerReviewSchema`.

### 4. Insert the Exness row
Update the existing Exness row by slug (`UPDATE … WHERE slug='exness'`; insert if missing) with:
- Structured fields: name, type=forex, regulation=`{FCA, CySEC, FSCA, FSA Seychelles, CMA Kenya}`, score=8.1, stars=4.2, founded_year=2008, headquarters="Limassol, Cyprus", min_deposit="$10", leverage="1:2000", avg_spread="0.0 pips (Raw)", withdrawal_time="Under 5 minutes", withdrawal_fee="$0", badge="verified", status="published", last_verified_at=now, website_url, support_email, pros[], cons[], platforms=`{MT4, MT5, Exness Terminal, Exness Mobile}`, payment_methods=`{bKash, Nagad, Rocket, Skrill, Neteller, Perfect Money, WebMoney, Visa, Mastercard, Crypto (BTC, USDT)}`, account_types jsonb (Standard, Cent, Pro, Raw Spread, Zero), tags=`{forex, ecn, low-spread, bd-friendly, islamic, instant-withdrawal}`.
- `long_review` jsonb populated from your pasted article (all 11 sections + 6 FAQs + SEO meta + verdict card).
- Affiliate URL left as a placeholder string `"AFFILIATE_PLACEHOLDER"` since you didn't provide one — you can swap it from the admin panel later.

## Technical notes (skip if non-technical)

- One migration adds `brokers.long_review jsonb`. After it runs, I'll update `Broker` interface in `BrokerDetail.tsx` and the Supabase types regenerate automatically.
- A new file `src/components/broker/LongReview.tsx` (~150 LOC) handles rendering, TOC, and internal-link rewriting.
- Data insert goes through `supabase--insert` as an `INSERT … ON CONFLICT (slug) DO UPDATE`.
- Existing `BrokerDetail` overview tabs stay untouched; the long review is additive.

## Out of scope

- Building an admin UI to author long reviews (you'll keep pasting articles into chat for now — same template can be used for the next broker).
- Auto-generating an OG image (left to you; existing `og-image.jpg` fallback applies).
- The "Exness vs XM" comparison page is just linked, not built in this pass.
