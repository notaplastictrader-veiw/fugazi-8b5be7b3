// Country → recommended regulator codes + local trading context
export interface CountryGuide {
  code: string;
  slug: string;
  name: string;
  flag: string;
  preferredRegulators: string[]; // regulator codes to filter by
  localRegulator?: { code: string; name: string };
  legalStatus: "legal" | "restricted" | "grey";
  notes: string;
  taxNote?: string;
  popularPaymentMethods: string[];
}

export const countryGuides: CountryGuide[] = [
  {
    code: "BD",
    slug: "bangladesh",
    name: "Bangladesh",
    flag: "🇧🇩",
    preferredRegulators: ["FCA", "ASIC", "CySEC", "FSCA"],
    legalStatus: "grey",
    notes:
      "Forex trading is in a regulatory grey area in Bangladesh. The Bangladesh Bank does not licence retail forex brokers, so all access is via offshore brokers. Most local traders use international brokers with FCA, ASIC, or CySEC licences and fund via crypto, Skrill, or Neteller.",
    popularPaymentMethods: ["bKash (via P2P)", "Crypto (USDT)", "Skrill", "Neteller"],
  },
  {
    code: "IN",
    slug: "india",
    name: "India",
    flag: "🇮🇳",
    preferredRegulators: ["FCA", "ASIC", "CySEC"],
    localRegulator: { code: "SEBI", name: "Securities and Exchange Board of India" },
    legalStatus: "restricted",
    notes:
      "Forex trading by Indian residents is restricted to INR-quoted pairs on SEBI-regulated exchanges (NSE, BSE). Trading offshore forex is technically prohibited under FEMA, though many use international brokers. Use cautious risk and proper documentation.",
    taxNote: "Forex profits taxed as business income or speculative gains depending on volume.",
    popularPaymentMethods: ["UPI (P2P)", "Crypto (USDT)", "Skrill", "Wire Transfer"],
  },
  {
    code: "PK",
    slug: "pakistan",
    name: "Pakistan",
    flag: "🇵🇰",
    preferredRegulators: ["FCA", "ASIC", "CySEC", "DFSA"],
    legalStatus: "grey",
    notes:
      "The State Bank of Pakistan does not licence retail forex brokers. Local traders use international brokers, typically funding via crypto or e-wallets due to currency-control restrictions on outbound USD transfers.",
    popularPaymentMethods: ["Crypto (USDT)", "Skrill", "JazzCash (P2P)", "Easypaisa (P2P)"],
  },
  {
    code: "AE",
    slug: "uae",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    preferredRegulators: ["DFSA", "FCA", "ASIC", "CySEC"],
    localRegulator: { code: "DFSA / SCA", name: "DFSA / Securities & Commodities Authority" },
    legalStatus: "legal",
    notes:
      "Forex trading is legal and active in the UAE. Brokers serving residents should hold a DFSA licence (DIFC) or another tier-1 international licence. Strong banking infrastructure and AED-friendly accounts.",
    popularPaymentMethods: ["Bank Wire", "Credit Card", "Skrill", "Crypto"],
  },
  {
    code: "SA",
    slug: "saudi-arabia",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    preferredRegulators: ["FCA", "ASIC", "CySEC", "DFSA"],
    legalStatus: "legal",
    notes:
      "Retail forex trading is legal. Most Saudi traders use international brokers with Islamic / swap-free accounts to comply with Sharia. Look for tier-1 regulation and verified swap-free policy.",
    popularPaymentMethods: ["Bank Wire", "Visa/Mastercard", "Skrill", "Crypto"],
  },
  {
    code: "ID",
    slug: "indonesia",
    name: "Indonesia",
    flag: "🇮🇩",
    preferredRegulators: ["FCA", "ASIC", "CySEC"],
    localRegulator: { code: "BAPPEBTI", name: "Commodity Futures Trading Regulatory Agency" },
    legalStatus: "legal",
    notes:
      "Forex is legal under BAPPEBTI but only a few local brokers are licensed. Most retail traders use international brokers. Islamic accounts are widely available.",
    popularPaymentMethods: ["Bank Transfer", "Crypto (USDT)", "Skrill"],
  },
  {
    code: "MY",
    slug: "malaysia",
    name: "Malaysia",
    flag: "🇲🇾",
    preferredRegulators: ["FCA", "ASIC", "CySEC", "MAS"],
    localRegulator: { code: "SC", name: "Securities Commission Malaysia" },
    legalStatus: "legal",
    notes:
      "Forex is legal via Bank Negara-approved channels. Many traders use international brokers with Islamic accounts. Verify Sharia compliance carefully.",
    popularPaymentMethods: ["Bank Transfer", "Skrill", "Crypto"],
  },
  {
    code: "NG",
    slug: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    preferredRegulators: ["FSCA", "FCA", "ASIC", "CySEC"],
    localRegulator: { code: "SEC Nigeria", name: "Securities and Exchange Commission" },
    legalStatus: "legal",
    notes:
      "Forex trading is legal. Foreign brokers serving Nigerians should hold a tier-1 or tier-2 licence. Currency-control rules can make USD funding awkward — many use crypto or domiciliary accounts.",
    popularPaymentMethods: ["Bank Transfer", "Crypto (USDT)", "Skrill", "Neteller"],
  },
  {
    code: "ZA",
    slug: "south-africa",
    name: "South Africa",
    flag: "🇿🇦",
    preferredRegulators: ["FSCA", "FCA", "ASIC", "CySEC"],
    legalStatus: "legal",
    notes:
      "Forex is legal and well regulated by FSCA. South African residents can trade with both local FSCA-licensed brokers and international tier-1 brokers (within SARB exchange-control limits).",
    popularPaymentMethods: ["EFT", "Credit Card", "Skrill", "Crypto"],
  },
  {
    code: "GB",
    slug: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    preferredRegulators: ["FCA"],
    legalStatus: "legal",
    notes:
      "FCA-regulated brokers only for UK retail clients. Leverage capped at 1:30 on majors. Strong consumer protection — FSCS covers up to £85,000.",
    popularPaymentMethods: ["Faster Payments", "Debit Card", "Skrill", "PayPal"],
  },
  {
    code: "AU",
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    preferredRegulators: ["ASIC"],
    legalStatus: "legal",
    notes:
      "Use ASIC-regulated brokers. Leverage capped at 1:30 retail. AFCA dispute resolution available.",
    popularPaymentMethods: ["BPAY", "POLi", "Bank Transfer", "Visa/Mastercard"],
  },
  {
    code: "PH",
    slug: "philippines",
    name: "Philippines",
    flag: "🇵🇭",
    preferredRegulators: ["FCA", "ASIC", "CySEC"],
    legalStatus: "grey",
    notes:
      "The SEC Philippines warns against unregistered forex brokers, though enforcement is limited. Traders typically use international brokers funded via GCash (P2P) or crypto.",
    popularPaymentMethods: ["GCash (P2P)", "Crypto (USDT)", "Skrill"],
  },
  {
    code: "VN",
    slug: "vietnam",
    name: "Vietnam",
    flag: "🇻🇳",
    preferredRegulators: ["FCA", "ASIC", "CySEC"],
    legalStatus: "grey",
    notes: "Retail forex is restricted by the State Bank of Vietnam. Many traders use offshore brokers funded via crypto.",
    popularPaymentMethods: ["Crypto (USDT)", "Bank Transfer (P2P)", "Skrill"],
  },
];

export const countryGuideBySlug = (slug: string) => countryGuides.find(c => c.slug === slug);
export const countryGuideByCode = (code: string) =>
  countryGuides.find(c => c.code.toLowerCase() === code.toLowerCase());
