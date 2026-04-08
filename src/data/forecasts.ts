export interface Forecast {
  pair: string;
  direction: 'bullish' | 'bearish';
  potential: 'HIGH' | 'MED' | 'LOW';
  reasoning: string;
  updated: string;
  category: 'forex' | 'gold' | 'crypto' | 'sports';
}

export const forecasts: Forecast[] = [
  {
    pair: "XAU/USD",
    direction: "bullish",
    potential: "HIGH",
    reasoning: "Gold breaking above key resistance at $2,340. Fed rate cut expectations fueling momentum. Target $2,400.",
    updated: "2 hours ago",
    category: "forex",
  },
  {
    pair: "EUR/USD",
    direction: "bearish",
    potential: "MED",
    reasoning: "ECB dovish stance vs. USD strength. Expecting pullback to 1.0780 support zone.",
    updated: "4 hours ago",
    category: "forex",
  },
  {
    pair: "GBP/USD",
    direction: "bullish",
    potential: "HIGH",
    reasoning: "Strong UK employment data. Cable targeting 1.2750 resistance with bullish momentum.",
    updated: "6 hours ago",
    category: "forex",
  },
  {
    pair: "Gold Spot",
    direction: "bullish",
    potential: "HIGH",
    reasoning: "Central bank buying continues. Geopolitical tensions supporting safe-haven demand.",
    updated: "1 hour ago",
    category: "gold",
  },
  {
    pair: "BTC/USD",
    direction: "bullish",
    potential: "HIGH",
    reasoning: "Post-halving accumulation phase. Institutional inflows via ETFs at record levels. Target $75K.",
    updated: "3 hours ago",
    category: "crypto",
  },
];
