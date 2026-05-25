// Research prompts + JSON schemas for the agent-assisted content pipeline.
// Each entity has: a strict JSON-only research prompt, the target Supabase table,
// and a schema describing required + optional fields used by the validator.

export type FieldType = "string" | "number" | "boolean" | "array" | "object" | "url" | "date";

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  enum?: string[];
  min?: number;
  max?: number;
  itemType?: FieldType;
  description?: string;
}

export interface EntitySchema {
  table: string;
  fields: Record<string, FieldSchema>;
  /** Fields the agent must NOT include (set server-side). */
  reserved?: string[];
}

export interface EntityDefinition {
  key: string;
  label: string;
  description: string;
  table: string;
  prompt: (name: string) => string;
  example: object;
  schema: EntitySchema;
}

const baseRules = `
STRICT OUTPUT RULES:
- Return ONLY a single valid JSON object. No markdown, no commentary, no code fences.
- For every regulator license, claim, or numeric stat you MUST cite a verifiable source URL inside a "sources" array of strings.
- If a field cannot be verified from a primary source (official site, regulator register, or two independent reputable reviews), set it to null. Do NOT guess.
- Use ISO 8601 for any date.
- Slugs must be lowercase-hyphenated, ASCII only.
- Enum values MUST match exactly (case-sensitive).
`.trim();

export const ENTITIES: EntityDefinition[] = [
  // -------------------------------- BROKER --------------------------------
  {
    key: "broker",
    label: "Broker",
    description: "Forex / CFD / Crypto broker review entry (full canonical schema)",
    table: "brokers",
    prompt: (name) => `You are NAFT's senior broker analyst writing for the trader who typed "${name} review" at midnight before depositing their savings. You have 10+ years inside this industry. Follow NAFT Master Prompt v4.8.

RESEARCH PROTOCOL (complete before writing):
- Tier 1 primary sources only for verifiable facts: broker's official site (regulation, accounts/spreads, payments, T&Cs), regulator registers (FCA register.fca.org.uk, ASIC asic.gov.au, CySEC cysec.gov.cy, DFSA dfsa.ae, FSCA fsca.co.za, SCB scb.gov.bs, CMA cma.or.ke, BaFin bafin.de), and Trustpilot (the ONLY named third party allowed). If Trustpilot has zero reviews, omit the trustpilot block entirely — never invent.
- Tier 2 public data may inform tone (forum sentiment, public complaints) but never name the source.
- If a field cannot be confirmed from a primary source, use "" / [] / null. Never guess. Never pad. Never invent.

FACTUALITY RULES (non-negotiable):
- Word count: 2,400–3,800 in body sections combined.
- Never use absolute safety claims ("100% safe", "guaranteed", "scam-proof"). Always include risk language.
- For CFD/Forex providers, populate "regulatory_risk_warning" with a real retail-loss percentage (e.g. "73% of retail CFD accounts lose money").
- All license numbers must be verifiable on the named register.

⚡ v4.8 REGULATOR WARNING KILL-SWITCH (decision-grade):
- If a named regulator (FCA, ASIC, BaFin, CySEC, CONSOB, AMF, FMA, CFTC, etc.) has publicly warned against this broker, set the top-level "warning_note" to a strong red-banner statement that STARTS with "AVOID" or "WARNING" — name the regulator, the date, and the consequence. Example: "AVOID — FCA flagged this broker on 2024-08-12 as unauthorised. UK clients have NO FSCS protection. Withdrawals are not legally enforceable."
- If no regulator warning exists, leave "warning_note" empty ("").

VOICE: Direct, skeptical, helpful. One trader talking to another. No corporate fluff. No "legit", "best", "trusted" filler.

OUTPUT — TWO JSON OBJECTS, in this exact order, concatenated (no array wrapper, no markdown fences):

  1. **broker_payload** — the full row for public.brokers (shape below). All v4.8 additions (hot_take, telegram_summary, seo_audit, author, toc, social_snippet, comparison_block, regulatory_risk_warning, conflict_note, last_human_review_at, schema_jsonld, image_assets, all_in_cost) live INSIDE "long_review". Sections array MUST contain these 8 ids in order: quick-verdict, regulation-safety, geo-availability, spreads-accounts-fees, deposits-withdrawals, platforms-tools, pros-cons, final-verdict.

  2. **editorial_review_row** — sidecar wrapper for public.reviews:
     { "editorial_review_row": { "broker_slug": "<slug>", "author": "NAFT Editorial", "role": "editor", "rating": <0-5>, "content": "150–250 word signed editorial opinion — decision helper, not marketing", "verified_account": true, "status": "published" } }

${baseRules}

Return a single JSON object with this exact shape:

{
  "name": "string",
  "slug": "lowercase-hyphenated",
  "type": "forex" | "crypto" | "prop" | "binary",
  "founded_year": number | null,
  "headquarters": "City, Country" | null,
  "website_url": "https://..." | null,
  "description": "2-4 sentence neutral overview",
  "regulation": ["FCA (UK) — 730729", "CySEC (Cyprus) — 178/12"],
  "license_number": "string" | null,
  "min_deposit": "$5",
  "leverage": "1:1000",
  "avg_spread": "1.6 pips",
  "score": number 0-10,
  "stars": number 0-5,
  "account_types": [
    { "name": "Standard", "min_deposit": "$5", "spread": "1.6 pips", "leverage": "1:1000", "commission": "None" }
  ],
  "platforms": ["MT4", "MT5", "WebTrader", "Mobile App"],
  "payment_methods": ["Visa", "Mastercard", "Skrill", "Neteller", "Bank Wire", "Crypto"],
  "payment_method_details": [
    { "method": "Visa/Mastercard", "min": "$5", "processing": "Instant", "fee": "Free" }
  ],
  "pros": ["..."],
  "cons": ["..."],
  "support_email": "support@broker.com" | null,
  "support_phone": "+...." | null,
  "withdrawal_time": "Instant – 24h" | null,
  "withdrawal_fee": "Free" | null,
  "warning_note": "" | "regulatory note if any",
  "tags": ["forex", "low-spread", "bd-friendly"],
  "badge": "verified" | "featured" | "warning" | "none",
  "promo_label": "$30 No-Deposit Bonus" | null,
  "promo_code": "NAFT30" | null,
  "affiliate_url": "https://..." | null,

  "long_review": {
    "schema_version": "4.8",
    "hot_take": "2–4 sentence editorial punch rendered at the TOP of the review. Decision-helper, not marketing. Tell the reader in 5 seconds whether this broker is right for them and why.",
    "telegram_summary": "Short shareable 2-line summary for Telegram / WhatsApp forwarding.",
    "seo_audit": {
      "primary_keyword_count": 0,
      "broker_name_count": 0,
      "year_mentioned_count": 0,
      "question_headings_count": 0,
      "faq_items_count": 0,
      "internal_links_count": 0,
      "affiliate_cta_included": true,
      "legit_keyword_present": false,
      "all_tone_rules_applied": true
    },
    "verdict": {
      "tldr": "One-breath summary: who this is for + the headline trade-off.",
      "summary": "Longer paragraph (optional).",
      "best_for": "Beginners with small accounts",
      "not_ideal_for": "Scalpers needing raw ECN spreads",
      "bottom_line": "Closing one-line take.",
      "star_rating": 4.2,
      "trust_score": 8.2,
      "trust_breakdown": [
        { "label": "Regulation", "score": 9, "max": 10, "weight": 0.3 },
        { "label": "Withdrawal speed", "score": 8, "max": 10, "weight": 0.2 },
        { "label": "Cost transparency", "score": 7, "max": 10, "weight": 0.2 },
        { "label": "Platform quality", "score": 8, "max": 10, "weight": 0.15 },
        { "label": "Community sentiment", "score": 7, "max": 10, "weight": 0.15 }
      ]
    },
    "at_a_glance": {
      "regulation": "ASIC, CySEC, IFSC, DFSA",
      "min_deposit": "$5",
      "max_leverage": "1:1000",
      "avg_spread_eurusd": "1.6 / 0.6 Ultra Low",
      "withdrawal_speed": "Instant – 24h",
      "platforms": "MT4, MT5, WebTrader, App",
      "islamic_account": "Yes",
      "deposit_methods": "Card, Skrill, Neteller, Wire, Crypto"
    },
    "geo": {
      "accepted": ["Bangladesh", "India", "Pakistan", "UAE", "Saudi Arabia"],
      "excluded": ["United States", "Canada", "Israel", "Iran"]
    },
    "sections": [
      {
        "id": "quick-verdict",
        "heading": "Is <Broker> Worth It in 2026?",
        "body": "2–4 paragraphs. Use blank line between paragraphs. Use [INTERNAL: /brokers] tokens to link to other pages."
      },
      {
        "id": "regulation-safety",
        "heading": "Regulation & Safety",
        "body": "How the multi-entity license model routes clients.",
        "table": {
          "headers": ["Entity", "Regulator", "License #", "Client Routing"],
          "rows": [
            ["Broker Ltd", "ASIC (Australia)", "443670", "AU residents"],
            ["Broker (CY) Ltd", "CySEC (EU)", "178/12", "EU residents"]
          ],
          "footnote": "Always check which entity holds your account before depositing."
        }
      },
      {
        "id": "geo-availability",
        "heading": "Who Can Open an Account",
        "body": "Short note on accepted vs excluded regions.",
        "practical_note": "Practical advice for the target region."
      },
      {
        "id": "spreads-accounts-fees",
        "heading": "Spreads, Accounts & Fees",
        "body": "Compare account tiers, commissions, swap, inactivity.",
        "table": {
          "headers": ["Account", "Min Deposit", "Spread (EUR/USD)", "Commission"],
          "rows": [
            ["Standard", "$5", "1.6 pips", "None"],
            ["Ultra Low", "$50", "0.6 pips", "None"]
          ]
        }
      },
      {
        "id": "deposits-withdrawals",
        "heading": "Deposits & Withdrawals",
        "body": "Payment method coverage + withdrawal experience.",
        "table": {
          "headers": ["Method", "Min", "Processing", "Fee"],
          "rows": [
            ["Visa/Mastercard", "$5", "Instant", "Free"],
            ["Skrill / Neteller", "$5", "Instant", "Free"],
            ["Bank Wire", "$200", "1–3 days", "Free"],
            ["Crypto (USDT)", "$10", "Instant", "Free"]
          ]
        }
      },
      {
        "id": "platforms-tools",
        "heading": "Platforms & Tools",
        "body": "What platforms are supported and any in-house tooling.",
        "bullets": ["MT4 — classic EA support", "MT5 — broader assets", "WebTrader — no install", "Mobile App — biometric login"]
      },
      {
        "id": "pros-cons",
        "heading": "Pros & Cons",
        "for": ["Low minimum deposit", "Strong regulation in 4 jurisdictions", "Swap-free available"],
        "not_for": ["Tight ECN-style scalping", "US residents"]
      },
      {
        "id": "final-verdict",
        "heading": "Final Verdict",
        "body": "Closing editorial paragraph + recommended next step."
      }
    ],
    "affiliate_cta": {
      "label": "Open <Broker> Account",
      "url": "https://...",
      "promo_code": "NAFT30",
      "friction_reducers": ["$5 minimum", "MT4/MT5", "Swap-free available", "$30 no-deposit bonus (select regions)"]
    },
    "trustpilot": { "rating": 4.1, "reviews": 1240, "source_note": "Trustpilot, fetched manually." },
    "faq": [
      { "q": "Is <Broker> regulated?", "a": "Yes — under ASIC, CySEC, IFSC, and DFSA across different entities." },
      { "q": "What is the minimum deposit?", "a": "$5 on the Standard account." }
    ],

    "author": {
      "name": "Editorial reviewer name",
      "role": "Senior Broker Analyst",
      "bio": "Short 1-2 sentence bio establishing expertise.",
      "experience_years": 10,
      "avatar_url": "https://...",
      "sameAs": ["https://linkedin.com/in/...", "https://x.com/..."]
    },
    "toc": [
      { "id": "quick-verdict", "label": "Quick Verdict" },
      { "id": "regulation-safety", "label": "Regulation & Safety" }
    ],
    "social_snippet": {
      "x": "Short tweet under 240 chars with the headline trade-off.",
      "whatsapp": "Forwardable one-liner with the trust score + key fact.",
      "telegram": "Punchy 2-line summary for Telegram channels."
    },
    "comparison_block": {
      "headline": "How <Broker> stacks up",
      "brokers": [
        { "slug": "exness", "name": "Exness", "score": 8.4, "verdict": "Tighter spreads, weaker EU coverage." }
      ]
    },
    "regulatory_risk_warning": "73% of retail CFD accounts lose money with this provider.",
    "conflict_note": "NAFT may earn a commission if you open an account via our link. This never affects the review.",
    "last_human_review_at": "2026-05-23",
    "image_assets": [
      { "url": "https://...", "alt": "Specific descriptive alt text", "caption": "Optional caption", "section_id": "regulation-safety" }
    ],
    "all_in_cost": {
      "eurusd_spread_usd": 1.6,
      "commission_usd": 0,
      "total_per_lot_usd": 1.6
    },
    "schema_jsonld": {
      "review": { "@context": "https://schema.org", "@type": "Review", "datePublished": "2026-05-23", "dateModified": "2026-05-23" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.2, "reviewCount": 1240 },
      "breadcrumbList": { "@type": "BreadcrumbList", "itemListElement": [] },
      "organization": { "@type": "Organization", "name": "<Broker>", "sameAs": ["https://..."] }
    },
    "reading_time_minutes": 7,
    "word_count": 1450
  },

  "sources": ["https://...", "https://..."]
}

{
  "editorial_review_row": {
    "broker_slug": "<same-slug-as-above>",
    "author": "NAFT Editorial",
    "role": "editor",
    "rating": 4.2,
    "content": "150–250 word signed editorial opinion. Open with what this broker is (regulator + years), name the trade-off clearly, and end with who should/should not use it. No marketing fluff.",
    "verified_account": true,
    "status": "published"
  }
}

Broker name to research: ${name}`,
    example: {
      name: "",
      slug: "",
      type: "forex",
      founded_year: null,
      headquarters: "",
      website_url: "",
      description: "",
      regulation: [],
      license_number: "",
      min_deposit: "",
      leverage: "",
      avg_spread: "",
      score: 0,
      stars: 0,
      account_types: [
        { name: "", min_deposit: "", spread: "", leverage: "", commission: "" }
      ],
      platforms: [],
      payment_methods: [],
      payment_method_details: [
        { method: "", min: "", processing: "", fee: "" }
      ],
      pros: [],
      cons: [],
      support_email: "",
      support_phone: "",
      withdrawal_time: "",
      withdrawal_fee: "",
      warning_note: "",
      tags: [],
      badge: "none",
      promo_label: "",
      promo_code: "",
      affiliate_url: "",
      long_review: {
        verdict: {
          tldr: "",
          summary: "",
          best_for: "",
          not_ideal_for: "",
          bottom_line: "",
          star_rating: 0,
          trust_score: 0,
          trust_breakdown: [
            { label: "Regulation", score: 0, max: 10, weight: 0.3 },
            { label: "Withdrawal speed", score: 0, max: 10, weight: 0.2 },
            { label: "Cost transparency", score: 0, max: 10, weight: 0.2 },
            { label: "Platform quality", score: 0, max: 10, weight: 0.15 },
            { label: "Community sentiment", score: 0, max: 10, weight: 0.15 }
          ]
        },
        at_a_glance: {
          regulation: "",
          min_deposit: "",
          max_leverage: "",
          avg_spread_eurusd: "",
          withdrawal_speed: "",
          platforms: "",
          islamic_account: "",
          deposit_methods: ""
        },
        geo: { accepted: [], excluded: [] },
        sections: [
          { id: "quick-verdict", heading: "", body: "" },
          { id: "regulation-safety", heading: "", body: "", table: { headers: ["Entity", "Regulator", "License #", "Client Routing"], rows: [["", "", "", ""]], footnote: "" } },
          { id: "geo-availability", heading: "", body: "", practical_note: "" },
          { id: "spreads-accounts-fees", heading: "", body: "", table: { headers: ["Account", "Min Deposit", "Spread (EUR/USD)", "Commission"], rows: [["", "", "", ""]] } },
          { id: "deposits-withdrawals", heading: "", body: "", table: { headers: ["Method", "Min", "Processing", "Fee"], rows: [["", "", "", ""]] } },
          { id: "platforms-tools", heading: "", body: "", bullets: [] },
          { id: "pros-cons", heading: "Pros & Cons", for: [], not_for: [] },
          { id: "final-verdict", heading: "", body: "" }
        ],
        affiliate_cta: { label: "", url: "", promo_code: "", friction_reducers: [] },
        trustpilot: { rating: 0, reviews: 0, source_note: "" },
        faq: [{ q: "", a: "" }],
        reading_time_minutes: 0,
        word_count: 0
      },
      sources: []
    },
    schema: {
      table: "brokers",
      reserved: ["id", "created_at", "updated_at", "created_by", "review_count", "complaints"],
      fields: {
        name: { type: "string", required: true },
        slug: { type: "string", required: true },
        type: { type: "string", required: true, enum: ["forex", "crypto", "prop", "binary"] },
        founded_year: { type: "number" },
        headquarters: { type: "string" },
        website_url: { type: "url" },
        description: { type: "string" },
        regulation: { type: "array", itemType: "string" },
        license_number: { type: "string" },
        min_deposit: { type: "string" },
        leverage: { type: "string" },
        avg_spread: { type: "string" },
        score: { type: "number", min: 0, max: 10 },
        stars: { type: "number", min: 0, max: 5 },
        account_types: { type: "array" },
        platforms: { type: "array", itemType: "string" },
        payment_methods: { type: "array", itemType: "string" },
        payment_method_details: { type: "array" },
        pros: { type: "array", itemType: "string" },
        cons: { type: "array", itemType: "string" },
        support_email: { type: "string" },
        support_phone: { type: "string" },
        withdrawal_time: { type: "string" },
        withdrawal_fee: { type: "string" },
        warning_note: { type: "string" },
        tags: { type: "array", itemType: "string" },
        badge: { type: "string", enum: ["verified", "featured", "warning", "none"] },
        promo_label: { type: "string" },
        promo_code: { type: "string" },
        affiliate_url: { type: "url" },
        logo_url: { type: "string" },
        long_review: { type: "object", description: "Canonical long-review JSON (v4.8): hot_take, telegram_summary, seo_audit, schema_version, verdict, at_a_glance, geo, sections, affiliate_cta, trustpilot, faq, author, toc, social_snippet, comparison_block, regulatory_risk_warning, conflict_note, last_human_review_at, schema_jsonld, image_assets, all_in_cost" },
      },
    },
  },

  // -------------------------------- EDITORIAL REVIEW (v4.8 sidecar) --------------------------------
  {
    key: "editorial_review",
    label: "Editorial Review",
    description: "Standalone NAFT Editorial opinion row (v4.8 sidecar) → public.reviews",
    table: "reviews",
    prompt: (name) => `You are NAFT's senior editor writing a signed editorial opinion about the broker "${name}". This is the v4.8 editorial sidecar that appears next to the long review with a "verified editor" badge.

VOICE: Direct, skeptical, helpful. One trader talking to another. Decision-helper, not marketing. No "legit", "best", "trusted" filler.

LENGTH: 150–250 words. One tight paragraph or two.

STRUCTURE (in order):
1. Open with what the broker IS — regulator(s) + years in business + headline fact.
2. Name the trade-off clearly (the thing the marketing copy hides).
3. End with WHO should use it and who should NOT.

RATING SCALE (0–5):
- 4.0–4.5: Tier-1 regulated, strong execution, clean withdrawal record. (Pepperstone, IC Markets tier.)
- 3.0–3.9: Real broker, mixed regulatory or jurisdiction trade-offs. (Exness, XM tier.)
- 2.0–2.9: Offshore-heavy, weak protection, but operational. (FBS tier.)
- 1.0–1.9: Misleading licence claims, no real retail oversight. (CXM, D Prime tier.)
- 0–0.9: Active regulator warnings, scam pattern.

${baseRules}

OUTPUT — a single JSON object with this exact wrapper shape (the importer detects this wrapper and routes it to the reviews table):

{
  "editorial_review_row": {
    "broker_slug": "${(name || "").toLowerCase().replace(/\\s+/g, "-")}",
    "author": "NAFT Editorial",
    "role": "editor",
    "rating": 0,
    "content": "150–250 word signed editorial opinion here.",
    "verified_account": true,
    "status": "published"
  }
}

Broker name: ${name}`,
    example: {
      editorial_review_row: {
        broker_slug: "",
        author: "NAFT Editorial",
        role: "editor",
        rating: 0,
        content: "",
        verified_account: true,
        status: "published",
      },
    },
    schema: {
      table: "reviews",
      reserved: ["id", "created_at", "broker_id", "user_id"],
      fields: {
        // The importer auto-detects the wrapper `{ editorial_review_row: {...} }` and bypasses field validation,
        // resolving broker_slug → broker_id before insert. Schema fields here are informational.
        editorial_review_row: { type: "object", description: "Wrapper object — required" },
      },
    },
  },


  {
    key: "prop_firm",
    label: "Prop Firm",
    description: "Proprietary trading firm / funded-trader challenge (v4.8 full review)",
    table: "brokers",
    prompt: (name) => `You are NAFT's senior prop-firm analyst writing for the trader who typed "${name} review" before paying for a challenge. You have 10+ years inside the funded-trader industry. Follow NAFT Master Prompt v4.8 adapted for prop firms.

RESEARCH PROTOCOL (complete before writing):
- Tier 1 primary sources only: the firm's official website (rules PDF, FAQ, T&Cs, payout page), Trustpilot, and the firm's official Discord/Telegram announcements. If the firm publishes a public payout proof page or third-party verification (e.g. Plus500 audit, broker partnership), cite it.
- Verify: profit target %, daily/max drawdown %, min trading days, payout schedule, profit split, scaling plan, news/weekend/EA restrictions, refund policy, prohibited strategies (hedging, copy-trading, HFT/latency arb).
- Verify the backing broker / liquidity (e.g. Purple Trading, ThinkMarkets, Eightcap, Match-Trader, DXtrade) — many firms route to a real regulated broker; name it.
- If a field cannot be confirmed from a primary source, use "" / [] / null. Never invent.

FACTUALITY RULES (non-negotiable):
- Word count: 2,200–3,500 across body sections.
- Never use "guaranteed payout", "100% safe", "no rules". Always include risk language: prop trading is high-failure (industry pass rate < 10% for 2-step).
- All challenge fees must match the firm's current public pricing.

⚡ v4.8 PROP-FIRM KILL-SWITCH:
- If the firm has filed bankruptcy, halted payouts, lost its broker, been delisted by MyForexFunds/FPFX/Eightcap-style cutoffs, or is the subject of an ongoing regulator action / mass refund crisis, set top-level "warning_note" starting with "AVOID" or "WARNING" — name the event, date, and consequence (e.g. "AVOID — firm halted payouts on 2024-09-12 after broker Eightcap terminated the partnership. Active funded accounts are frozen.").
- Otherwise leave "warning_note" empty ("").

VOICE: Direct, skeptical, helpful. One funded trader talking to another. No "best prop firm", "legit", "trusted" filler.

OUTPUT — TWO JSON OBJECTS, in this exact order, concatenated (no array wrapper, no markdown fences):

  1. **prop_firm_payload** — the full row for public.brokers. NOTE: "type" MUST be exactly "prop-firm" (hyphenated — this is what the /prop-firms page filters on). Sections array MUST contain these 8 ids in order: quick-verdict, challenge-rules, drawdown-risk-rules, payout-proof, scaling-plan, platforms-broker, pros-cons, final-verdict.

  2. **editorial_review_row** — sidecar for public.reviews (same shape as broker reviews).

${baseRules}

Return a single JSON object with this exact shape, then a second editorial_review_row object:

{
  "name": "string",
  "slug": "lowercase-hyphenated",
  "type": "prop-firm",
  "founded_year": number | null,
  "headquarters": "City, Country" | null,
  "website_url": "https://..." | null,
  "description": "2-4 sentence neutral overview of model + backing broker.",
  "regulation": ["Czech NB", "ASIC (via backing broker)"] | [],
  "license_number": null,
  "min_deposit": "From $89 (10K challenge) – $1,080 (200K)",
  "leverage": "1:100",
  "avg_spread": "Raw (cTrader) / 0.6 pip avg EURUSD",
  "score": number 0-10,
  "stars": number 0-5,
  "account_types": [
    { "name": "$10K Challenge", "min_deposit": "$89 fee", "spread_from": "Raw", "commission": "$3.5/lot, 80% split" },
    { "name": "$25K Challenge", "min_deposit": "$189 fee", "spread_from": "Raw", "commission": "$3.5/lot, 80% split" },
    { "name": "$100K Challenge", "min_deposit": "$540 fee", "spread_from": "Raw", "commission": "$3.5/lot, 80–90% split" }
  ],
  "platforms": ["MT4", "MT5", "cTrader", "DXtrade", "Match-Trader"],
  "payment_methods": ["Card", "Crypto", "Bank Wire"],
  "payment_method_details": [
    { "method": "Card", "min": "$89", "processing": "Instant", "fee": "Free" },
    { "method": "Crypto (USDT)", "min": "$89", "processing": "Instant", "fee": "Free" }
  ],
  "pros": ["..."],
  "cons": ["..."],
  "support_email": "support@firm.com" | null,
  "support_phone": null,
  "withdrawal_time": "Bi-weekly, 1–3 days after request" | null,
  "withdrawal_fee": "Free" | null,
  "warning_note": "" | "AVOID/WARNING — ...",
  "tags": ["prop", "2-step", "instant-funding", "no-time-limit", "discount", "1-step"],
  "badge": "verified" | "featured" | "warning" | "none",
  "promo_label": "20% off all challenges" | null,
  "promo_code": "NAFT20" | null,
  "affiliate_url": "https://..." | null,

  "long_review": {
    "schema_version": "4.8",
    "hot_take": "2–4 sentence editorial punch. Tell the trader in 5 seconds if this challenge is passable and worth the fee — name the rule that kills most traders.",
    "telegram_summary": "2-line shareable summary for Telegram/WhatsApp.",
    "seo_audit": {
      "primary_keyword_count": 0,
      "firm_name_count": 0,
      "year_mentioned_count": 0,
      "question_headings_count": 0,
      "faq_items_count": 0,
      "internal_links_count": 0,
      "affiliate_cta_included": true,
      "legit_keyword_present": false,
      "all_tone_rules_applied": true
    },
    "verdict": {
      "tldr": "One-breath summary: who this firm is for + the headline trade-off (e.g. cheap fee but brutal 5% daily DD).",
      "summary": "Longer paragraph (optional).",
      "best_for": "Swing traders who hold positions 2–5 days",
      "not_ideal_for": "News scalpers and EA-only traders",
      "bottom_line": "Closing one-line take.",
      "star_rating": 4.2,
      "trust_score": 8.0,
      "trust_breakdown": [
        { "label": "Payout reliability", "score": 9, "max": 10, "weight": 0.3 },
        { "label": "Rule fairness", "score": 7, "max": 10, "weight": 0.2 },
        { "label": "Backing broker quality", "score": 8, "max": 10, "weight": 0.2 },
        { "label": "Platform / execution", "score": 8, "max": 10, "weight": 0.15 },
        { "label": "Community sentiment", "score": 7, "max": 10, "weight": 0.15 }
      ]
    },
    "at_a_glance": {
      "model": "2-step evaluation",
      "profit_target": "Phase 1: 10% | Phase 2: 5%",
      "max_daily_drawdown": "5%",
      "max_overall_drawdown": "10% (static)",
      "min_trading_days": "4 days per phase",
      "time_limit": "Unlimited",
      "profit_split": "80% (up to 90% after scaling)",
      "payout_frequency": "Bi-weekly on demand",
      "first_payout": "After 14 days from first trade",
      "news_trading": "Allowed",
      "weekend_holding": "Allowed",
      "ea_allowed": "Yes (no HFT / latency arb)",
      "platforms": "MT4, MT5, cTrader",
      "backing_broker": "Purple Trading (CySEC) / ThinkMarkets (ASIC)"
    },
    "geo": {
      "accepted": ["Bangladesh", "India", "Pakistan", "UAE", "Saudi Arabia", "EU", "UK"],
      "excluded": ["United States", "Canada", "Iran", "North Korea", "Syria"]
    },
    "sections": [
      {
        "id": "quick-verdict",
        "heading": "Is <Firm> Worth the Challenge Fee in 2026?",
        "body": "2–4 paragraphs. Name the rule that kills most traders. Use blank line between paragraphs."
      },
      {
        "id": "challenge-rules",
        "heading": "Challenge Rules & Pricing",
        "body": "Explain phase structure, targets, min trading days, time limit, refund policy.",
        "table": {
          "headers": ["Account", "Fee", "Phase 1 Target", "Phase 2 Target", "Daily DD", "Max DD"],
          "rows": [
            ["$10K", "$89", "10%", "5%", "5%", "10%"],
            ["$25K", "$189", "10%", "5%", "5%", "10%"],
            ["$100K", "$540", "10%", "5%", "5%", "10%"],
            ["$200K", "$1,080", "10%", "5%", "5%", "10%"]
          ],
          "footnote": "Fees refunded with first payout (if Funded)."
        }
      },
      {
        "id": "drawdown-risk-rules",
        "heading": "Drawdown & Risk Rules (the part that kills accounts)",
        "body": "Explain daily DD calc (balance vs equity, EOD vs intraday), trailing vs static max DD, consistency rule, lot-size cap, prohibited strategies (HFT, latency arb, copy-trading, group hedging).",
        "bullets": [
          "Daily DD calculated on equity, resets 00:00 server time",
          "Max DD is static from initial balance (does not trail)",
          "Consistency rule: no single day > 30% of total profit",
          "Prohibited: HFT, tick scalping, reverse arbitrage"
        ]
      },
      {
        "id": "payout-proof",
        "heading": "Payouts — Speed, Proof & Reliability",
        "body": "Cite Trustpilot payout mentions, Discord/Telegram payout-proof channel, and processing time. Note any historical halts.",
        "table": {
          "headers": ["Metric", "Value", "Source"],
          "rows": [
            ["First payout after", "14 days", "Official rules"],
            ["Payout cycle", "Every 14 days on demand", "Official rules"],
            ["Processing time", "1–3 business days", "Trustpilot review sample"],
            ["Profit split", "80% (90% scaled)", "Official rules"]
          ]
        }
      },
      {
        "id": "scaling-plan",
        "heading": "Scaling Plan & Account Growth",
        "body": "How accounts grow (e.g. +25% capital every 4 months at 10% profit). Max scale cap. Whether split increases.",
        "bullets": [
          "+25% capital every 4 consecutive profitable months",
          "Profit split increases to 90% after first scaling",
          "Max scaled balance: $2M"
        ]
      },
      {
        "id": "platforms-broker",
        "heading": "Platforms & Backing Broker",
        "body": "Which platforms, which broker the funded account routes to, raw vs marked-up spreads, commission per lot.",
        "table": {
          "headers": ["Platform", "Spread Type", "Commission/Lot", "Backing Broker"],
          "rows": [
            ["MT4 / MT5", "Raw", "$3.5", "Purple Trading (CySEC)"],
            ["cTrader", "Raw", "$3.0", "ThinkMarkets (ASIC)"]
          ]
        }
      },
      {
        "id": "pros-cons",
        "heading": "Pros & Cons",
        "for": ["Bi-weekly payouts proven on Trustpilot", "No time limit on challenge", "News + weekend holding allowed"],
        "not_for": ["Tight 5% daily DD punishes scalpers", "Consistency rule limits all-in trades", "US residents excluded"]
      },
      {
        "id": "final-verdict",
        "heading": "Final Verdict",
        "body": "Closing editorial paragraph + recommended next step (which account size to start with, or skip)."
      }
    ],
    "affiliate_cta": {
      "label": "Start <Firm> Challenge",
      "url": "https://...",
      "promo_code": "NAFT20",
      "friction_reducers": ["From $89 challenge fee", "Unlimited time", "80% split", "Bi-weekly payouts"]
    },
    "trustpilot": { "rating": 4.6, "reviews": 8420, "source_note": "Trustpilot, fetched manually." },
    "faq": [
      { "q": "How long does <Firm> take to pay out?", "a": "1–3 business days after request, bi-weekly cycle." },
      { "q": "Can I use EAs on <Firm>?", "a": "Yes, but HFT and latency arbitrage are prohibited." },
      { "q": "Is the challenge fee refunded?", "a": "Yes, with the first payout once you become Funded." }
    ],

    "author": {
      "name": "Editorial reviewer name",
      "role": "Senior Prop-Firm Analyst",
      "bio": "Short 1-2 sentence bio establishing prop-trading expertise.",
      "experience_years": 10,
      "avatar_url": "https://...",
      "sameAs": ["https://linkedin.com/in/...", "https://x.com/..."]
    },
    "toc": [
      { "id": "quick-verdict", "label": "Quick Verdict" },
      { "id": "challenge-rules", "label": "Challenge Rules" },
      { "id": "drawdown-risk-rules", "label": "Drawdown Rules" },
      { "id": "payout-proof", "label": "Payout Proof" },
      { "id": "scaling-plan", "label": "Scaling Plan" }
    ],
    "social_snippet": {
      "x": "Short tweet under 240 chars with the headline trade-off.",
      "whatsapp": "Forwardable one-liner with the trust score + key rule.",
      "telegram": "Punchy 2-line summary for Telegram channels."
    },
    "comparison_block": {
      "headline": "How <Firm> stacks up against other prop firms",
      "brokers": [
        { "slug": "ftmo", "name": "FTMO", "score": 8.8, "verdict": "Stricter consistency rule, longer payout history." },
        { "slug": "the5ers", "name": "The5%ers", "score": 8.2, "verdict": "Lower targets, smaller starting capital." }
      ]
    },
    "regulatory_risk_warning": "Proprietary trading challenges are high-risk. Industry-wide, fewer than 10% of traders pass 2-step evaluations. Challenge fees are non-refundable unless you reach Funded status.",
    "conflict_note": "NAFT may earn a commission if you start a challenge via our link. This never affects the review.",
    "last_human_review_at": "2026-05-25",
    "image_assets": [
      { "url": "https://...", "alt": "Specific descriptive alt text", "caption": "Optional caption", "section_id": "payout-proof" }
    ],
    "schema_jsonld": {
      "review": { "@context": "https://schema.org", "@type": "Review", "datePublished": "2026-05-25", "dateModified": "2026-05-25" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.2, "reviewCount": 8420 },
      "breadcrumbList": { "@type": "BreadcrumbList", "itemListElement": [] },
      "organization": { "@type": "Organization", "name": "<Firm>", "sameAs": ["https://..."] }
    },
    "reading_time_minutes": 7,
    "word_count": 1500
  },

  "sources": ["https://...", "https://..."]
}

{
  "editorial_review_row": {
    "broker_slug": "<same-slug-as-above>",
    "author": "NAFT Editorial",
    "role": "editor",
    "rating": 4.2,
    "content": "150–250 word signed editorial opinion. Open with what the firm IS (model + backing broker + years), name the rule that trips most traders, and end with who should/should not pay the fee. No marketing fluff.",
    "verified_account": true,
    "status": "published"
  }
}

Prop firm to research: ${name}`,
    example: {
      name: "FTMO",
      slug: "ftmo",
      type: "prop-firm",
      founded_year: 2015,
      headquarters: "Prague, Czech Republic",
      website_url: "https://ftmo.com",
      description: "Established 2-step prop firm backing accounts via Purple Trading (CySEC) and ThinkMarkets (ASIC). Offers $10K–$200K challenges with bi-weekly payouts and an 80–90% profit split.",
      regulation: ["Czech NB", "Purple Trading (CySEC) — backing broker"],
      min_deposit: "From $89 (10K) – $1,080 (200K)",
      leverage: "1:100",
      avg_spread: "Raw",
      score: 8.8,
      stars: 4.4,
      account_types: [
        { name: "$10K", min_deposit: "$89 fee", spread_from: "Raw", commission: "$3.5/lot, 80% split" },
        { name: "$100K", min_deposit: "$540 fee", spread_from: "Raw", commission: "$3.5/lot, 80–90% split" },
      ],
      platforms: ["MT4", "MT5", "cTrader", "DXtrade"],
      payment_methods: ["Card", "Crypto", "Bank Wire"],
      pros: ["Bi-weekly payouts proven on Trustpilot", "Refunded fee with first payout", "News + weekend holding allowed"],
      cons: ["5% daily DD is brutal for scalpers", "Strict consistency rule", "US residents excluded"],
      support_email: "support@ftmo.com",
      withdrawal_time: "Bi-weekly, 1–3 business days",
      warning_note: "",
      tags: ["prop", "2-step", "no-time-limit"],
      badge: "verified",
      sources: ["https://ftmo.com", "https://trustpilot.com/review/ftmo.com"],
    },
    schema: {
      table: "brokers",
      reserved: ["id", "created_at", "updated_at", "created_by", "review_count", "complaints"],
      fields: {
        name: { type: "string", required: true },
        slug: { type: "string", required: true },
        type: { type: "string", required: true, enum: ["prop-firm"] },
        founded_year: { type: "number" },
        headquarters: { type: "string" },
        website_url: { type: "url" },
        description: { type: "string" },
        regulation: { type: "array", itemType: "string" },
        license_number: { type: "string" },
        min_deposit: { type: "string" },
        leverage: { type: "string" },
        avg_spread: { type: "string" },
        score: { type: "number", min: 0, max: 10 },
        stars: { type: "number", min: 0, max: 5 },
        account_types: { type: "array" },
        platforms: { type: "array", itemType: "string" },
        payment_methods: { type: "array", itemType: "string" },
        payment_method_details: { type: "array" },
        pros: { type: "array", itemType: "string" },
        cons: { type: "array", itemType: "string" },
        support_email: { type: "string" },
        support_phone: { type: "string" },
        withdrawal_time: { type: "string" },
        withdrawal_fee: { type: "string" },
        warning_note: { type: "string" },
        tags: { type: "array", itemType: "string" },
        badge: { type: "string", enum: ["verified", "featured", "warning", "none"] },
        promo_label: { type: "string" },
        promo_code: { type: "string" },
        affiliate_url: { type: "url" },
        long_review: { type: "object" },
      },
    },
  },

  // -------------------------------- SPORTSBOOK --------------------------------
  {
    key: "sportsbook",
    label: "Sportsbook",
    description: "Online sports betting site",
    table: "betting_sites",
    prompt: (name) => `You are a sports-betting site research analyst. Research the sportsbook "${name}" using its official site, AskGamblers, SBR, and at least two independent reviews.

${baseRules}

{
  "name": "string",
  "slug": "lowercase-hyphenated",
  "logo": "https://..." | "",
  "rating": number 0-5,
  "license": "MGA, UKGC, Curacao, etc.",
  "min_deposit": "$10",
  "withdrawal_speed": "Instant - 24h",
  "bonus": "100% up to $200",
  "sports": ["football", "cricket", "basketball"],
  "features": ["live-streaming", "cash-out", "bet-builder"],
  "url": "https://...",
  "warning": "" | "regulatory note if any",
  "sources": ["..."]
}

Sportsbook to research: ${name}`,
    example: {
      name: "Bet365",
      slug: "bet365",
      logo: "",
      rating: 4.5,
      license: "MGA, UKGC",
      min_deposit: "$10",
      withdrawal_speed: "1-3 days",
      bonus: "Up to $100 in Bet Credits",
      sports: ["football", "cricket", "tennis"],
      features: ["live-streaming", "cash-out"],
      url: "https://www.bet365.com",
      warning: "",
      sources: ["https://www.bet365.com"],
    },
    schema: {
      table: "betting_sites",
      reserved: ["id", "created_at", "updated_at"],
      fields: {
        name: { type: "string", required: true },
        slug: { type: "string", required: true },
        logo: { type: "string" },
        rating: { type: "number", min: 0, max: 5 },
        license: { type: "string" },
        min_deposit: { type: "string" },
        withdrawal_speed: { type: "string" },
        bonus: { type: "string" },
        sports: { type: "array", itemType: "string" },
        features: { type: "array", itemType: "string" },
        url: { type: "url" },
        warning: { type: "string" },
      },
    },
  },

  // -------------------------------- SIGNAL GROUP --------------------------------
  {
    key: "signal_group",
    label: "Signal Group",
    description: "Forex / crypto trading signal provider (Telegram, Discord)",
    table: "signal_groups",
    prompt: (name) => `You are a trading-signals research analyst. Research the signal group "${name}" using its official channels (Telegram, Discord, website), Myfxbook track records, and independent reviews. Be skeptical: only count win rates from third-party verified sources.

${baseRules}

{
  "name": "string",
  "description": "2-3 sentences",
  "win_rate": number 0-100,
  "monthly_signals": "30+",
  "avg_rr": "1:2",
  "track_record": "Verified by Myfxbook (link)" | null,
  "members": "10K+",
  "verified": boolean,
  "telegram_url": "https://t.me/..." | null,
  "discord_url": "https://discord.gg/..." | null,
  "logo_url": "https://..." | "",
  "categories": ["forex", "gold", "crypto"],
  "pricing_tiers": [
    { "name": "Free", "price": "$0", "period": "monthly", "features": ["..."] },
    { "name": "Premium", "price": "$49", "period": "monthly", "features": ["..."] }
  ],
  "sources": ["..."]
}

Signal group to research: ${name}`,
    example: {
      name: "Gold Snipers",
      description: "Premium gold-only signals.",
      win_rate: 78,
      monthly_signals: "20+",
      avg_rr: "1:2",
      track_record: "Myfxbook verified",
      members: "5K",
      verified: true,
      telegram_url: "https://t.me/example",
      discord_url: null,
      logo_url: "",
      categories: ["gold"],
      pricing_tiers: [{ name: "Premium", price: "$49", period: "monthly", features: ["Daily signals", "VIP chat"] }],
      sources: ["https://www.myfxbook.com/..."],
    },
    schema: {
      table: "signal_groups",
      reserved: ["id", "created_at", "updated_at"],
      fields: {
        name: { type: "string", required: true },
        description: { type: "string" },
        win_rate: { type: "number", min: 0, max: 100 },
        monthly_signals: { type: "string" },
        avg_rr: { type: "string" },
        track_record: { type: "string" },
        members: { type: "string" },
        verified: { type: "boolean" },
        telegram_url: { type: "string" },
        discord_url: { type: "string" },
        logo_url: { type: "string" },
        categories: { type: "array", itemType: "string" },
        pricing_tiers: { type: "array" },
      },
    },
  },

  // -------------------------------- SCAM ALERT --------------------------------
  {
    key: "scam_alert",
    label: "Scam Alert",
    description: "Documented warning about a fraudulent broker / signal / firm",
    table: "scam_alerts",
    prompt: (name) => `You are a fraud-investigation analyst. Research scam reports for "${name}" using regulator warning lists (FCA Warning List, CySEC, ASIC, SEC), ForexPeaceArmy complaints, Trustpilot 1-star reviews, and Reddit threads.

${baseRules}

ONLY return data if there is verifiable evidence of fraud, regulator warning, or pattern of complaints. If insufficient evidence, return: { "insufficient_evidence": true, "reason": "..." }

Otherwise:

{
  "title": "Short headline",
  "description": "Detailed factual summary (3-6 sentences) of what was reported",
  "severity": "low" | "medium" | "high" | "critical",
  "broker_name": "${name}",
  "is_repeat_offender": boolean,
  "show_full_report": false,
  "sources": ["regulator warning URL", "complaint thread URL", "..."]
}

Subject to investigate: ${name}`,
    example: {
      title: "FCA-flagged unauthorised broker",
      description: "Listed on the FCA warning list as offering financial services without authorisation.",
      severity: "high",
      broker_name: "ExampleScam",
      is_repeat_offender: false,
      show_full_report: false,
      sources: ["https://www.fca.org.uk/news/warnings/..."],
    },
    schema: {
      table: "scam_alerts",
      reserved: ["id", "created_at", "created_by", "broker_id"],
      fields: {
        title: { type: "string", required: true },
        description: { type: "string", required: true },
        severity: { type: "string", required: true, enum: ["low", "medium", "high", "critical"] },
        is_repeat_offender: { type: "boolean" },
        show_full_report: { type: "boolean" },
      },
    },
  },

  // -------------------------------- PROMOTION --------------------------------
  {
    key: "promotion",
    label: "Promotion",
    description: "Active broker promotion / bonus / cashback offer",
    table: "promotions",
    prompt: (name) => `You are a promotions research analyst. Research the active promotion offered by broker "${name}" using only the broker's official promotions page and the most recent terms & conditions.

${baseRules}

{
  "title": "100% Deposit Bonus up to $1000",
  "broker_name": "${name}",
  "promo_type": "bonus" | "cashback" | "rebate" | "no-deposit" | "contest",
  "bonus_amount": "$1000",
  "description": "Short tagline (1-2 sentences)",
  "full_description": "Full marketing copy (3-6 sentences)",
  "terms": ["Min deposit $100", "Trading volume requirement", "..."],
  "how_to_claim": ["Open account", "Deposit $100+", "Bonus credited within 24h"],
  "expiry_date": "YYYY-MM-DD" | null,
  "link_url": "https://...",
  "image_url": "" | "https://...",
  "is_featured": false,
  "sources": ["official promotion T&C URL"]
}

Promotion to research: ${name}'s current bonus`,
    example: {
      title: "100% Deposit Bonus",
      broker_name: "Exness",
      promo_type: "bonus",
      bonus_amount: "$2000",
      description: "Double your first deposit up to $2000.",
      full_description: "Open a Standard account and get a 100% deposit match up to $2000 on your first qualifying deposit.",
      terms: ["Min deposit $50", "30-day expiry"],
      how_to_claim: ["Register", "Deposit", "Opt in"],
      expiry_date: null,
      link_url: "https://www.exness.com/promo",
      image_url: "",
      is_featured: false,
      sources: ["https://www.exness.com/terms"],
    },
    schema: {
      table: "promotions",
      reserved: ["id", "created_at", "updated_at", "created_by", "broker_id", "slug"],
      fields: {
        title: { type: "string", required: true },
        broker_name: { type: "string" },
        promo_type: { type: "string", required: true, enum: ["bonus", "cashback", "rebate", "no-deposit", "contest"] },
        bonus_amount: { type: "string" },
        description: { type: "string" },
        full_description: { type: "string" },
        terms: { type: "array", itemType: "string" },
        how_to_claim: { type: "array", itemType: "string" },
        expiry_date: { type: "date" },
        link_url: { type: "url" },
        image_url: { type: "string" },
        is_featured: { type: "boolean" },
      },
    },
  },

  // -------------------------------- EDUCATION ARTICLE --------------------------------
  {
    key: "education",
    label: "Education Article",
    description: "Beginner / intermediate / advanced trading education article",
    table: "education_articles",
    prompt: (name) => `You are a trading-education writer. Write an article on the topic "${name}" suitable for the chosen track (beginner / intermediate / advanced).

${baseRules}

{
  "title": "Article title",
  "slug": "lowercase-hyphenated",
  "track": "beginner" | "intermediate" | "advanced",
  "read_time": number (minutes),
  "is_locked": false,
  "hero_image_url": "" | "https://...",
  "key_takeaway": "1-sentence summary of the most important lesson",
  "display_order": 0,
  "sections": [
    { "heading": "Introduction", "body": "Markdown-formatted body text..." },
    { "heading": "Core Concept", "body": "..." },
    { "heading": "Worked Example", "body": "..." },
    { "heading": "Common Mistakes", "body": "..." },
    { "heading": "Summary", "body": "..." }
  ],
  "sources": ["..."]
}

Topic to write about: ${name}`,
    example: {
      title: "What is a pip?",
      slug: "what-is-a-pip",
      track: "beginner",
      read_time: 5,
      is_locked: false,
      hero_image_url: "",
      key_takeaway: "A pip is the smallest standard price move in a forex pair, usually the 4th decimal place.",
      display_order: 1,
      sections: [{ heading: "Intro", body: "..." }],
      sources: ["https://www.investopedia.com/terms/p/pip.asp"],
    },
    schema: {
      table: "education_articles",
      reserved: ["id", "created_at", "updated_at", "course_id"],
      fields: {
        title: { type: "string", required: true },
        slug: { type: "string", required: true },
        track: { type: "string", required: true, enum: ["beginner", "intermediate", "advanced"] },
        read_time: { type: "number" },
        is_locked: { type: "boolean" },
        hero_image_url: { type: "string" },
        key_takeaway: { type: "string" },
        display_order: { type: "number" },
        sections: { type: "array", required: true },
      },
    },
  },

  // -------------------------------- NEWS ARTICLE --------------------------------
  {
    key: "news",
    label: "News Article",
    description: "Forex / market news article",
    table: "news_articles",
    prompt: (name) => `You are a financial-news editor. Research the topic "${name}" and write a news article using only verifiable wire sources (Reuters, Bloomberg, FT, Investing.com).

${baseRules}

{
  "title": "Headline",
  "slug": "lowercase-hyphenated",
  "category": "market" | "broker" | "regulation" | "crypto" | "analysis",
  "excerpt": "1-2 sentence teaser",
  "content": "Full article body (markdown, 300-600 words)",
  "author": "NAFT Editorial",
  "image_url": "" | "https://...",
  "source_url": "https://..." (primary source),
  "sources": ["..."]
}

Topic: ${name}`,
    example: {
      title: "Fed signals rate hold at next meeting",
      slug: "fed-signals-rate-hold",
      category: "market",
      excerpt: "Fed officials suggest a pause is likely.",
      content: "...",
      author: "NAFT Editorial",
      image_url: "",
      source_url: "https://www.reuters.com/...",
      sources: ["https://www.reuters.com/..."],
    },
    schema: {
      table: "news_articles",
      reserved: ["id", "created_at", "updated_at", "created_by"],
      fields: {
        title: { type: "string", required: true },
        slug: { type: "string", required: true },
        category: { type: "string", required: true, enum: ["market", "broker", "regulation", "crypto", "analysis"] },
        excerpt: { type: "string" },
        content: { type: "string" },
        author: { type: "string" },
        image_url: { type: "string" },
        source_url: { type: "url" },
      },
    },
  },

  // -------------------------------- CALENDAR EVENT --------------------------------
  {
    key: "calendar",
    label: "Calendar Event",
    description: "Economic / earnings calendar event",
    table: "calendar_events",
    prompt: (name) => `You are an economic-calendar curator. Research the upcoming economic event "${name}" using ForexFactory, Investing.com, and the issuing institution's official release schedule.

${baseRules}

{
  "title": "US Non-Farm Payrolls",
  "category": "economic" | "earnings" | "central-bank" | "geopolitical",
  "currency": "USD" | "EUR" | "..." | "",
  "impact": "low" | "medium" | "high",
  "event_date": "YYYY-MM-DD",
  "event_time": "HH:MM" (24h, source timezone) | null,
  "description": "What the release measures",
  "previous_value": "150K" | "",
  "forecast_value": "180K" | "",
  "actual_value": "" (leave empty until release),
  "specs": { "timezone": "America/New_York", "frequency": "monthly" },
  "sources": ["..."]
}

Event to research: ${name}`,
    example: {
      title: "US CPI",
      category: "economic",
      currency: "USD",
      impact: "high",
      event_date: "2026-06-12",
      event_time: "08:30",
      description: "Consumer Price Index, year-over-year change.",
      previous_value: "3.2%",
      forecast_value: "3.1%",
      actual_value: "",
      specs: { timezone: "America/New_York", frequency: "monthly" },
      sources: ["https://www.bls.gov/cpi/"],
    },
    schema: {
      table: "calendar_events",
      reserved: ["id", "created_at", "updated_at", "created_by"],
      fields: {
        title: { type: "string", required: true },
        category: { type: "string", required: true, enum: ["economic", "earnings", "central-bank", "geopolitical"] },
        currency: { type: "string" },
        impact: { type: "string", required: true, enum: ["low", "medium", "high"] },
        event_date: { type: "date", required: true },
        event_time: { type: "string" },
        description: { type: "string" },
        previous_value: { type: "string" },
        forecast_value: { type: "string" },
        actual_value: { type: "string" },
        specs: { type: "object" },
      },
    },
  },

  // -------------------------------- FORECAST --------------------------------
  {
    key: "forecast",
    label: "Forecast",
    description: "Trading idea / forecast on a forex / crypto / stock pair",
    table: "forecasts",
    prompt: (name) => `You are a market analyst. Research current technical and fundamental conditions for "${name}" and produce a directional forecast.

${baseRules}

{
  "pair": "XAU/USD",
  "category": "forex" | "crypto" | "stocks" | "commodities" | "indices",
  "direction": "bullish" | "bearish" | "neutral",
  "potential": "LOW" | "MED" | "HIGH",
  "reasoning": "3-6 sentences citing the technical/fundamental basis",
  "updated_label": "today" | "this week" | "Q3 outlook",
  "sources": ["..."]
}

Asset to forecast: ${name}`,
    example: {
      pair: "XAU/USD",
      category: "commodities",
      direction: "bullish",
      potential: "HIGH",
      reasoning: "Gold is breaking above the multi-week resistance with rising volume...",
      updated_label: "this week",
      sources: ["https://www.tradingview.com/symbols/XAUUSD/"],
    },
    schema: {
      table: "forecasts",
      reserved: ["id", "created_at", "updated_at", "created_by"],
      fields: {
        pair: { type: "string", required: true },
        category: { type: "string", required: true, enum: ["forex", "crypto", "stocks", "commodities", "indices"] },
        direction: { type: "string", required: true, enum: ["bullish", "bearish", "neutral"] },
        potential: { type: "string", required: true, enum: ["LOW", "MED", "HIGH"] },
        reasoning: { type: "string" },
        updated_label: { type: "string" },
      },
    },
  },
];

export const getEntity = (key: string) => ENTITIES.find((e) => e.key === key);
