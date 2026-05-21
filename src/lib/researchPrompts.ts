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
    prompt: (name) => `You are a senior forex broker analyst writing a full editorial review for NAFT. Research the broker "${name}" using only verifiable sources: the broker's official website, regulator public registers (FCA, CySEC, ASIC, FSCA, NFA, DFSA, IFSC, etc.), Trustpilot, ForexPeaceArmy, and at least two independent broker-review sites.

${baseRules}

You MUST return BOTH the top-level summary fields AND a complete "long_review" object that follows the canonical schema (verdict, at_a_glance, geo, sections[], affiliate_cta, trustpilot, faq, meta). The "sections" array must contain 6–8 sections with these exact ids in this order:
quick-verdict, regulation-safety, geo-availability, spreads-accounts-fees, deposits-withdrawals, platforms-tools, pros-cons, final-verdict.

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
    "reading_time_minutes": 7,
    "word_count": 1450
  },

  "sources": ["https://...", "https://..."]
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
        long_review: { type: "object", description: "Canonical long-review JSON (verdict, at_a_glance, geo, sections, affiliate_cta, trustpilot, faq)" },
      },
    },
  },

  // -------------------------------- PROP FIRM --------------------------------
  {
    key: "prop_firm",
    label: "Prop Firm",
    description: "Proprietary trading firm / funded-trader challenge",
    table: "brokers",
    prompt: (name) => `You are a proprietary-trading-firm research analyst. Research the prop firm "${name}" using its official website, Trustpilot, Propfirmmatch, and at least two independent reviews.

${baseRules}

Return a JSON object. Note: "type" MUST be "prop". Use the "account_types" field to describe challenge tiers (e.g., $10K, $25K, $100K).

{
  "name": "string",
  "slug": "lowercase-hyphenated",
  "type": "prop",
  "founded_year": number | null,
  "headquarters": "City, Country" | null,
  "website_url": "https://...",
  "description": "2-4 sentences",
  "regulation": ["..."] (often empty for prop firms; include any if applicable),
  "min_deposit": "$10K-$200K (challenge fee from $50)",
  "leverage": "1:100",
  "avg_spread": "Raw / Standard depending on broker",
  "score": number 0-10,
  "stars": number 0-5,
  "account_types": [{ "name": "$10K Challenge", "min_deposit": "$89 fee", "spread_from": "Raw", "commission": "Profit split 80%" }],
  "platforms": ["MT4", "MT5", "cTrader"],
  "payment_methods": ["Card", "Crypto"],
  "pros": ["..."],
  "cons": ["..."],
  "support_email": "...",
  "withdrawal_time": "...",
  "tags": ["prop"],
  "badge": "verified" | "featured" | "warning" | "none",
  "sources": ["..."]
}

Prop firm to research: ${name}`,
    example: {
      name: "FTMO",
      slug: "ftmo",
      type: "prop",
      founded_year: 2015,
      headquarters: "Prague, Czech Republic",
      website_url: "https://ftmo.com",
      description: "Established prop firm offering 2-step evaluations.",
      regulation: ["Czech NB"],
      min_deposit: "From $89 (10K challenge)",
      leverage: "1:100",
      avg_spread: "Raw",
      score: 8.8,
      stars: 4.4,
      account_types: [{ name: "$10K", min_deposit: "$89 fee", spread_from: "Raw", commission: "80% profit split" }],
      platforms: ["MT4", "MT5", "cTrader"],
      payment_methods: ["Card", "Crypto"],
      pros: ["Trusted brand"],
      cons: ["Strict daily loss limit"],
      tags: ["prop"],
      badge: "verified",
      sources: ["https://ftmo.com"],
    },
    schema: {
      table: "brokers",
      reserved: ["id", "created_at", "updated_at", "created_by", "review_count", "complaints"],
      fields: {
        name: { type: "string", required: true },
        slug: { type: "string", required: true },
        type: { type: "string", required: true, enum: ["prop"] },
        founded_year: { type: "number" },
        headquarters: { type: "string" },
        website_url: { type: "url" },
        description: { type: "string" },
        regulation: { type: "array", itemType: "string" },
        min_deposit: { type: "string" },
        leverage: { type: "string" },
        avg_spread: { type: "string" },
        score: { type: "number", min: 0, max: 10 },
        stars: { type: "number", min: 0, max: 5 },
        account_types: { type: "array" },
        platforms: { type: "array", itemType: "string" },
        payment_methods: { type: "array", itemType: "string" },
        pros: { type: "array", itemType: "string" },
        cons: { type: "array", itemType: "string" },
        support_email: { type: "string" },
        withdrawal_time: { type: "string" },
        tags: { type: "array", itemType: "string" },
        badge: { type: "string", enum: ["verified", "featured", "warning", "none"] },
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
