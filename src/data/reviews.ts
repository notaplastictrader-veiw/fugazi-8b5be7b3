export interface Review {
  name: string;
  initials: string;
  location: string;
  broker: string;
  stars: number;
  text: string;
  isComplaint: boolean;
}

export const communityReviews: Review[] = [
  {
    name: "Tyler Mather",
    initials: "TM",
    location: "London, UK",
    broker: "Exness",
    stars: 5,
    text: "Fast withdrawals, excellent spreads. Been using for 2 years without any issues. Best broker I've tried.",
    isComplaint: false,
  },
  {
    name: "Wei Wen Chin",
    initials: "WC",
    location: "Singapore",
    broker: "IC Markets",
    stars: 5,
    text: "Raw spreads are incredible for scalping. Execution speed is top-tier. Highly recommended.",
    isComplaint: false,
  },
  {
    name: "Claudio Pensa",
    initials: "CP",
    location: "Thailand",
    broker: "FTMO",
    stars: 5,
    text: "Passed the challenge on my second attempt. Payout was smooth via Deel. Legit prop firm.",
    isComplaint: false,
  },
  {
    name: "Erin Shafiqa",
    initials: "ES",
    location: "Kuala Lumpur",
    broker: "XM Global",
    stars: 4,
    text: "Good for beginners. Low deposit requirement. Spreads could be better though.",
    isComplaint: false,
  },
  {
    name: "Cian Casey",
    initials: "CC",
    location: "Adelaide, Australia",
    broker: "Pepperstone",
    stars: 5,
    text: "Switched from IC Markets. Razor account spreads are comparable. Great MT5 integration.",
    isComplaint: false,
  },
  {
    name: "Omar Shazad",
    initials: "OS",
    location: "Lahore, Pakistan",
    broker: "Quotex",
    stars: 1,
    text: "SCAM! Deposited $500, made profit to $1,200. They blocked my withdrawal and froze my account. Stay away!",
    isComplaint: true,
  },
];

export const scamAlerts = [
  {
    broker: "TradeWave Markets",
    issue: "Withdrawal refused after profit",
    amount: "$12,400",
    status: "Unresolved",
    daysAgo: 3,
  },
  {
    broker: "GoldFX Pro",
    issue: "Fake regulation, platform manipulation",
    amount: "$8,200",
    status: "Under investigation",
    daysAgo: 7,
  },
  {
    broker: "CryptoEdge BD",
    issue: "Account frozen, no response 30+ days",
    amount: "$3,800",
    status: "Unresolved",
    daysAgo: 12,
  },
];

export const scamScoreFactors = [
  { factor: "Complaint Ratio", level: "High", value: 85, color: "danger" as const },
  { factor: "Withdrawal Speed", level: "Med", value: 55, color: "accent" as const },
  { factor: "Regulation Strength", level: "High", value: 80, color: "danger" as const },
  { factor: "Proof-verified Reviews", level: "Med", value: 60, color: "accent" as const },
  { factor: "Platform Transparency", level: "Low", value: 30, color: "primary" as const },
];
