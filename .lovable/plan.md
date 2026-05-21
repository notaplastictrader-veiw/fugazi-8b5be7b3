## Keno editorial review add hoy nai — root cause

Ami DB check korlam:
- `brokers.long_review` JSONB → **✅ achhe** (30 KB, 10 sections, verdict/tldr/trust_breakdown sob). Ei ta `/brokers/pepperstone` page-er **"Full Review" tab**-e render hocche `<LongReview>` component diye.
- `reviews` table-e Pepperstone-er row count → **0**. Mane "Community Reviews" tab-e jeta NAFT Editorial author hisabe top-e show korar kotha (with "Read Full Review →" button), seita **nei**.

Ki keno hoyni: amar ager UPDATE shudhu `brokers` row patch koreche. Provided JSON payload-e `long_review` chhilo (broker row-er part) — but `reviews` table-e alada ekta "NAFT Editorial" row insert kora hoyni, karon prompt v4.0 sheta cover korena. Ei jonno code-side e `r.author === "NAFT Editorial"` check (BrokerDetail.tsx line 1398) match korar kichu pacche na.

**Fix (after plan approve):** `reviews` table-e ekta editorial row insert korbo — author "NAFT Editorial", role "editor", rating = star_rating (4.2), content = verdict.tldr, status "published", verified_account true. Eta automatically Community Reviews tab-e top-e dekhabe with "Read Full Review →" button jeta Full Review tab e jump korabe.

## Prompt issue analysis

v4.0 te kichu word "factuality" / "factuality dots" repeatedly use kora hoyeche — eta moderately technical and trader-facing language e harsh shonay. NAFT brand voice o under-represented (NAFT mention prai shudhu trust breakdown e). SEO section-e secondary keywords range chhoto, internal_links rule weak, schema_jsonld optional chhilo — eta 9 theke 9.5 e tula jay.

## Changes I'll bake into v4.1

1. Replace "factuality" → **"public"** / **"publicly verifiable"** throughout (rules, labels, checklist).
2. Promote **NAFT** as the editorial voice — explicit "NAFT verdict", "NAFT trust score", "NAFT last reviewed [date]" phrasing required in verdict + final-verdict + red-flags.
3. SEO upgrades for 9.5/10:
   - secondary_keywords 8–12 (was 5–8) with intent variants (review/scam/withdrawal/min deposit/vs competitor/regulation/login/demo).
   - Required **schema_jsonld**: Review + FAQPage + Organization (was optional).
   - Required **internal_links** minimum 6 (was 4) with anchor diversity.
   - SEO title rule strengthened: must contain `{Broker} Review {Year}` exact match for ranking.
   - description must contain primary keyword + year + one trust signal.
4. Keep all other v4.0 rules intact (geo, scoring, voice, structure).

## Deliverables in this plan

- Insert the missing NAFT Editorial review row for Pepperstone.
- Output **NAFT BROKER JSON FORM FILLER — MASTER PROMPT v4.1** (full text) for you to reuse. The full v4.1 prompt will be delivered as a copy-pasteable block in the implementation reply (not stored in the codebase — it's a content asset, not source code).

## Out of scope

- No code changes to `<LongReview>` rendering or `BrokerDetail` — they already work.
- No schema change.
- No edits to other brokers' rows.
