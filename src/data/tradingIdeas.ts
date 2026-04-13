export type IdeaDirection = "bullish" | "bearish" | "neutral";
export type IdeaTimeframe = "scalp" | "intraday" | "swing" | "longterm";
export type IdeaRiskLevel = "low" | "medium" | "high";
export type ReactionType = "hot" | "agree" | "disagree" | "interesting" | "risky";
export type SubmissionCategory = "bug" | "feature" | "content";
export type SubmissionStatus = "new" | "read" | "in_progress" | "done" | "wont_do";

export interface TradingIdea {
  id: string;
  userId: string;
  username: string;
  handle: string;
  avatarUrl?: string;
  asset: string;
  direction: IdeaDirection;
  title: string;
  body: string;
  chartImageUrl?: string;
  timeframe: IdeaTimeframe;
  riskLevel: IdeaRiskLevel;
  createdAt: string;
  isPinned?: boolean;
  isFeatured?: boolean;
  reactions: Record<ReactionType, number>;
  commentCount: number;
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  parentCommentId?: string;
  body: string;
  createdAt: string;
}

export interface PrivateSubmission {
  id: string;
  userId: string;
  username: string;
  category: SubmissionCategory;
  title: string;
  body: string;
  status: SubmissionStatus;
  adminNote?: string;
  createdAt: string;
}

export const ASSETS = [
  "XAU/USD", "EUR/USD", "GBP/USD", "BTC/USD", "USD/JPY",
  "AUD/USD", "NZD/USD", "USD/CHF", "GBP/JPY", "ETH/USD",
  "US30", "NAS100", "SPX500", "WTI", "SILVER"
];

export const TIMEFRAME_LABELS: Record<IdeaTimeframe, string> = {
  scalp: "Scalp (M1–M15)",
  intraday: "Intraday (H1–H4)",
  swing: "Swing (D1)",
  longterm: "Long Term (W1+)",
};

export const RISK_LABELS: Record<IdeaRiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
};

export const REACTION_EMOJI: Record<ReactionType, { emoji: string; label: string }> = {
  hot: { emoji: "🔥", label: "Hot" },
  agree: { emoji: "👍", label: "Agree" },
  disagree: { emoji: "👎", label: "Disagree" },
  interesting: { emoji: "💡", label: "Interesting" },
  risky: { emoji: "⚠️", label: "Risky" },
};

export const sampleIdeas: TradingIdea[] = [
  {
    id: "1", userId: "u1", username: "GoldSniper", handle: "goldsniper", asset: "XAU/USD",
    direction: "bullish", title: "Gold targeting 2,400 after DXY breakdown",
    body: "Price broke below the 103.50 DXY support and Gold is showing strong bullish momentum. Entry around 2,341, targeting 2,400 with SL at 2,310. Risk:Reward 1:2. London session setup.",
    timeframe: "intraday", riskLevel: "medium", createdAt: "2025-07-10T14:30:00Z",
    isPinned: true, reactions: { hot: 24, agree: 18, disagree: 5, interesting: 8, risky: 2 }, commentCount: 7,
  },
  {
    id: "2", userId: "u2", username: "FXQueen", handle: "fxqueen", asset: "EUR/USD",
    direction: "bearish", title: "EUR/USD head & shoulders on H4 — short setup",
    body: "Classic H&S pattern completing on the H4 chart. Neckline at 1.0820 already tested twice. Waiting for a clean break and retest for entry. Target 1.0740, SL above right shoulder at 1.0880.",
    timeframe: "swing", riskLevel: "low", createdAt: "2025-07-10T12:15:00Z",
    reactions: { hot: 15, agree: 22, disagree: 3, interesting: 6, risky: 1 }, commentCount: 12,
  },
  {
    id: "3", userId: "u3", username: "CryptoKhan", handle: "cryptokhan", asset: "BTC/USD",
    direction: "bullish", title: "BTC breakout above 68K — next stop 72K",
    body: "Bitcoin cleared the 68,000 resistance with strong volume. ETF inflows remain positive. I'm looking at 72,000 as the next major target with a trailing SL strategy. This could be the start of a new leg up.",
    timeframe: "swing", riskLevel: "high", createdAt: "2025-07-10T10:00:00Z",
    isFeatured: true, reactions: { hot: 31, agree: 14, disagree: 9, interesting: 11, risky: 7 }, commentCount: 15,
  },
  {
    id: "4", userId: "u4", username: "ScalpMaster", handle: "scalpmaster", asset: "GBP/USD",
    direction: "bearish", title: "Cable rejection at 1.2850 — quick scalp",
    body: "Strong rejection at the 1.2850 resistance zone during NY session. Bearish engulfing on M15. Quick scalp targeting 20 pips down to 1.2830 with tight 10 pip SL.",
    timeframe: "scalp", riskLevel: "low", createdAt: "2025-07-09T16:45:00Z",
    reactions: { hot: 8, agree: 11, disagree: 2, interesting: 3, risky: 0 }, commentCount: 4,
  },
  {
    id: "5", userId: "u5", username: "PipHunter", handle: "piphunter", asset: "USD/JPY",
    direction: "neutral", title: "USD/JPY range-bound — wait for breakout",
    body: "Price stuck between 160.50 and 161.80 for the past week. No clear direction. BOJ intervention risk is high. I'm staying flat until we get a decisive break of this range with volume confirmation.",
    timeframe: "intraday", riskLevel: "medium", createdAt: "2025-07-09T09:30:00Z",
    reactions: { hot: 5, agree: 16, disagree: 4, interesting: 9, risky: 3 }, commentCount: 6,
  },
  {
    id: "6", userId: "u6", username: "OilTrader", handle: "oiltrader", asset: "WTI",
    direction: "bullish", title: "WTI crude bouncing off 72.00 support",
    body: "WTI is showing a strong bounce from the 72.00 demand zone. OPEC+ production cuts remain in place. Seasonal demand picking up. Looking for 76.00 target over the next 2 weeks.",
    timeframe: "swing", riskLevel: "medium", createdAt: "2025-07-08T11:00:00Z",
    reactions: { hot: 12, agree: 9, disagree: 6, interesting: 4, risky: 2 }, commentCount: 3,
  },
  {
    id: "7", userId: "u7", username: "IndexPro", handle: "indexpro", asset: "NAS100",
    direction: "bullish", title: "NAS100 — AI rally not over yet",
    body: "Tech earnings season coming up and the AI narrative is stronger than ever. NAS100 pulled back to the 20EMA on the daily — perfect buy zone. Targeting new ATH at 20,500.",
    timeframe: "longterm", riskLevel: "high", createdAt: "2025-07-08T08:20:00Z",
    reactions: { hot: 19, agree: 13, disagree: 8, interesting: 7, risky: 5 }, commentCount: 9,
  },
];

export const sampleComments: IdeaComment[] = [
  { id: "c1", ideaId: "1", userId: "u2", username: "FXQueen", body: "Great analysis! I'm in the same trade. DXY looks weak.", createdAt: "2025-07-10T15:00:00Z" },
  { id: "c2", ideaId: "1", userId: "u3", username: "CryptoKhan", body: "Be careful with NFP tomorrow though. Could reverse quickly.", createdAt: "2025-07-10T15:30:00Z" },
  { id: "c3", ideaId: "1", userId: "u4", username: "ScalpMaster", body: "I'd move SL to 2,320 for a better R:R.", createdAt: "2025-07-10T16:00:00Z" },
  { id: "c4", ideaId: "2", userId: "u1", username: "GoldSniper", body: "H&S patterns have been failing a lot recently. Be cautious.", createdAt: "2025-07-10T13:00:00Z" },
  { id: "c5", ideaId: "2", userId: "u5", username: "PipHunter", body: "Agree with this. EUR weakness is clear across the board.", createdAt: "2025-07-10T13:45:00Z" },
  { id: "c6", ideaId: "3", userId: "u1", username: "GoldSniper", body: "BTC always fakes out. Wait for weekly close above 68K.", createdAt: "2025-07-10T10:30:00Z" },
  { id: "c7", ideaId: "3", userId: "u6", username: "OilTrader", body: "ETF flows are the key metric to watch here.", createdAt: "2025-07-10T11:00:00Z", parentCommentId: "c6" },
];

export const sampleContributors = [
  { username: "GoldSniper", handle: "goldsniper", ideas: 12, totalReactions: 87 },
  { username: "CryptoKhan", handle: "cryptokhan", ideas: 9, totalReactions: 72 },
  { username: "FXQueen", handle: "fxqueen", ideas: 8, totalReactions: 64 },
  { username: "ScalpMaster", handle: "scalpmaster", ideas: 7, totalReactions: 41 },
  { username: "PipHunter", handle: "piphunter", ideas: 6, totalReactions: 38 },
];
