## Goal

Replace the Exness `long_review` JSON in the database with the new 2026 review, sanitised per your rules, and lightly extend the `LongReview` component to render the factuality system cleanly.

## Content rules applied to the new review

1. **Strip third-party review sites.** Remove every mention of FX Empire, BrokerChooser, FxScouts, CompareForexBrokers, ForexBrokers.com, FX Recap, FX Review Center, TradersUnion, WikiFX. Rewrite each sentence to keep the underlying fact, attributed generically (e.g. "Independent testing measured EUR/USD at ~0.70 pips on Standard" instead of "FxScouts reports…"). Keep **Trustpilot** references and the 27,032-review / 4.7-star data intact.
2. **Keep factuality dots inline** (🟢🔵🟡🔴⚪) and render a small legend block at the top of the rendered article.
3. **Use new score**: 8.0 / 4.2 (matches the verdict card in the new review; overwrites existing 8.1).
4. **Sources list** at the bottom of the review will be reduced to: Trustpilot + "Independent third-party broker review platforms (aggregated, 2026)".

## Overview tab strategy

Render two blocks on the Overview tab, above the existing tabs/content:
- **TL;DR** — auto-written 4–6 sentence plain-English summary: what Exness is, who it suits, the regulation caveat, withdrawal reputation, score, and one-line bottom line. No jargon, no emojis.
- **Editor's verdict** — your existing Quick Verdict paragraph below it (with sources sanitised).

## Data shape

The `brokers.long_review` JSONB already supports `seo`, `verdict`, `sections[]`, `faq[]`, `affiliate_cta`. I'll add two optional fields the renderer will pick up if present:
- `verdict.tldr` (string) — the plain-English TL;DR for the Overview tab
- `factuality_legend` (boolean, default true) — toggles the legend block at top of the Full Review

No schema migration needed — `long_review` is JSONB, additive.

## Files changed

1. **`supabase` migration** — single `UPDATE brokers SET long_review = …, score = 8.0, stars = 4.2, updated_at = now() WHERE slug = 'exness'` with the fully sanitised JSON.
2. **`src/components/broker/LongReview.tsx`** — render a small factuality legend card at the top when `factuality_legend !== false`. No other behaviour changes.
3. **`src/pages/BrokerDetail.tsx`** — on the Overview tab, if `long_review.verdict.tldr` exists, show a "TL;DR" callout above the existing overview content, followed by the editor's verdict paragraph.

## What stays the same

- Tab structure, routing, SEO component, sticky CTA, withdrawal proofs, peer brokers rail — untouched.
- The `long_review` rendering pipeline (TOC, verdict card, sections, FAQ accordion, internal-link mapping) — untouched except for the new legend block.
- Same JSON shape works for the next broker you send.

## Open question I'll default on unless you object

The review references the **Philippine SEC advisory (Jan 2026)** and **October 2025 server outage**. You said remove competitor review sites only — I'll **keep both of these events** because they're regulatory/operational facts, not competitor citations, and rephrase them as "public regulatory advisory" and "publicly reported outage" without naming WikiFX as the source.
