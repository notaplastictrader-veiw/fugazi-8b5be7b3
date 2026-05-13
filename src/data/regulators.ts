export interface Regulator {
  slug: string;
  code: string;
  name: string;
  fullName: string;
  country: string;
  countryCode: string;
  tier: 1 | 2 | 3;
  established: number;
  website: string;
  summary: string;
  whatItMeans: string;
  protections: string[];
  limits: string[];
}

// Tier 1 = Strong (FCA, ASIC, NFA, FINMA, FSA-JP)
// Tier 2 = Strong-mid (CySEC, BaFin, MAS, DFSA, FSCA)
// Tier 3 = Offshore / Light (IFSC, FSC-BVI, SVG, IFMRRC, VFSC)
export const regulators: Regulator[] = [
  {
    slug: "fca",
    code: "FCA",
    name: "FCA",
    fullName: "Financial Conduct Authority",
    country: "United Kingdom",
    countryCode: "GB",
    tier: 1,
    established: 2013,
    website: "https://www.fca.org.uk",
    summary:
      "The UK's financial regulator. One of the strictest globally — segregated client funds, FSCS protection up to £85,000, and negative balance protection mandatory.",
    whatItMeans:
      "If your broker is FCA-regulated, your money is held in segregated accounts and you're covered up to £85,000 if the broker goes bust. Leverage on majors is capped at 1:30 for retail.",
    protections: [
      "FSCS deposit protection up to £85,000",
      "Mandatory segregated client funds",
      "Negative balance protection",
      "Strict ad and bonus restrictions",
      "Public complaint resolution via FOS",
    ],
    limits: ["Max retail leverage 1:30 on majors", "No bonus promotions allowed", "Strict marketing rules"],
  },
  {
    slug: "asic",
    code: "ASIC",
    name: "ASIC",
    fullName: "Australian Securities and Investments Commission",
    country: "Australia",
    countryCode: "AU",
    tier: 1,
    established: 1998,
    website: "https://asic.gov.au",
    summary:
      "Australia's financial regulator. Highly respected, strict capital requirements, and tough on misleading conduct. Leverage capped at 1:30 since 2021.",
    whatItMeans:
      "ASIC oversight means real capital reserves at the broker, segregated funds, and quick public action when brokers misbehave. AFCA handles disputes.",
    protections: [
      "Segregated client funds",
      "Negative balance protection (retail)",
      "AFCA dispute resolution",
      "Tough enforcement record",
    ],
    limits: ["Max retail leverage 1:30 on majors", "No deposit-bonus promotions for retail"],
  },
  {
    slug: "cysec",
    code: "CySEC",
    name: "CySEC",
    fullName: "Cyprus Securities and Exchange Commission",
    country: "Cyprus",
    countryCode: "CY",
    tier: 2,
    established: 2001,
    website: "https://www.cysec.gov.cy",
    summary:
      "EU-passportable regulator under MiFID II. Most international forex brokers hold a CySEC licence to serve EU clients. ICF compensation up to €20,000.",
    whatItMeans:
      "Solid mid-tier regulation. You get EU-wide protection, segregated funds, and €20k ICF coverage. Leverage capped at 1:30 for retail.",
    protections: [
      "ICF compensation up to €20,000",
      "Segregated client funds",
      "Negative balance protection",
      "MiFID II compliance",
    ],
    limits: ["Max retail leverage 1:30 on majors", "Cannot offer bonus promotions to retail"],
  },
  {
    slug: "nfa",
    code: "NFA",
    name: "NFA / CFTC",
    fullName: "National Futures Association / Commodity Futures Trading Commission",
    country: "United States",
    countryCode: "US",
    tier: 1,
    established: 1982,
    website: "https://www.nfa.futures.org",
    summary:
      "US forex regulator. The strictest in the world — FIFO rule, no hedging, max 1:50 leverage, and a $20 million minimum capital requirement. Few brokers qualify.",
    whatItMeans:
      "If a broker is NFA/CFTC-regulated, they have serious capital and are subject to monthly reporting. Most international brokers don't accept US clients because compliance is too expensive.",
    protections: ["High capital requirements", "Monthly financial reporting", "Strict enforcement"],
    limits: ["Max leverage 1:50 majors / 1:20 minors", "No hedging, FIFO order rule", "No bonuses"],
  },
  {
    slug: "finma",
    code: "FINMA",
    name: "FINMA",
    fullName: "Swiss Financial Market Supervisory Authority",
    country: "Switzerland",
    countryCode: "CH",
    tier: 1,
    established: 2009,
    website: "https://www.finma.ch",
    summary:
      "Switzerland's financial regulator. Banking-grade oversight — FINMA-licensed brokers must be Swiss banks with full deposit insurance up to CHF 100,000.",
    whatItMeans:
      "Highest level of safety. FINMA brokers are essentially banks. Deposits are insured up to CHF 100,000 per client.",
    protections: ["Bank-grade deposit insurance up to CHF 100,000", "Full segregation", "Strict capital requirements"],
    limits: ["Higher minimum deposits", "Limited number of brokers qualify"],
  },
  {
    slug: "fsa-jp",
    code: "FSA",
    name: "FSA Japan",
    fullName: "Financial Services Agency of Japan",
    country: "Japan",
    countryCode: "JP",
    tier: 1,
    established: 2000,
    website: "https://www.fsa.go.jp",
    summary:
      "Japan's financial regulator. Strict capital and conduct rules. Leverage capped at 1:25 for retail clients.",
    whatItMeans: "FSA-licensed brokers operate to bank-like standards. Strong consumer protection and fast enforcement.",
    protections: ["Segregated funds", "Strong consumer protection", "Compensation scheme"],
    limits: ["Max retail leverage 1:25"],
  },
  {
    slug: "bafin",
    code: "BaFin",
    name: "BaFin",
    fullName: "Federal Financial Supervisory Authority (Germany)",
    country: "Germany",
    countryCode: "DE",
    tier: 2,
    established: 2002,
    website: "https://www.bafin.de",
    summary: "Germany's financial regulator. EU/MiFID II compliant with strict consumer protection rules.",
    whatItMeans: "BaFin oversight means EU-grade safety with German thoroughness. Negative balance protection is mandatory.",
    protections: ["Investor compensation up to €20,000", "Segregated funds", "Negative balance protection"],
    limits: ["Max retail leverage 1:30"],
  },
  {
    slug: "mas",
    code: "MAS",
    name: "MAS",
    fullName: "Monetary Authority of Singapore",
    country: "Singapore",
    countryCode: "SG",
    tier: 2,
    established: 1971,
    website: "https://www.mas.gov.sg",
    summary: "Singapore's central bank and financial regulator. Highly respected, strict licensing, growing forex hub.",
    whatItMeans: "MAS licence indicates a serious operator with strong capital and Singapore-grade compliance.",
    protections: ["Strict capital requirements", "Strong enforcement", "Segregated funds"],
    limits: ["Limited bonus promotions", "Conservative leverage"],
  },
  {
    slug: "dfsa",
    code: "DFSA",
    name: "DFSA",
    fullName: "Dubai Financial Services Authority",
    country: "United Arab Emirates",
    countryCode: "AE",
    tier: 2,
    established: 2004,
    website: "https://www.dfsa.ae",
    summary: "Regulator of the DIFC (Dubai International Financial Centre). High standards, growing fintech and forex hub.",
    whatItMeans: "Trusted Middle East regulator. Strong on AML/KYC and capital requirements.",
    protections: ["Segregated funds", "Strict capital and AML rules"],
    limits: ["Limited number of licensed forex brokers"],
  },
  {
    slug: "fsca",
    code: "FSCA",
    name: "FSCA",
    fullName: "Financial Sector Conduct Authority (South Africa)",
    country: "South Africa",
    countryCode: "ZA",
    tier: 2,
    established: 2018,
    website: "https://www.fsca.co.za",
    summary: "South Africa's market conduct regulator. Common licence for brokers serving Africa.",
    whatItMeans: "Solid regional regulation. FSCA brokers follow conduct rules and capital adequacy standards.",
    protections: ["Conduct supervision", "Segregated funds (where mandated)"],
    limits: ["Less protective than tier-1 jurisdictions"],
  },
  {
    slug: "ifsc",
    code: "IFSC",
    name: "IFSC",
    fullName: "International Financial Services Commission (Belize)",
    country: "Belize",
    countryCode: "BZ",
    tier: 3,
    established: 1999,
    website: "https://www.ifsc.gov.bz",
    summary: "Offshore regulator. Light-touch — popular among international brokers offering high leverage and bonuses.",
    whatItMeans: "Lower protection. Funds segregation depends on the broker — research them carefully before depositing.",
    protections: ["Basic registration", "Limited enforcement"],
    limits: [
      "No deposit insurance",
      "Limited dispute resolution",
      "High leverage allowed (1:500+)",
    ],
  },
  {
    slug: "fsc-bvi",
    code: "FSC",
    name: "FSC BVI",
    fullName: "Financial Services Commission (British Virgin Islands)",
    country: "British Virgin Islands",
    countryCode: "VG",
    tier: 3,
    established: 2001,
    website: "https://www.bvifsc.vg",
    summary: "Offshore regulator. Common for international brokers — light oversight, flexible leverage.",
    whatItMeans: "Treat as offshore-grade. No client compensation scheme. Verify segregated banking partners.",
    protections: ["Basic licensing"],
    limits: ["No compensation scheme", "Limited enforcement"],
  },
  {
    slug: "fsa-svg",
    code: "FSA SVG",
    name: "SVG FSA",
    fullName: "Financial Services Authority (Saint Vincent and the Grenadines)",
    country: "Saint Vincent & the Grenadines",
    countryCode: "VC",
    tier: 3,
    established: 2012,
    website: "https://www.svgfsa.com",
    summary: "Note: SVG FSA explicitly does NOT regulate forex/CFD activity. Brokers registered here are unregulated for forex.",
    whatItMeans: "Effectively unregulated for forex purposes. Avoid for serious capital — file disputes via card chargebacks if available.",
    protections: ["None for forex/CFD trading"],
    limits: ["Unregulated for forex", "No dispute resolution"],
  },
  {
    slug: "ifmrrc",
    code: "IFMRRC",
    name: "IFMRRC",
    fullName: "International Financial Market Relations Regulation Center",
    country: "Self-regulatory (Russia-linked)",
    countryCode: "RU",
    tier: 3,
    established: 2013,
    website: "https://ifmrrc.com",
    summary: "Self-regulatory body — not a government regulator. Common with binary options and unregulated brokers.",
    whatItMeans: "Treat as no regulation. Self-regulation does not provide real protection or dispute resolution.",
    protections: ["None of substance"],
    limits: ["Not a government regulator", "No real enforcement"],
  },
];

export const regulatorBySlug = (slug: string) => regulators.find(r => r.slug === slug);
export const regulatorByCode = (code: string) =>
  regulators.find(r => r.code.toLowerCase() === code.toLowerCase());

export const tierLabel = (tier: 1 | 2 | 3) =>
  tier === 1 ? "Tier 1 — Strong" : tier === 2 ? "Tier 2 — Solid" : "Tier 3 — Offshore";
