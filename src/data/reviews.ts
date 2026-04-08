export interface Review {
  name: string;
  initials: string;
  location: string;
  broker: string;
  stars: number;
  text: string;
  isComplaint: boolean;
  photo?: string;
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
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Wei Wen Chin",
    initials: "WC",
    location: "Singapore",
    broker: "IC Markets",
    stars: 5,
    text: "Raw spreads are incredible for scalping. Execution speed is top-tier. Highly recommended.",
    isComplaint: false,
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Claudio Pensa",
    initials: "CP",
    location: "Thailand",
    broker: "FTMO",
    stars: 5,
    text: "Passed the challenge on my second attempt. Payout was smooth via Deel. Legit prop firm.",
    isComplaint: false,
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Omar Shazad",
    initials: "OS",
    location: "Lahore, Pakistan",
    broker: "Quotex",
    stars: 1,
    text: "SCAM! Deposited $500, made profit to $1,200. They blocked my withdrawal and froze my account. Stay away!",
    isComplaint: true,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Erin Shafiqa",
    initials: "ES",
    location: "Kuala Lumpur",
    broker: "XM Global",
    stars: 4,
    text: "Good for beginners. Low deposit requirement. Spreads could be better though.",
    isComplaint: false,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Cian Casey",
    initials: "CC",
    location: "Adelaide, Australia",
    broker: "Pepperstone",
    stars: 5,
    text: "Switched from IC Markets. Razor account spreads are comparable. Great MT5 integration.",
    isComplaint: false,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Rashid Al-Fayed",
    initials: "RA",
    location: "Dubai, UAE",
    broker: "TradeWave",
    stars: 1,
    text: "Fake regulation claims. They manipulated my trades and refused $8,000 withdrawal. Reported to authorities.",
    isComplaint: true,
    photo: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Sofia Andersen",
    initials: "SA",
    location: "Copenhagen, DK",
    broker: "Exness",
    stars: 4,
    text: "Solid broker overall. Withdrawals within 24h. Customer support could be faster during weekends.",
    isComplaint: false,
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Kamal Hossain",
    initials: "KH",
    location: "Dhaka, BD",
    broker: "GoldFX Pro",
    stars: 1,
    text: "Complete scam. No real license. Lost 45,000 BDT. Their website disappeared after 2 months.",
    isComplaint: true,
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Priya Mehta",
    initials: "PM",
    location: "Mumbai, India",
    broker: "IC Markets",
    stars: 5,
    text: "Best ECN broker for Indian traders. cTrader platform is amazing. Zero issues in 3 years.",
    isComplaint: false,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
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
