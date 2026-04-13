export interface PromotionDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_description: string;
  promo_type: string;
  bonus_amount: string;
  expiry_date: string | null;
  link_url: string;
  image_url: string;
  is_featured: boolean;
  how_to_claim: string[];
  terms: string[];
  broker_name: string;
  created_at: string;
}

export const promoTypes = [
  { value: "all", label: "All" },
  { value: "bonus", label: "Deposit Bonus" },
  { value: "no-deposit", label: "No Deposit" },
  { value: "cashback", label: "Cashback" },
  { value: "discount", label: "Challenge Discount" },
  { value: "spread", label: "Low Spread" },
  { value: "profit-split", label: "Profit Split" },
  { value: "low-deposit", label: "Free Trial / Low Deposit" },
];

export const fallbackPromos: PromotionDetail[] = [
  {
    id: "1", slug: "exness-100-deposit-bonus", title: "Exness 100% Deposit Bonus",
    description: "Get 100% bonus on your first deposit. Trade with double the capital from day one.",
    full_description: "Exness is offering a massive 100% deposit bonus for new and existing traders. This means if you deposit $500, you'll get an additional $500 in bonus funds, giving you $1,000 to trade with. The bonus applies to all account types and can be used across forex, metals, and crypto pairs.\n\nThis is one of the most generous offers in the industry right now, and Exness's ultra-fast execution and tight spreads make it even more valuable. Whether you're a scalper or a swing trader, doubling your margin gives you significantly more flexibility.",
    promo_type: "bonus", bonus_amount: "100%", expiry_date: "2026-05-31",
    link_url: "#", image_url: "", is_featured: true, broker_name: "Exness",
    how_to_claim: [
      "Open a new Exness Standard or Pro account",
      "Complete identity verification (KYC)",
      "Make a minimum deposit of $100",
      "Bonus is credited automatically within 24 hours",
      "Start trading — bonus funds are available immediately",
    ],
    terms: [
      "Minimum deposit: $100 USD",
      "Maximum bonus: $10,000 per account",
      "Bonus is non-withdrawable but profits earned are fully withdrawable",
      "Must complete 5 standard lots to unlock profit withdrawal",
      "Offer valid for new deposits only — internal transfers excluded",
      "Available for Standard and Pro accounts only",
      "Exness reserves the right to modify or cancel the promotion",
    ],
    created_at: "2026-04-01",
  },
  {
    id: "2", slug: "ftmo-20-off-challenge", title: "FTMO 20% Off Challenge Fee",
    description: "Save 20% on FTMO challenge fees. Limited time offer for all account sizes.",
    full_description: "FTMO is running a limited-time 20% discount on all challenge fees across every account size. Whether you're going for the $10K, $50K, or $200K challenge, this discount applies equally.\n\nFTMO is widely regarded as the gold standard of prop trading firms, with a transparent evaluation process and an 80/20 profit split (upgradeable to 90/10). This discount makes the entry barrier even lower for aspiring funded traders.",
    promo_type: "discount", bonus_amount: "20% Off", expiry_date: "2026-04-30",
    link_url: "#", image_url: "", is_featured: true, broker_name: "FTMO",
    how_to_claim: [
      "Visit FTMO's website through our affiliate link",
      "Select your preferred account size",
      "Use code NAFT20 at checkout",
      "Discount is applied automatically",
    ],
    terms: [
      "Valid on all FTMO Challenge account sizes",
      "Cannot be combined with other discounts",
      "One-time use per customer",
      "Code expires April 30, 2026",
    ],
    created_at: "2026-04-02",
  },
  {
    id: "3", slug: "xm-30-no-deposit-bonus", title: "XM $30 No-Deposit Bonus",
    description: "Start trading with $30 free — no deposit required. Available for new accounts.",
    full_description: "XM's $30 no-deposit bonus is one of the best ways to start trading with zero risk. Simply register a new account, verify your identity, and $30 will be credited to your trading account instantly.\n\nThis is ideal for beginners who want to experience live market conditions without putting their own money at risk. You can trade forex, commodities, and indices with real market prices and keep any profits you make.",
    promo_type: "no-deposit", bonus_amount: "$30", expiry_date: null,
    link_url: "#", image_url: "", is_featured: false, broker_name: "XM",
    how_to_claim: [
      "Register a new XM Micro or Standard account",
      "Complete full identity verification",
      "$30 bonus is credited within minutes",
      "Start trading — no deposit needed",
    ],
    terms: [
      "Available for new XM clients only",
      "Bonus cannot be withdrawn — only profits are withdrawable",
      "Minimum 10 micro lots required before withdrawal",
      "Profits capped at $100 from the bonus",
      "Account must be verified within 30 days",
    ],
    created_at: "2026-03-15",
  },
  {
    id: "4", slug: "ic-markets-raw-spread", title: "IC Markets Raw Spread from 0.0",
    description: "Open a Raw Spread account and enjoy spreads from 0.0 pips on major pairs.",
    full_description: "IC Markets is renowned for offering some of the tightest spreads in the industry. With their Raw Spread account, you get direct market access with spreads starting from 0.0 pips on major currency pairs like EUR/USD and USD/JPY.\n\nCombined with ultra-fast execution (under 40ms average) and deep liquidity from tier-1 providers, this makes IC Markets the go-to broker for scalpers and high-frequency traders.",
    promo_type: "spread", bonus_amount: "0.0 pips", expiry_date: null,
    link_url: "#", image_url: "", is_featured: false, broker_name: "IC Markets",
    how_to_claim: [
      "Open an IC Markets Raw Spread account",
      "Fund your account with a minimum of $200",
      "Raw spreads are available immediately on all major pairs",
    ],
    terms: [
      "Commission of $3.50 per lot per side applies",
      "Minimum deposit: $200",
      "Available on MT4, MT5, and cTrader platforms",
      "Spreads are variable and depend on market conditions",
    ],
    created_at: "2026-03-20",
  },
  {
    id: "5", slug: "maven-trading-90-profit-split", title: "Maven Trading 90% Profit Split",
    description: "Keep 90% of your profits. One of the highest splits in the prop firm industry.",
    full_description: "Maven Trading offers one of the most competitive profit splits in the prop firm industry — a full 90% of all profits go directly to the trader. Combined with their straightforward two-phase evaluation and no time limits, this makes Maven an attractive option for serious traders.\n\nUnlike many competitors, Maven Trading also offers free retries if you fail within the first week, and their scaling plan allows funded accounts up to $2M.",
    promo_type: "profit-split", bonus_amount: "90%", expiry_date: "2026-06-15",
    link_url: "#", image_url: "", is_featured: true, broker_name: "Maven Trading",
    how_to_claim: [
      "Sign up for a Maven Trading evaluation",
      "Complete Phase 1 (8% target) and Phase 2 (5% target)",
      "Get funded and start earning with 90% profit split",
    ],
    terms: [
      "Profit split: 90/10 (trader/firm)",
      "No time limit on evaluation phases",
      "Daily drawdown limit: 5%",
      "Maximum drawdown: 10%",
      "Free retry if account blown within first 7 days",
      "Scaling available up to $2,000,000",
    ],
    created_at: "2026-04-05",
  },
  {
    id: "6", slug: "bullwaves-start-with-10", title: "Bullwaves — Start with Just $10",
    description: "Micro-lot trading with a minimum $10 deposit. Perfect for beginners.",
    full_description: "Bullwaves makes trading accessible to everyone with their ultra-low $10 minimum deposit. This is perfect for beginners who want to test the waters with real money but without significant risk.\n\nDespite the low entry, Bullwaves offers a full range of instruments including forex, crypto, commodities, and indices, with leverage up to 1:500 and micro-lot sizing for precise position management.",
    promo_type: "low-deposit", bonus_amount: "$10 min", expiry_date: null,
    link_url: "#", image_url: "", is_featured: false, broker_name: "Bullwaves",
    how_to_claim: [
      "Register a Bullwaves account",
      "Deposit as little as $10 via card, crypto, or e-wallet",
      "Start trading micro lots on 100+ instruments",
    ],
    terms: [
      "Minimum deposit: $10 USD",
      "Leverage up to 1:500",
      "Micro-lot (0.01) trading available",
      "No commission on Standard accounts",
      "Withdrawal minimum: $10",
    ],
    created_at: "2026-03-25",
  },
];

export const getPromoBySlug = (slug: string): PromotionDetail | undefined =>
  fallbackPromos.find((p) => p.slug === slug);
