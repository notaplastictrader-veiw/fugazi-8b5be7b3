export interface EducationArticle {
  id: string;
  title: string;
  slug: string;
  track: "beginner" | "intermediate" | "advanced";
  readTime: number;
  isLocked: boolean;
  courseId?: string;
  sections: { id: string; title: string; content: string }[];
  keyTakeaway: string;
}

export interface Course {
  id: string;
  title: string;
  type: "course" | "ebook" | "bundle";
  price: number;
  originalPrice?: number;
  description: string;
  includes: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  note: string;
}

export const courses: Course[] = [
  {
    id: "c1",
    title: "Forex Fundamentals Bootcamp",
    type: "course",
    price: 49,
    description: "Complete beginner to intermediate course. 12 modules, 40+ lessons, lifetime access.",
    includes: "PDF workbook, video links, quiz at end of each module",
    slug: "forex-fundamentals-bootcamp",
    isActive: true,
    isFeatured: false,
    note: "Instant access after purchase",
  },
  {
    id: "c2",
    title: "Cold Calling Scripts for Forex Brokers & Managers",
    type: "ebook",
    price: 29,
    description: "Professional cold call scripts, objection handling, client conversion techniques. Built for forex broker sales teams and introducing brokers.",
    includes: "PDF ebook, 80+ pages",
    slug: "cold-calling-scripts",
    isActive: true,
    isFeatured: false,
    note: "Instant download",
  },
  {
    id: "c3",
    title: "Smart Money Concepts (ICT) Simplified",
    type: "course",
    price: 79,
    description: "ICT methodology explained simply. Order blocks, FVGs, liquidity, market structure. 8 modules with real chart examples.",
    includes: "8 modules with real chart examples",
    slug: "smart-money-concepts",
    isActive: true,
    isFeatured: false,
    note: "Instant access",
  },
  {
    id: "c4",
    title: "The Prop Firm Playbook",
    type: "ebook",
    price: 19,
    description: "How to pass FTMO, MyFundedFX, and other prop challenges. Risk rules, strategy, common mistakes. 60 pages.",
    includes: "PDF ebook, 60 pages",
    slug: "prop-firm-playbook",
    isActive: true,
    isFeatured: false,
    note: "Instant download",
  },
  {
    id: "c5",
    title: "Risk Management Masterclass",
    type: "course",
    price: 39,
    description: "Position sizing, drawdown management, psychology of risk. The most important course any trader can take.",
    includes: "Video modules + worksheets",
    slug: "risk-management-masterclass",
    isActive: true,
    isFeatured: false,
    note: "Instant access",
  },
  {
    id: "c6",
    title: "Forex Trading Ebook Bundle",
    type: "bundle",
    price: 59,
    originalPrice: 116,
    description: "All 4 ebooks in one bundle. Fundamentals + Cold Calling + Prop Playbook + Risk Management.",
    includes: "4 complete ebooks",
    slug: "forex-ebook-bundle",
    isActive: true,
    isFeatured: true,
    note: "Best value",
  },
];

export const educationArticles: EducationArticle[] = [
  // BEGINNER
  {
    id: "b1", title: "What is Forex Trading?", slug: "what-is-forex-trading", track: "beginner", readTime: 8, isLocked: false,
    keyTakeaway: "Forex is the world's largest financial market where currencies are traded in pairs. It operates 24/5 and is accessible to retail traders through online brokers.",
    sections: [
      { id: "intro", title: "Introduction", content: "<p>The foreign exchange market — commonly known as Forex or FX — is the global marketplace for trading national currencies. With a daily trading volume exceeding $7.5 trillion, it's the largest and most liquid financial market in the world.</p><p>Unlike stock markets, Forex doesn't have a central exchange. It operates as an over-the-counter (OTC) market, meaning trades happen directly between participants through electronic networks.</p>" },
      { id: "how", title: "How Currency Pairs Work", content: "<p>Currencies are always traded in pairs. When you buy EUR/USD, you're simultaneously buying Euros and selling US Dollars. The first currency is the <strong>base currency</strong>, and the second is the <strong>quote currency</strong>.</p><p>If EUR/USD = 1.0850, it means 1 Euro costs 1.0850 US Dollars. If you believe the Euro will strengthen against the Dollar, you <strong>buy</strong> (go long). If you think it will weaken, you <strong>sell</strong> (go short).</p>" },
      { id: "participants", title: "Who Trades Forex?", content: "<p>The Forex market has diverse participants:</p><ul><li><strong>Central Banks</strong> — manage monetary policy and currency reserves</li><li><strong>Commercial Banks</strong> — facilitate transactions for clients and trade for profit</li><li><strong>Hedge Funds & Institutions</strong> — speculate on currency movements</li><li><strong>Retail Traders</strong> — individual traders like you, accessing the market through brokers</li><li><strong>Corporations</strong> — hedge foreign exchange risk from international business</li></ul>" },
      { id: "why", title: "Why Trade Forex?", content: "<p>Several features make Forex attractive:</p><ul><li><strong>24-hour market</strong> — trade during London, New York, Tokyo, or Sydney sessions</li><li><strong>High liquidity</strong> — tight spreads, fast execution</li><li><strong>Low barrier to entry</strong> — start with as little as $1 with some brokers</li><li><strong>Leverage</strong> — control large positions with small capital (use carefully)</li><li><strong>Both directions</strong> — profit from rising and falling markets</li></ul>" },
    ],
  },
  {
    id: "b2", title: "How Does a Broker Work?", slug: "how-does-a-broker-work", track: "beginner", readTime: 7, isLocked: false,
    keyTakeaway: "A broker is your gateway to the Forex market. They provide the platform, execute your trades, and make money through spreads and commissions. Choosing a regulated broker is crucial for the safety of your funds.",
    sections: [
      { id: "intro", title: "Introduction", content: "<p>A Forex broker acts as an intermediary between you (the retail trader) and the interbank market where currencies are actually traded. Without a broker, you wouldn't be able to access the Forex market.</p>" },
      { id: "role", title: "The Role of a Broker", content: "<p>Brokers provide:</p><ul><li><strong>Trading platforms</strong> — MT4, MT5, cTrader, or proprietary platforms</li><li><strong>Market access</strong> — connect you to liquidity providers</li><li><strong>Leverage</strong> — allow you to trade larger positions than your deposit</li><li><strong>Tools & analysis</strong> — charts, indicators, economic calendars</li><li><strong>Customer support</strong> — help with account issues, deposits, withdrawals</li></ul>" },
      { id: "money", title: "How Brokers Make Money", content: "<p>Brokers primarily earn through:</p><ul><li><strong>Spreads</strong> — the difference between buy and sell price. If EUR/USD buy is 1.0852 and sell is 1.0850, the 2-pip spread is the broker's fee.</li><li><strong>Commissions</strong> — some brokers charge a fixed fee per lot traded (common on ECN accounts).</li><li><strong>Swap fees</strong> — overnight holding charges based on interest rate differentials.</li></ul>" },
      { id: "choosing", title: "How to Choose the Right Broker", content: "<p>Key factors to evaluate:</p><ul><li><strong>Regulation</strong> — FCA (UK), CySEC (EU), ASIC (Australia) are top-tier regulators</li><li><strong>Trading costs</strong> — compare spreads and commissions across account types</li><li><strong>Platform quality</strong> — stability, features, mobile support</li><li><strong>Deposit & withdrawal</strong> — methods available, processing times, fees</li><li><strong>Minimum deposit</strong> — ranges from $1 to $10,000+ depending on broker and account type</li></ul>" },
    ],
  },
  {
    id: "b3", title: "Pips, Spreads & Leverage Explained", slug: "pips-spreads-leverage", track: "beginner", readTime: 10, isLocked: false,
    keyTakeaway: "Pips measure price movement, spreads are your trading cost, and leverage amplifies both profits and losses. Master these three concepts before placing your first trade.",
    sections: [
      { id: "pips", title: "What is a Pip?", content: "<p>A <strong>pip</strong> (Percentage in Point) is the smallest standard price movement in a currency pair. For most pairs, it's the fourth decimal place (0.0001).</p><p><strong>Example:</strong> If EUR/USD moves from 1.0850 to 1.0855, that's a 5-pip move. For JPY pairs, a pip is the second decimal (0.01).</p><p><strong>Pip value calculation:</strong> For a standard lot (100,000 units) of EUR/USD, 1 pip = $10. For a mini lot (10,000), 1 pip = $1. For a micro lot (1,000), 1 pip = $0.10.</p>" },
      { id: "spreads", title: "Understanding Spreads", content: "<p>The <strong>spread</strong> is the difference between the bid (sell) and ask (buy) price. It's the primary cost of trading.</p><p><strong>Example:</strong> EUR/USD bid = 1.0850, ask = 1.0852. Spread = 2 pips. On a standard lot, that's $20 cost to enter the trade.</p><p>Spreads vary by:</p><ul><li>Broker type (ECN vs Market Maker)</li><li>Market conditions (wider during news events)</li><li>Currency pair (majors have tighter spreads)</li><li>Time of day (tightest during London/NY overlap)</li></ul>" },
      { id: "leverage", title: "Leverage — Double-Edged Sword", content: "<p><strong>Leverage</strong> allows you to control a larger position with a smaller deposit (margin).</p><p><strong>Example:</strong> With 1:100 leverage, $1,000 controls a $100,000 position. If the trade moves 1% in your favor, you make $1,000 (100% return on margin). But if it moves 1% against you, you lose $1,000 (your entire margin).</p><p><strong>Common leverage levels:</strong></p><ul><li>EU/UK regulated: up to 1:30 for retail</li><li>Australia: up to 1:30 (ASIC rules)</li><li>Offshore brokers: up to 1:500 or even 1:unlimited</li></ul><p class='text-coral font-medium'>⚠ Higher leverage = higher risk. Most professionals use 1:10 to 1:50.</p>" },
    ],
  },
  {
    id: "b4", title: "Reading a Candlestick Chart", slug: "reading-candlestick-chart", track: "beginner", readTime: 9, isLocked: false,
    keyTakeaway: "Candlestick charts show open, high, low, and close prices. Learning to read them is the foundation of all technical analysis. Start by identifying bullish (green) and bearish (red) candles.",
    sections: [
      { id: "anatomy", title: "Anatomy of a Candlestick", content: "<p>Each candlestick represents price action over a specific time period. It has four components:</p><ul><li><strong>Open</strong> — the price at the start of the period</li><li><strong>Close</strong> — the price at the end of the period</li><li><strong>High</strong> — the highest price reached during the period</li><li><strong>Low</strong> — the lowest price reached during the period</li></ul><p>The thick part is called the <strong>body</strong>. The thin lines above and below are called <strong>wicks</strong> (or shadows).</p>" },
      { id: "colors", title: "Bullish vs Bearish", content: "<p><strong>Bullish (green/white):</strong> Close is higher than Open. Price went up during this period. The body shows the range between open (bottom) and close (top).</p><p><strong>Bearish (red/black):</strong> Close is lower than Open. Price went down. The body shows open (top) to close (bottom).</p>" },
      { id: "patterns", title: "Basic Patterns to Know", content: "<p>Start with these essential patterns:</p><ul><li><strong>Doji</strong> — tiny body, long wicks. Shows indecision. Potential reversal signal.</li><li><strong>Hammer</strong> — small body at top, long lower wick. Bullish reversal at support.</li><li><strong>Engulfing</strong> — second candle completely engulfs the first. Strong reversal signal.</li><li><strong>Pin Bar</strong> — long wick on one side, small body. Shows rejection of a price level.</li></ul>" },
    ],
  },
  {
    id: "b5", title: "Risk Management Basics", slug: "risk-management-basics", track: "beginner", readTime: 11, isLocked: false,
    keyTakeaway: "Never risk more than 1-2% of your account on a single trade. Use stop-losses on every trade. Risk management isn't optional — it's the difference between survival and blowing your account.",
    sections: [
      { id: "why", title: "Why Risk Management Matters Most", content: "<p>You can have the best strategy in the world, but without proper risk management, you will eventually blow your account. Period.</p><p>Professional traders focus on <strong>protecting capital first</strong> and making money second. The goal isn't to win every trade — it's to ensure losses are small and manageable while letting winners run.</p>" },
      { id: "one-percent", title: "The 1% Rule", content: "<p>Never risk more than 1-2% of your total account balance on a single trade.</p><p><strong>Example:</strong> Account balance = $10,000. Maximum risk per trade at 1% = $100. If your stop-loss is 50 pips, your position size should be calculated so that 50 pips = $100 loss.</p><p>This means even with 10 consecutive losses (very unlikely with a decent strategy), you'd only lose 10% of your account — recoverable.</p>" },
      { id: "stoploss", title: "Stop-Loss Orders", content: "<p>A <strong>stop-loss</strong> is an order that automatically closes your trade at a predetermined price to limit losses.</p><ul><li>Always set a stop-loss before entering a trade</li><li>Place it at a logical level (below support for buys, above resistance for sells)</li><li>Never move your stop-loss further away from entry to \"give it room\"</li><li>Consider using a trailing stop to lock in profits</li></ul>" },
      { id: "sizing", title: "Position Sizing", content: "<p>Position sizing determines how many lots/units to trade based on your risk tolerance and stop-loss distance.</p><p><strong>Formula:</strong> Position Size = (Account Risk $) ÷ (Stop-Loss in Pips × Pip Value)</p><p><strong>Example:</strong> $10,000 account, 1% risk ($100), 25-pip stop-loss, pip value $10/lot → Position = $100 ÷ ($10 × 25) = 0.4 lots</p>" },
    ],
  },
  // INTERMEDIATE
  {
    id: "i1", title: "Support & Resistance", slug: "support-and-resistance", track: "intermediate", readTime: 10, isLocked: false,
    keyTakeaway: "Support is where price tends to stop falling; resistance is where it tends to stop rising. These levels are the backbone of technical analysis and form the basis of most trading strategies.",
    sections: [
      { id: "intro", title: "What Are Support & Resistance?", content: "<p><strong>Support</strong> is a price level where buying pressure is strong enough to prevent further decline. Think of it as a floor.</p><p><strong>Resistance</strong> is a price level where selling pressure is strong enough to prevent further advance. Think of it as a ceiling.</p><p>These levels form because traders remember prices. If EUR/USD bounced from 1.0800 three times, traders expect it to bounce again — creating a self-fulfilling prophecy.</p>" },
      { id: "identify", title: "How to Identify Key Levels", content: "<p>Look for:</p><ul><li><strong>Multiple touches</strong> — the more times a level is tested, the stronger it is</li><li><strong>Round numbers</strong> — psychological levels like 1.1000, 1.0500</li><li><strong>Previous highs/lows</strong> — swing points on higher timeframes</li><li><strong>High volume areas</strong> — where significant trading activity occurred</li></ul><p><strong>Pro tip:</strong> Think of S&R as zones, not exact lines. A 10-20 pip zone is more realistic than a single price.</p>" },
      { id: "trading", title: "Trading with S&R", content: "<p><strong>Bounce trades:</strong> Buy at support, sell at resistance. Place stop-loss beyond the zone.</p><p><strong>Breakout trades:</strong> When price breaks through a level with strong momentum, trade in the direction of the break. Wait for a retest of the broken level for confirmation.</p><p><strong>Role reversal:</strong> When support breaks, it becomes resistance (and vice versa). This is one of the most reliable patterns in technical analysis.</p>" },
    ],
  },
  {
    id: "i2", title: "Moving Averages (SMA & EMA)", slug: "moving-averages", track: "intermediate", readTime: 9, isLocked: false,
    keyTakeaway: "Moving averages smooth out price data to show trend direction. The 50 and 200 EMAs are the most widely watched. Golden crosses (50 above 200) signal bullish trends; death crosses signal bearish.",
    sections: [
      { id: "types", title: "SMA vs EMA", content: "<p><strong>Simple Moving Average (SMA)</strong> calculates the average closing price over a set number of periods. Equal weight to all prices.</p><p><strong>Exponential Moving Average (EMA)</strong> gives more weight to recent prices, making it more responsive to current market conditions.</p><p>Most traders prefer EMAs for shorter timeframes and SMAs for longer-term analysis.</p>" },
      { id: "key", title: "Key Moving Averages", content: "<p>The most commonly used periods:</p><ul><li><strong>20 EMA</strong> — short-term trend, used by scalpers and day traders</li><li><strong>50 EMA</strong> — medium-term trend, widely watched institutional level</li><li><strong>200 SMA/EMA</strong> — long-term trend, the most important MA in all of trading</li></ul><p>Price above the 200 MA = bullish bias. Price below = bearish bias. It's that simple as a starting filter.</p>" },
      { id: "crossovers", title: "Crossover Signals", content: "<p><strong>Golden Cross:</strong> 50 MA crosses above 200 MA → bullish signal. Historically reliable on daily charts.</p><p><strong>Death Cross:</strong> 50 MA crosses below 200 MA → bearish signal.</p><p>These signals work best on higher timeframes (4H, Daily). On lower timeframes, they generate too many false signals.</p>" },
    ],
  },
  {
    id: "i3", title: "RSI & MACD Indicators", slug: "rsi-macd-indicators", track: "intermediate", readTime: 10, isLocked: false,
    keyTakeaway: "RSI measures momentum (overbought above 70, oversold below 30). MACD shows trend direction and momentum through moving average convergence/divergence. Use them together for stronger signals.",
    sections: [
      { id: "rsi", title: "RSI — Relative Strength Index", content: "<p>RSI oscillates between 0 and 100, measuring the speed and magnitude of price changes.</p><ul><li><strong>Above 70</strong> — overbought (potential sell signal)</li><li><strong>Below 30</strong> — oversold (potential buy signal)</li><li><strong>50 level</strong> — acts as dynamic support/resistance for the indicator</li></ul><p><strong>Divergence:</strong> If price makes a higher high but RSI makes a lower high, that's bearish divergence — a powerful reversal signal.</p>" },
      { id: "macd", title: "MACD — Moving Average Convergence Divergence", content: "<p>MACD consists of three components:</p><ul><li><strong>MACD line</strong> — difference between 12 and 26 EMAs</li><li><strong>Signal line</strong> — 9-period EMA of the MACD line</li><li><strong>Histogram</strong> — visual difference between MACD and signal line</li></ul><p><strong>Buy signal:</strong> MACD crosses above signal line. <strong>Sell signal:</strong> MACD crosses below signal line.</p>" },
      { id: "combining", title: "Combining RSI & MACD", content: "<p>Use both together for confirmation:</p><ul><li>RSI oversold + MACD bullish crossover = strong buy signal</li><li>RSI overbought + MACD bearish crossover = strong sell signal</li><li>Both showing divergence from price = high-probability reversal setup</li></ul><p><strong>Important:</strong> No indicator works 100% of the time. Always use with price action and proper risk management.</p>" },
    ],
  },
  {
    id: "i4", title: "Reading the Economic Calendar", slug: "reading-economic-calendar", track: "intermediate", readTime: 8, isLocked: false,
    keyTakeaway: "High-impact events like NFP, CPI, and central bank decisions cause the largest market moves. Learn to read the calendar and either trade the volatility or avoid it — both are valid strategies.",
    sections: [
      { id: "what", title: "What is the Economic Calendar?", content: "<p>The economic calendar lists scheduled economic data releases and events that can move financial markets. Each event is rated by impact:</p><ul><li>🔴 <strong>High impact</strong> — expect large price movements (NFP, CPI, interest rate decisions)</li><li>🟡 <strong>Medium impact</strong> — moderate volatility (retail sales, PMI)</li><li>🟢 <strong>Low impact</strong> — minimal effect on prices</li></ul>" },
      { id: "events", title: "Key Events That Move Markets", content: "<p><strong>Non-Farm Payrolls (NFP)</strong> — US employment data, released first Friday of each month. Often causes 50-100+ pip moves in USD pairs.</p><p><strong>CPI (Consumer Price Index)</strong> — measures inflation. Higher than expected = bullish for currency (central bank may raise rates).</p><p><strong>Central Bank Decisions</strong> — Fed, ECB, BoE rate decisions are the most impactful events. Not just the decision, but the statement and press conference that follow.</p><p><strong>GDP data</strong> — measures economic growth. Strong GDP = strong currency.</p>" },
      { id: "strategy", title: "How to Trade Around News", content: "<p><strong>Strategy 1 — Avoid:</strong> Close positions before high-impact events. Spreads widen, slippage increases. Many profitable traders simply don't trade during news.</p><p><strong>Strategy 2 — Trade the reaction:</strong> Wait for the initial spike to settle (5-15 minutes after release), then trade the follow-through direction.</p><p><strong>Strategy 3 — Straddle:</strong> Place pending orders on both sides before the event. Cancel the unfilled order after one triggers. Risky but can be profitable.</p>" },
    ],
  },
  {
    id: "i5", title: "Building a Trading Journal", slug: "building-trading-journal", track: "intermediate", readTime: 7, isLocked: true, courseId: "c1",
    keyTakeaway: "A trading journal is the fastest way to improve. Track every trade, review weekly, and identify patterns in your behavior. The data doesn't lie — let it guide your evolution as a trader.",
    sections: [
      { id: "why", title: "Why Journal Every Trade?", content: "<p>The best traders treat trading like a business. And every business tracks its data. A trading journal reveals patterns you can't see in real-time:</p><ul><li>Which setups actually make you money vs. which ones you <em>think</em> make you money</li><li>What time of day you perform best</li><li>Emotional patterns that lead to losses</li><li>Your actual win rate and risk:reward ratio</li></ul>" },
      { id: "what", title: "What to Record", content: "<p>For every trade, log:</p><ul><li><strong>Date & time</strong> of entry and exit</li><li><strong>Pair/asset</strong> traded</li><li><strong>Direction</strong> — long or short</li><li><strong>Entry, SL, TP</strong> — planned and actual</li><li><strong>Lot size</strong> and risk %</li><li><strong>Result</strong> — profit/loss in pips and $</li><li><strong>Screenshot</strong> of the chart at entry</li><li><strong>Reason for entry</strong> — what was the setup?</li><li><strong>Emotional state</strong> — were you calm, anxious, revenge trading?</li></ul>" },
      { id: "review", title: "Weekly Review Process", content: "<p>Every weekend, review your journal:</p><ul><li>Calculate win rate, average R:R, total P&L</li><li>Identify your best 2-3 setups by profitability</li><li>Identify losing patterns (time of day, emotional state, overtrading)</li><li>Set 1-2 specific goals for next week</li><li>Grade yourself A-F on discipline</li></ul>" },
    ],
  },
  // ADVANCED
  {
    id: "a1", title: "ICT Concepts Simplified", slug: "ict-concepts-simplified", track: "advanced", readTime: 14, isLocked: true, courseId: "c3",
    keyTakeaway: "ICT methodology focuses on how institutional traders move markets. Order blocks, fair value gaps, and liquidity sweeps are the core concepts. Master them to align with smart money flow.",
    sections: [
      { id: "overview", title: "What is ICT?", content: "<p>ICT (Inner Circle Trader) methodology is a trading approach that focuses on understanding how large institutions and market makers move prices. Instead of following retail indicators, you learn to read the market's \"footprint.\"</p>" },
      { id: "ob", title: "Order Blocks", content: "<p>An <strong>order block</strong> is the last opposing candle before a strong impulsive move. It marks where institutions placed large orders.</p><p>Bullish OB: Last bearish candle before a strong move up. Bearish OB: Last bullish candle before a strong move down. Price often returns to these levels — they act as high-probability entry zones.</p>" },
      { id: "fvg", title: "Fair Value Gaps (FVG)", content: "<p>A <strong>fair value gap</strong> is a three-candle pattern where the wicks of candle 1 and candle 3 don't overlap, creating an imbalance. Price tends to return to fill these gaps. They represent areas where one side (buyers or sellers) dominated completely.</p>" },
      { id: "liquidity", title: "Liquidity Sweeps", content: "<p><strong>Liquidity</strong> sits above swing highs and below swing lows — that's where stop-losses cluster. Smart money sweeps these levels to fill their orders before reversing. If you see price take out a high/low and immediately reverse, that's a liquidity sweep.</p>" },
    ],
  },
  {
    id: "a2", title: "Smart Money Concepts", slug: "smart-money-concepts", track: "advanced", readTime: 12, isLocked: true, courseId: "c3",
    keyTakeaway: "Smart Money Concepts teach you to trade alongside institutions, not against them. Market structure, BOS, and CHOCH are the building blocks of understanding where price is heading next.",
    sections: [
      { id: "structure", title: "Market Structure", content: "<p>Market structure is the foundation of smart money analysis. It's simply the pattern of higher highs and higher lows (uptrend) or lower highs and lower lows (downtrend).</p><p>Understanding structure tells you the current trend and when it might be changing. Always trade with structure, not against it.</p>" },
      { id: "bos", title: "Break of Structure (BOS)", content: "<p>A <strong>BOS</strong> occurs when price breaks a previous swing high (in an uptrend) or swing low (in a downtrend), confirming trend continuation.</p><p>BOS is a confirmation signal — the trend is intact and likely to continue. Look for entries on pullbacks after a BOS.</p>" },
      { id: "choch", title: "Change of Character (CHOCH)", content: "<p>A <strong>CHOCH</strong> is the first sign of a potential trend reversal. In an uptrend, it's when price breaks below the most recent higher low. In a downtrend, it's when price breaks above the most recent lower high.</p><p>CHOCH signals that the current trend may be ending. Wait for additional confirmation before trading the new direction.</p>" },
    ],
  },
  {
    id: "a3", title: "Building a Trading Plan", slug: "building-a-trading-plan", track: "advanced", readTime: 13, isLocked: false,
    keyTakeaway: "A trading plan is your rulebook. It removes emotion from decision-making and gives you a framework to be consistently profitable. Trade the plan, not your feelings.",
    sections: [
      { id: "components", title: "Components of a Trading Plan", content: "<p>A complete trading plan includes:</p><ul><li><strong>Strategy rules</strong> — exact entry/exit criteria</li><li><strong>Risk parameters</strong> — max risk per trade, per day, per week</li><li><strong>Trading hours</strong> — which sessions you trade</li><li><strong>Pairs/assets</strong> — what you focus on</li><li><strong>Daily routine</strong> — pre-market analysis, journaling</li><li><strong>Rules for stopping</strong> — when to step away (daily loss limit, consecutive losses)</li></ul>" },
      { id: "rules", title: "Setting Your Rules", content: "<p><strong>Entry rules example:</strong></p><ul><li>Only trade during London or NY session</li><li>Require daily trend alignment (price above 200 EMA)</li><li>Wait for pullback to 50 EMA on H1</li><li>Confirmation candle at key level (pin bar, engulfing)</li><li>Risk:Reward minimum 1:2</li></ul><p><strong>Exit rules:</strong></p><ul><li>Stop-loss: below swing low (buys) / above swing high (sells)</li><li>Take-profit: next significant S&R level</li><li>Move to breakeven after 1R of profit</li></ul>" },
      { id: "psychology", title: "Psychological Rules", content: "<p>The most important part of your plan:</p><ul><li>Maximum 3 trades per day</li><li>Stop trading after 2 consecutive losses</li><li>No trading if emotionally upset, tired, or distracted</li><li>No revenge trading — ever</li><li>Weekly P&L review, not daily (daily creates emotional swings)</li><li>Celebrate discipline, not profits</li></ul>" },
    ],
  },
  {
    id: "a4", title: "How Prop Firm Challenges Work", slug: "prop-firm-challenges", track: "advanced", readTime: 11, isLocked: false,
    keyTakeaway: "Prop firms let you trade their capital for a profit share. Pass their challenge by meeting profit targets while staying within drawdown limits. Risk management is more important than aggressive profits.",
    sections: [
      { id: "what", title: "What Are Prop Firms?", content: "<p>Proprietary trading firms (prop firms) provide traders with funded accounts in exchange for a share of the profits (usually 70-90% to the trader).</p><p>To get funded, you must pass a challenge — a simulated trading evaluation where you prove your skills by hitting profit targets while following strict risk rules.</p>" },
      { id: "rules", title: "Typical Challenge Rules", content: "<p>Most prop firms have similar rules:</p><ul><li><strong>Profit target:</strong> Phase 1 = 8-10%, Phase 2 = 5%</li><li><strong>Daily drawdown:</strong> 4-5% max loss in a single day</li><li><strong>Overall drawdown:</strong> 8-12% max total loss</li><li><strong>Minimum trading days:</strong> 4-10 days</li><li><strong>No time limit</strong> (most firms have removed this)</li><li><strong>Weekend holding:</strong> some allow, some don't</li></ul>" },
      { id: "strategy", title: "How to Pass", content: "<p>Key strategies for passing challenges:</p><ul><li>Risk 0.5-1% per trade maximum (not the full 2% you might use on personal accounts)</li><li>Focus on high-probability setups only — quality over quantity</li><li>Don't try to hit the target in the first few days. Spread it over 2-3 weeks.</li><li>Use a consistent strategy you've already backtested</li><li>Take partial profits — secure gains and reduce drawdown risk</li><li>If you're up 5% and need 8%, don't rush. Small, steady gains.</li></ul>" },
    ],
  },
  {
    id: "a5", title: "Psychology of a Winning Trader", slug: "psychology-winning-trader", track: "advanced", readTime: 10, isLocked: true, courseId: "c5",
    keyTakeaway: "Trading psychology is what separates profitable traders from everyone else. Master your emotions, build discipline, and accept that losses are part of the game.",
    sections: [
      { id: "mindset", title: "The Professional Mindset", content: "<p>Professional traders think in probabilities, not certainties. They know:</p><ul><li>Any single trade can lose — and that's okay</li><li>Their edge plays out over 100+ trades, not 10</li><li>Process matters more than outcome</li><li>Patience is a competitive advantage</li></ul>" },
      { id: "emotions", title: "Common Emotional Traps", content: "<p><strong>Fear:</strong> Not taking valid setups because you're afraid of losing. Solution: reduce position size until you're comfortable.</p><p><strong>Greed:</strong> Moving take-profit further, adding to winners recklessly. Solution: follow the plan, take what the market gives.</p><p><strong>Revenge trading:</strong> Taking impulsive trades after a loss to \"make it back.\" Solution: daily loss limit + mandatory break after 2 losses.</p><p><strong>FOMO:</strong> Chasing trades you missed. Solution: there's always another setup. Missing a trade costs $0. Chasing a bad entry costs money.</p>" },
      { id: "habits", title: "Building Winning Habits", content: "<p>Daily habits of consistently profitable traders:</p><ul><li>Pre-market analysis routine (30 min before session open)</li><li>Define bias and key levels before looking at lower timeframes</li><li>Set alerts instead of staring at charts</li><li>Journal every trade immediately after closing</li><li>Physical exercise — clear mind = better decisions</li><li>Weekly review and monthly performance analysis</li></ul>" },
    ],
  },
];

export const getArticleBySlug = (slug: string) => educationArticles.find(a => a.slug === slug);
export const getNextArticle = (currentSlug: string) => {
  const idx = educationArticles.findIndex(a => a.slug === currentSlug);
  if (idx === -1 || idx === educationArticles.length - 1) return null;
  // Find next in same track first
  const current = educationArticles[idx];
  const sameTrack = educationArticles.filter(a => a.track === current.track);
  const trackIdx = sameTrack.findIndex(a => a.slug === currentSlug);
  if (trackIdx < sameTrack.length - 1) return sameTrack[trackIdx + 1];
  return null;
};
