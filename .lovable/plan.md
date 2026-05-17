## My verdict on the review itself

**Overall: 8.5/10.** Ship it. Specifics:

| Area | Score | Note |
|---|---|---|
| Geo honesty | 10/10 | Malaysia removed, accepted/excluded lists explicit |
| SEO structure | 9.5/10 | Real Google queries as H2s, JSON-LD clean |
| Voice & trust | 9/10 | FCA caveat hit 4× without nagging, "test a withdrawal" repeated naturally |
| Factuality discipline | 9/10 | Only Trustpilot named, rest is "publicly reported" / "broker-stated" |
| Full Review tab UX | 9/10 | TOC, tables, bullets, mid-CTAs — strong |
| **Overview tab UX** | **6/10** | **Three paragraphs of prose. This is where the reader bounces.** |
| Conversion psychology | 8/10 | CTAs land at right points; friction reducers good |

The one real problem is the **Overview tab**. That's where Google traffic lands first. Right now it's TL;DR (5 lines) + verdict.summary (3 paragraphs) + bottom_line. A scanner sees a wall and leaves. The Full Review tab is solved — the Overview is not.

## What I'll build

### 1. Redesign the Overview tab as a 4-second scorecard

New structure, top to bottom, on `/brokers/exness` Overview tab:

```text
┌─────────────────────────────────────────────────┐
│  EXNESS    8.0/10  ★4.2  ·  Trustpilot 4.7      │  ← hero stat strip
│  Verified broker · Since 2008 · 8 min read      │
├─────────────────────────────────────────────────┤
│  ✓ Best for: scalpers, EA traders in IN/ID/AE  │  ← decision chips
│  ✗ Not for:  Malaysia, EU/UK retail, beginners │
├─────────────────────────────────────────────────┤
│  $10 min  ·  ~0.7 pip  ·  Instant w/d  ·  1:2000│  ← 4-stat row
├─────────────────────────────────────────────────┤
│  TL;DR  (plain-English, 4 lines from JSON)      │
├─────────────────────────────────────────────────┤
│  Editor's Verdict  (verdict.summary, collapsed   │
│  to first paragraph + "Read full verdict" link) │
├─────────────────────────────────────────────────┤
│  [ Open Exness Account — $10 min ]              │  ← primary CTA
│  [ Read the full review → ]                     │  ← secondary
└─────────────────────────────────────────────────┘
```

Every block is pulled straight from your JSON — no new copy, no rewrites. The change is **visual hierarchy**, not content.

### 2. Apply your new JSON to the database

Single `UPDATE brokers` on slug `exness`:
- `long_review` ← your full JSON (verbatim)
- `score` ← 8.0
- `stars` ← 4.2
- `updated_at` ← now()

### 3. Extend `LongReview.tsx` to render the rich shape

For the Full Review tab. Additive only — old broker rows keep working.

- Remove factuality legend block + `FACTUALITY_ITEMS` constant
- Strip stray `🟢🔵🟡🔴⚪` emojis at render
- Render `at_a_glance` as a compact card above verdict
- Render `geo.accepted[]` / `geo.excluded[]` as a two-column card (new `GeoAvailability.tsx`)
- Render `section.table` (headers/rows/footnote) as responsive `<table>`
- Render `section.bullets[]` as styled list
- Render `for[]` / `not_for[]` as side-by-side green/red cards
- Render `section.steps[]` as numbered timeline; `cta_inline` becomes inline button
- Inject mid-article CTA card after any section with `cta_after: true`
- Trustpilot pill + reading-time chip in header strip
- `practical_note` rendered as muted callout
- `internal_links[]` rendered as "Related" footer block
- Support new `[INTERNAL: /path]` bracket style alongside existing `[INTERNAL LINK:]`

### 4. Add JSON-LD to `BrokerDetail.tsx`

Pass `long_review.schema_jsonld.review` and `.faqPage` into `<SEO jsonLd={…}>`. Google gets Review + FAQPage rich results — directly drives CTR.

## Two small inconsistencies I caught in your JSON (flagging, not editing without your call)

1. **Raw Spread commission**: at-a-glance says `$7 round-turn`, section table says `$3.50/lot/side`. Both correct (×2), but a careful reader pauses. Add one clarifying line, or leave?
2. **Australia** is in `geo.excluded` but missing from the `verdict.not_ideal_for` sentence. Add it, or leave?

Default if you don't reply: leave both exactly as written.

## What stays untouched

- Tab structure, routing, sticky CTA, peer brokers rail, withdrawal proofs gallery
- Every word of your JSON copy
- Score logic, all other broker pages

## After publish

Live at `/brokers/exness` with a scannable Overview that converts in 4 seconds, and a Full Review tab that renders every new field cleanly. Review + FAQ schema in `<head>` for Google.

Approve and I ship in one pass.