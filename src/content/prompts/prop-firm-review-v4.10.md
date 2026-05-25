# NAFT Prop Firm Review System — v4.10 (Master Prompt)

> **v4.10 supersedes v4.9.** All new prop-firm reviews MUST be generated against this spec.
> v4.9 file is kept only as a deprecated reference; do NOT import from it.

---

## What changed in v4.10 (vs v4.9)

1. **`long_review.challenges[]` is now MANDATORY** for every prop-firm payload.
   The UI Challenges tab is driven by this array. If it's missing or empty, the tab shows an empty-state ("Plan details being verified") instead of fake demo plans. There is NO fallback to `at_a_glance` for plan rendering anymore.

2. **`*_short` fields are now FIRST-CLASS** (not optional). Required short variants:
   - `at_a_glance.max_daily_drawdown_short` (e.g. `"5%"`)
   - `at_a_glance.max_overall_drawdown_short` (e.g. `"10%"`)
   - `at_a_glance.profit_target_short` (e.g. `"10% / 5%"`)
   - `at_a_glance.profit_split_short` (e.g. `"80–90%"`)
   These render in tight UI chips. The long-form fields stay for body text.

3. **Strict `payout_verification` truthfulness.**
   - `verified_payouts_seen`, `largest_single_payout_seen`, `payout_denial_reports_90d`, `average_processing_days` MUST be either a real number/string sourced from Tier-1 evidence, or the literal string `"unverified"`. Never invent counts or dollar amounts. If you cannot cite a source URL in `sources[]`, the field is `"unverified"`.

4. **Decimal rating calibration (1.0–5.0, ONE decimal place).**
   `editorial_review_row.rating` must be a decimal aligned to these tiers, and the chosen decimal must be justified inside `hot_take` OR `editorial_review_row.content`:

   | Tier | Range | Meaning |
   |------|-------|---------|
   | Tier-1 | 4.7–5.0 | Proven, multi-year payout history, regulated backing |
   | Strong | 4.3–4.6 | Solid track record, minor friction points |
   | Decent | 3.8–4.2 | Workable but real trade-offs |
   | Mixed  | 3.0–3.7 | Notable concerns; only for specific archetypes |
   | Avoid  | < 3.0   | Material red flags / kill-switch active |

5. **`affiliate_cta` rules tightened.**
   - `affiliate_cta` is REQUIRED on every payload.
   - `affiliate_cta.url` MAY be `null` ONLY when `naft_verified=false` AND `warning_note` starts with `AVOID` / `WARNING` (kill-switch active). In that case the UI hides the CTA button.
   - Otherwise `url` MUST be a real affiliate or official URL.

6. **Never claim "NAFT verified" in prose.**
   Do NOT write phrases like "NAFT has verified this firm", "NAFT-verified review", "verified by NAFT", or any equivalent in any user-visible string (`hot_take`, `sections[].body`, `editorial_review_row.content`, `verdict.*`, `faq[].a`, `social_snippet.*`). The verified badge is a UI element rendered from a separate flag — the AI must never assert verification authority in its own words.

7. **Demo-data kill-switch is now enforced by the UI.**
   The Challenges tab no longer fabricates "1-Step / 2-Step" plans from `at_a_glance`. Whatever you put in `long_review.challenges[]` is exactly what renders. Don't ship reviews without it.

---

## REQUIRED `long_review.challenges[]` SHAPE (new in v4.10)

```json
"challenges": [
  {
    "name": "FTMO Challenge (2-Step)",
    "type": "Two Phase",
    "badge": "Most Popular",
    "maxDD": "10%",
    "dailyDD": "5%",
    "target": "10% / 5%",
    "sizes": [
      { "size": "10,000",  "fee": "€155" },
      { "size": "25,000",  "fee": "€250" },
      { "size": "50,000",  "fee": "€345" },
      { "size": "100,000", "fee": "€540" },
      { "size": "200,000", "fee": "€1,080" }
    ]
  },
  {
    "name": "FTMO Swing (No News Restriction)",
    "type": "Two Phase",
    "badge": "Swing Friendly",
    "maxDD": "10%",
    "dailyDD": "5%",
    "target": "10% / 5%",
    "sizes": [
      { "size": "10,000",  "fee": "€185" },
      { "size": "100,000", "fee": "€600" },
      { "size": "200,000", "fee": "€1,180" }
    ]
  }
]
```

**Field rules:**
- `name` — full plan name as the firm markets it.
- `type` — one of: `"One Phase"`, `"Two Phase"`, `"Three Phase"`, `"Instant Funding"`, `"Direct Funded"`.
- `badge` — optional. Examples: `"Most Popular"`, `"Beginner Friendly"`, `"Swing Friendly"`, `"Cheapest"`. Leave `""` if none.
- `maxDD`, `dailyDD`, `target` — short display strings. Use `%` units; for split targets use `"10% / 5%"`.
- `sizes[]` — at least 3 entries. `size` in plain digits with commas (no `$`); UI prepends `$`. `fee` includes currency symbol. Use `"—"` only if the firm genuinely doesn't publish a fee (rare).

If the firm offers a single plan, ship a 1-element array. NEVER ship `"challenges": []` just to satisfy the schema — leave the field absent if you truly have no Tier-1 data, and the UI will render the empty state.

---

## v4.10 ADDITIONS TO `long_review.at_a_glance` (short variants)

```json
"at_a_glance": {
  "...": "all v4.9 fields stay as-is",
  "max_daily_drawdown_short": "5%",
  "max_overall_drawdown_short": "10%",
  "profit_target_short": "10% / 5%",
  "profit_split_short": "80–90%"
}
```

These power tight UI chips. If you only have a long-form value, derive the short version yourself — do not leave them empty.

---

## v4.10 ADDITIONS TO `long_review.payout_verification`

Every field below must be Tier-1 sourced OR the literal string `"unverified"`:

```json
"payout_verification": {
  "verified_payouts_seen": 0,
  "largest_single_payout_seen": "unverified",
  "verification_method": "Trustpilot reviews + Discord #payouts channel",
  "payout_denial_reports_90d": "unverified",
  "denial_context": "",
  "average_processing_days": "1-3",
  "payout_consistency_note": ""
}
```

The UI handles `"unverified"` and renders it as `—` with a "Pending verification" sub-label.

---

## v4.10 `affiliate_cta` SHAPE

```json
"affiliate_cta": {
  "label": "Start FTMO Challenge",
  "url": "https://ftmo.com/?affiliates=naft",
  "promo_code": "",
  "discount_value": "",
  "friction_reducers": ["From €155 challenge fee", "Bi-weekly payouts", "Fee refunded when Funded"]
}
```

Kill-switch case (allowed `url: null`):

```json
"affiliate_cta": {
  "label": "Visit Official Site",
  "url": null,
  "promo_code": "",
  "discount_value": "",
  "friction_reducers": []
}
```

---

## EVERYTHING ELSE FROM v4.9 STAYS

All other sections from `prop-firm-review-v4.9.md` remain unchanged:

- ROLE
- RESEARCH PROTOCOL (Tier 1 sources, mandatory verification checklist, data freshness)
- THIRD-PARTY ATTRIBUTION RULE (Trustpilot only in visible prose)
- KILL-SWITCH (bankruptcy / halted payouts / regulator action → `warning_note` = AVOID/WARNING, `score` capped at 2.0)
- RED FLAG PATTERN DETECTION (`red_flag_scan` object)
- VOICE & ANTI-AI RULES
- FACTUALITY RULES (2,200–3,500 words)
- CONTENT STRUCTURE — 8 mandatory sections in fixed order
- OUTPUT FORMAT — two concatenated JSON objects (`prop_firm_payload` + `editorial_review_row`)
- All other `long_review.*` keys (`data_freshness`, `pass_rate_data`, `red_flag_scan`, `seo_audit`, `verdict`, `drawdown_explainer`, `geo`, `sections`, `comparison_table`, `trustpilot`, `faq`, `author`, `toc`, `social_snippet`, `comparison_block`, `regulatory_risk_warning`, `conflict_note`, `image_assets`, `schema_jsonld`, `reading_time_minutes`, `word_count`)
- `editorial_review_row` shape (with `rating` now constrained per §4 above)

Use v4.9 as the reference body for those sections, but bump `"schema_version": "4.10"` in every payload.

---

## QUICK CHECKLIST BEFORE SUBMITTING

- [ ] `long_review.schema_version` = `"4.10"`
- [ ] `long_review.challenges[]` present with ≥1 plan (or intentionally omitted for unverified firms)
- [ ] `at_a_glance.*_short` fields populated
- [ ] `payout_verification` numbers Tier-1 sourced OR `"unverified"`
- [ ] `editorial_review_row.rating` is decimal 1.0–5.0 matching the calibration tier, and that decimal is justified in prose
- [ ] `affiliate_cta` present; `url` is non-null UNLESS kill-switch is active
- [ ] Zero "NAFT verified" / "verified by NAFT" claims anywhere in prose
- [ ] Only Trustpilot named as a third-party review brand in visible text
