## Goal

Bring the entire NAFT review pipeline up to **Master Prompt v4.7**:
1. Update the in-app broker prompt the Admin uses
2. Save the canonical v4.7 doc as project memory
3. Extend the broker `long_review` JSON shape + renderer to support every new v4.7 field
4. Give Admin a clean way to re-import the 17 already-reviewed brokers without losing manual edits ("smart merge")

No automatic regeneration — researcher runs v4.7 outside the app, pastes JSON into **Admin → Import JSON**, reviews, publishes.

---

## Scope — 17 brokers to refresh (manual workflow)

AvaTrade, Bullwaves, Capital.com, Exness, FP Markets, FXPRIMUS, Giraffe Markets, HFM, HYCM, Interactive Brokers, MultiBank Group, Octa, Pepperstone, PrimeXBT, Vantage Markets, VT Markets, XM

---

## Changes

### 1. Save v4.7 master prompt

- Copy uploaded file to `mem://content/broker-review-master-prompt.md` (full 1522 lines)
- Update `mem://index.md` to reference it under a new "Content / Master Prompts" group

### 2. Update in-app broker prompt — `src/lib/researchPrompts.ts`

- Replace the `broker` entity's `prompt(name)` body with a condensed v4.7 instruction set (research protocol, factuality rules, voice rules, schema spec) that still asks the model to return the **expanded JSON shape** below
- Update the `example` object + `schema.fields` to include new top-level / nested fields
- Keep `table: "brokers"` and `reserved` unchanged
- Other entities (prop, betting, signal, scam, promo, education, news, calendar, forecast) untouched

### 3. Expanded `long_review` JSON shape (additions vs current)

New keys added to existing structure (existing keys preserved):

```text
long_review.author         { name, role, bio, experience_years, avatar_url, sameAs[] }
long_review.toc[]          [ { id, label } ]   // auto from sections
long_review.social_snippet { x, whatsapp, telegram }
long_review.comparison_block { headline, brokers: [{slug,name,score,verdict}] }
long_review.regulatory_risk_warning  // string, e.g. "73% of retail CFD accounts lose money"
long_review.conflict_note            // affiliate / sponsorship disclosure
long_review.last_human_review_at     // ISO date
long_review.schema_jsonld  {
    review: { @type, datePublished, dateModified, ... },
    aggregateRating: { ratingValue, reviewCount },
    breadcrumbList: [...],
    organization: { sameAs[] }
}
long_review.image_assets[]  [ { url, alt, caption } ]
long_review.all_in_cost     { eurusd_spread_usd, commission_usd, total_per_lot_usd }
```

All new keys are **optional** so existing 17 broker records keep rendering until refreshed.

### 4. Renderer upgrade — `src/components/broker/LongReview.tsx` + `src/pages/BrokerDetail.tsx`

- **TOC**: render `long_review.toc[]` as sticky anchor links above sections (auto-build from sections[] if toc missing)
- **Author byline card**: above `quick-verdict` — avatar, name, role, bio, experience years, "sameAs" links
- **Last reviewed / human-reviewed badge**: small chip below author
- **Risk warning banner**: top of page, before hero — uses `regulatory_risk_warning`
- **Conflict disclosure**: subtle note under affiliate CTA
- **Social share block**: render `social_snippet` with WhatsApp / X / Telegram share buttons
- **Comparison block**: card rail above `final-verdict` with linked broker comparison
- **JSON-LD**: inject `schema_jsonld` blob via existing SEO component — adds BreadcrumbList + AggregateRating + Review + Organization
- **Image assets**: support optional inline images per section using alt text
- Fallbacks for every new field so brokers not yet refreshed don't break

### 5. Admin → Import JSON — smart merge

Update the broker importer (`src/pages/admin/...` or existing import handler) to support **"Smart merge"** mode for brokers that already exist:

- Always replace `long_review` jsonb entirely with the new payload
- For top-level columns (`score`, `stars`, `regulation`, `avg_spread`, `leverage`, `min_deposit`, `pros`, `cons`, `payment_methods`, `platforms`, `account_types`, `payment_method_details`, `withdrawal_time`, `withdrawal_fee`, `support_email`, `support_phone`, `description`, `headquarters`, `founded_year`, `tags`, `promo_label`, `promo_code`, `affiliate_url`, `warning_note`):
  - If the existing value is empty / null / 0 / `[]` → take new value
  - Otherwise keep existing (preserves manual admin edits)
- Show a diff preview before save: "X fields updated, Y fields preserved"
- Toggle to override smart merge → "Overwrite all"

### 6. Project memory

- Add `mem://content/broker-review-master-prompt` reference + a `mem://features/broker-long-review-schema` note listing the new long_review fields and renderer expectations

---

## Out of scope

- No automatic AI regeneration — researcher uses v4.7 externally
- No translation pipeline (v4.7 mentions `target_locale`; we keep English source only for now)
- No DB schema migration (long_review stays jsonb; no new columns)
- No changes to other entity prompts (prop firm, signals, etc.)

---

## Files touched

```text
mem://content/broker-review-master-prompt.md         (new)
mem://features/broker-long-review-schema.md          (new)
mem://index.md                                       (edited)
src/lib/researchPrompts.ts                           (edited — broker entity only)
src/components/broker/LongReview.tsx                 (edited — new sections)
src/components/broker/LongReviewAuthor.tsx           (new)
src/components/broker/LongReviewTOC.tsx              (new)
src/components/broker/LongReviewSocialShare.tsx      (new)
src/components/broker/LongReviewComparisonBlock.tsx  (new)
src/components/broker/RiskWarningBanner.tsx          (new)
src/pages/BrokerDetail.tsx                           (edited — wire new components + JSON-LD)
src/pages/admin/<ImportJson page>                    (edited — smart-merge logic + diff preview)
src/lib/brokerSmartMerge.ts                          (new helper)
```

---

## QA checklist after build

- Existing 17 brokers still render (no missing-field crashes)
- AvaTrade page shows TOC + risk banner with **fallback** values (no v4.7 data yet)
- Import a sample v4.7 JSON for AvaTrade → diff preview shows preserved vs updated fields → save → page renders new TOC, author card, social, comparison, JSON-LD
- View page source on a v4.7 broker → BreadcrumbList + AggregateRating + Review JSON-LD present
- Re-importing the same JSON twice produces no duplicates
- Mobile viewport: TOC collapses, social buttons stack, author card stays readable
