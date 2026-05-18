export interface Broker {
  name: string;
  slug: string;
  type: 'forex' | 'crypto' | 'prop' | 'binary';
  tags: string[];
  regulation: string[];
  score: number;
  avgSpread: string;
  leverage: string;
  minDeposit: string;
  stars: number;
  reviewCount: number;
  complaints: number;
  badge: 'verified' | 'featured' | 'warning' | 'none';
  logo?: string;
}

export const brokers: Broker[] = [
  {
    name: "Exness",
    slug: "exness",
    type: "forex",
    tags: ["forex", "ecn", "low-spread"],
    regulation: ["FCA", "CySEC"],
    score: 9.2,
    avgSpread: "0.1 pips",
    leverage: "Unlimited",
    minDeposit: "$1",
    stars: 4.5,
    reviewCount: 1247,
    complaints: 12,
    badge: "verified",
  },
  {
    name: "IC Markets",
    slug: "ic-markets",
    type: "forex",
    tags: ["forex", "ecn", "low-spread"],
    regulation: ["ASIC", "CySEC"],
    score: 9.0,
    avgSpread: "0.02 pips",
    leverage: "1:500",
    minDeposit: "$200",
    stars: 4.5,
    reviewCount: 892,
    complaints: 8,
    badge: "verified",
  },
  {
    name: "XM Global",
    slug: "xm-global",
    type: "forex",
    tags: ["forex", "bd-friendly"],
    regulation: ["ASIC", "IFSC"],
    score: 7.8,
    avgSpread: "1.6 pips",
    leverage: "1:1000",
    minDeposit: "$5",
    stars: 3.8,
    reviewCount: 634,
    complaints: 45,
    badge: "featured",
  },
  {
    name: "Quotex",
    slug: "quotex",
    type: "binary",
    tags: ["binary", "crypto", "scam-watch"],
    regulation: ["IFMRRC"],
    score: 4.2,
    avgSpread: "N/A",
    leverage: "N/A",
    minDeposit: "$10",
    stars: 2.1,
    reviewCount: 312,
    complaints: 89,
    badge: "warning",
  },
  {
    name: "Pepperstone",
    slug: "pepperstone",
    type: "forex",
    tags: ["forex", "ecn", "low-spread"],
    regulation: ["ASIC", "FCA"],
    score: 9.1,
    avgSpread: "0.09 pips",
    leverage: "1:500",
    minDeposit: "$200",
    stars: 4.6,
    reviewCount: 756,
    complaints: 5,
    badge: "verified",
  },
  {
    name: "FTMO",
    slug: "ftmo",
    type: "prop",
    tags: ["prop"],
    regulation: ["Czech NB"],
    score: 8.8,
    avgSpread: "N/A",
    leverage: "1:100",
    minDeposit: "$10K–$200K",
    stars: 4.4,
    reviewCount: 523,
    complaints: 15,
    badge: "verified",
  },
];

export const tickerPairs = [
  { pair: "XAU/USD", price: "2,341.50", change: "+0.82%", up: true },
  { pair: "EUR/USD", price: "1.0847", change: "-0.12%", up: false },
  { pair: "GBP/USD", price: "1.2634", change: "+0.25%", up: true },
  { pair: "USD/JPY", price: "157.42", change: "+0.45%", up: true },
  { pair: "AUD/USD", price: "0.6587", change: "+0.18%", up: true },
  { pair: "USD/CAD", price: "1.3642", change: "-0.09%", up: false },
  { pair: "BTC/USD", price: "67,842", change: "+2.14%", up: true },
  { pair: "ETH/USD", price: "3,521", change: "+1.82%", up: true },
];

export const promoItems = [
  "🔥 Exness 100% Deposit Bonus",
  "🚀 FTMO 20% Off Challenge",
  "💰 Bullwaves — Start with $10",
  "⚡ IC Markets Raw Spread 0.0",
  "🏆 Maven Trading 90% Profit Split",
  "🎁 XM $30 No-Deposit Bonus",
];
