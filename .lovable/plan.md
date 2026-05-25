# Sync DB + Master Prompt + Editorial/Reviews CTA with today's UI changes

## Context — UI work shipped today

1. **Rules tab** → reads `long_review.at_a_glance.*` (already in schema ✓)
2. **Payouts tab** → reads `long_review.payout_verification.*` (already in schema ✓)
3. **Challenges tab** → reads optional `long_review.challenges[]` — **NEW field, not yet in prompt**
4. Replaced "Verified · NAFT Research" badge with "For accurate info always confirm with broker and public source or community" + affiliate CTA on Rules / Challenges / Payouts.
5. Short-formatting helpers on the at-a-glance row (profit_split → "80-90%", payout_frequency → "Bi-weekly", money → single-currency range, etc.).
6. Cleared FTMO's unverified `largest_single_payout_seen`.
7. `NaftVerificationBanner` now uses entity label ("prop firm" / "broker" / "betting site").
8. **Still missing:** the same "confirm with broker + affiliate CTA" pattern in the **Reviews tab (Community Reviews + Editorial Review block)** and on the **Full Review** tab. Today there's no CTA there.

---

## A. DB cleanup

Audit confirmed:
- No other prop firm has `largest_single_payout_seen` populated → nothing else to null.
- No prop firm has `long_review.challenges[]` yet → Challenges tab keeps showing demo plans until v4.10 re-imports back-fill them.

**Action:** none right now. Real data flows in on next re-import.

Optional follow-up: re-run v4.10 on the top ~10 priority prop firms (FTMO, FundedNext, MFF, The Funded Trader, etc.) so Challenges tab shows real plans.

---

## B. Prop-Firm Master Prompt v4.9 → v4.10

File: create `src/content/prompts/prop-firm-review-v4.10.md` (keep v4.9 file, mark deprecated in its header).

### B1. New required block `long_review.challenges[]`

```json
"challenges": [
  {
    "name": "FTMO Challenge 2-Step",
    "type": "Two Phase",          // "One Phase" | "Two Phase" | "Instant Funding"
    "badge": "Most Popular",      // optional chip
    "maxDD": "10%",
    "dailyDD": "5%",
    "target": "10% / 5%",         // Phase 1 / Phase 2 (or single)
    "sizes": [
      { "size": "10,000",  "fee": "€89"  },
      { "size": "25,000",  "fee": "€189" },
      { "size": "50,000",  "fee": "€289" },
      { "size": "100,000", "fee": "€489" },
      { "size": "200,000", "fee": "€989" }
    ]
  }
]
```

Rule: list every publicly listed plan. Unverifiable fees → `"—"` (UI hides gracefully). At least one source URL must be in `data_freshness.sources[]`.

### B2. Strict truthfulness on `payout_verification`

> Fill `largest_single_payout_seen`, `verified_payouts_seen`, and `payout_denial_reports_90d` **only** if a public certificate / screenshot / firm case-study URL is in `data_freshness.sources[]`. Otherwise set the field to `null`. Never invent or estimate.

### B3. Add short companion fields in `at_a_glance`

Keep the long-form fields, add render-ready siblings:

```json
"profit_split_short":        "80-90%",
"max_overall_drawdown_short":"10%",
"max_daily_drawdown_short":  "5%",
"payout_frequency_short":    "Bi-weekly",
"min_deposit_short":         "€79–€1,080"
```

Single currency, numbers + units, no prose.

### B4. Drop "NAFT-verified" prose

> Never assert NAFT verification in body copy. On-page trust signals are limited to (a) the boolean `naft_verified` (set by ops, never by the AI) and (b) the standard "confirm with broker and public source or community" disclaimer the UI renders automatically.

### B5. Make `affiliate_cta` hard-required

```json
"affiliate_cta": {
  "url": "https://...",       // affiliate or official, never blank
  "label": "Get Funded with FTMO",
  "disclosure": "Sponsored. We may earn a commission."
}
```

If no affiliate deal: use official signup URL and set `disclosure: "Official site link."`.

### B6. Bump `schema_version`

```json
"schema_version": "4.10"
```

Changelog at top of prompt:

> v4.10 — adds `long_review.challenges[]`, short `*_short` companions in `at_a_glance`, tightens payout_verification truthfulness, removes "NAFT-verified" prose claims, hardens `affiliate_cta`.

---

## C. Code changes (small, presentational only)

### C1. Reviews tab — add the "confirm + CTA" header

In `src/pages/BrokerDetail.tsx`, in `<TabsContent value="reviews">` (around line 1377), add the same header pattern used on Rules/Challenges/Payouts above the "Write a Review" button:

```
For accurate info always confirm with broker and public source or community     [ Visit {broker.name} → ]
```

Uses `broker.affiliate_url ?? broker.website_url`.

### C2. Editorial Review block (inside the Full Review tab `<LongReview>`)

`src/components/broker/LongReview.tsx` (or wherever the editorial / Trader Verdict block renders) gets the same single-line disclaimer + affiliate CTA pinned to its header.

### C3. Prefer `*_short` values on the at-a-glance row

In `BrokerDetail.tsx` short helpers, check `aag.profit_split_short` first, then fall back to extracting from the long form. No new regex needed.

### C4. (Optional cleanup) memory note

Add a one-liner to `mem://features/broker-long-review-schema` documenting the new `challenges[]` and `*_short` fields.

No DB migration. No importer change. No new packages.

---

## D. AI ordering instructions — what to add to your standing brief

When you ask the AI to generate or refresh a prop-firm review, add:

> Use Prop Firm Master Prompt **v4.10**. Every numeric field in `at_a_glance` must have a `*_short` companion. Populate `long_review.challenges[]` with every plan you can verify, including all account sizes and fees; mark unverified fees as `"—"`. Do **not** assert NAFT verification anywhere in prose. For `payout_verification`, leave any field `null` unless a source URL is in `data_freshness.sources[]`. `affiliate_cta` is required.

For **broker** reviews (not prop firms), apply only the affiliate_cta + no-"NAFT verified" prose rules — broker prompt v4.8 stays otherwise unchanged.

---

## What you do NOT need to change

- Filler / signup forms.
- Importer (`src/lib/jsonImporter.ts`, `src/pages/admin/ImportJsonAdmin.tsx`).
- DB schema (`long_review` is jsonb — new keys are free).
- Existing rows — they keep working with v4.9; new fields appear on next re-import.
