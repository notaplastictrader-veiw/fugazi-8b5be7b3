export interface BettingSite {
  id: string;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  bonus: string;
  sports: string[];
  features: string[];
  min_deposit: string;
  withdrawal_speed: string;
  license: string;
  url: string;
  warning?: string;
}

export const bettingSites: BettingSite[] = [
  {
    id: "1",
    name: "Bet365",
    slug: "bet365",
    logo: "🟢",
    rating: 9.2,
    bonus: "Up to $30 in Bet Credits",
    sports: ["football", "cricket", "basketball", "tennis", "mma"],
    features: ["Live Streaming", "Cash Out", "Bet Builder", "In-Play Betting"],
    min_deposit: "$10",
    withdrawal_speed: "1-3 days",
    license: "UK Gambling Commission",
    url: "#",
  },
  {
    id: "2",
    name: "1xBet",
    slug: "1xbet",
    logo: "🔵",
    rating: 7.8,
    bonus: "100% up to $130",
    sports: ["football", "cricket", "basketball", "tennis", "esports"],
    features: ["Live Streaming", "Telegram Bot", "Crypto Payments", "Wide Markets"],
    min_deposit: "$1",
    withdrawal_speed: "Instant - 24h",
    license: "Curaçao eGaming",
    url: "#",
    warning: "Restricted in some countries. Verify local regulations.",
  },
  {
    id: "3",
    name: "Betway",
    slug: "betway",
    logo: "⚫",
    rating: 8.5,
    bonus: "Up to $250 Free Bet",
    sports: ["football", "cricket", "basketball", "tennis"],
    features: ["Betway Boost", "Cash Out", "Mobile App", "IPL Specials"],
    min_deposit: "$10",
    withdrawal_speed: "24-48h",
    license: "Malta Gaming Authority",
    url: "#",
  },
  {
    id: "4",
    name: "Stake",
    slug: "stake",
    logo: "🟡",
    rating: 8.8,
    bonus: "200% Welcome Bonus",
    sports: ["football", "basketball", "mma", "esports", "cricket"],
    features: ["Crypto Native", "Provably Fair", "Fast Payouts", "VIP Program"],
    min_deposit: "$0 (crypto)",
    withdrawal_speed: "Instant",
    license: "Curaçao eGaming",
    url: "#",
    warning: "Crypto-only platform. Not regulated in all jurisdictions.",
  },
  {
    id: "5",
    name: "10Cric",
    slug: "10cric",
    logo: "🟠",
    rating: 8.0,
    bonus: "150% up to ₹30,000",
    sports: ["cricket", "football", "basketball", "kabaddi"],
    features: ["IPL Focus", "UPI/Paytm", "Hindi Support", "Cricket Specials"],
    min_deposit: "₹500",
    withdrawal_speed: "24-72h",
    license: "Curaçao eGaming",
    url: "#",
  },
  {
    id: "6",
    name: "22Bet",
    slug: "22bet",
    logo: "🔴",
    rating: 7.5,
    bonus: "100% up to $122",
    sports: ["football", "cricket", "tennis", "basketball", "esports"],
    features: ["Wide Markets", "Mobile App", "Crypto Accepted", "Live Betting"],
    min_deposit: "$1",
    withdrawal_speed: "24-48h",
    license: "Curaçao eGaming",
    url: "#",
    warning: "Limited customer support options.",
  },
];
