import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { BookOpen, TrendingUp, Zap, ChevronRight, CheckCircle, Lock } from "lucide-react";

interface Lesson {
  title: string;
  desc: string;
  free: boolean;
}

interface Track {
  id: string;
  label: string;
  icon: typeof BookOpen;
  color: string;
  lessons: Lesson[];
}

const tracks: Track[] = [
  {
    id: "beginner",
    label: "Beginner",
    icon: BookOpen,
    color: "text-primary",
    lessons: [
      { title: "What is Forex Trading?", desc: "How currencies are traded, who participates, and why it matters. A simple example with EUR/USD.", free: true },
      { title: "How Does a Broker Work?", desc: "The role of brokers, how they make money (spreads & commissions), and why choosing the right one matters.", free: true },
      { title: "Pips, Spreads & Leverage Explained", desc: "The three numbers every trader must understand. Real calculation examples included.", free: true },
      { title: "Reading a Candlestick Chart", desc: "Open, close, high, low — what each part means. Identify bullish and bearish patterns at a glance.", free: true },
      { title: "Risk Management Basics", desc: "The 1% rule, stop-losses, position sizing. Why risk management is more important than entry strategy.", free: true },
    ],
  },
  {
    id: "intermediate",
    label: "Intermediate",
    icon: TrendingUp,
    color: "text-accent",
    lessons: [
      { title: "Support & Resistance", desc: "How to identify key price levels where markets are likely to react. Draw them on any chart.", free: true },
      { title: "Moving Averages (SMA & EMA)", desc: "The difference between simple and exponential, when to use each, and how to spot crossover signals.", free: true },
      { title: "RSI & MACD Indicators", desc: "Two of the most popular momentum indicators. Learn to read overbought/oversold conditions.", free: true },
      { title: "Reading the Economic Calendar", desc: "Which events move markets the most? How to prepare for NFP, CPI, and central bank decisions.", free: true },
      { title: "Building a Trading Journal", desc: "Why tracking every trade is the fastest way to improve. Template and metrics included.", free: false },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: Zap,
    color: "text-coral",
    lessons: [
      { title: "ICT Concepts Simplified", desc: "Order blocks, fair value gaps, and liquidity — explained without the jargon.", free: false },
      { title: "Smart Money Concepts", desc: "How institutional traders think. Market structure, break of structure, and change of character.", free: false },
      { title: "Building a Trading Plan", desc: "A complete framework: entry rules, risk per trade, daily limits, and psychological rules.", free: true },
      { title: "How Prop Firm Challenges Work", desc: "Rules, targets, drawdown limits, and strategies to pass. Covers FTMO, MFF, and others.", free: true },
      { title: "Psychology of a Winning Trader", desc: "Fear, greed, revenge trading — how to recognize and overcome the mental traps.", free: false },
    ],
  },
];

const Education = () => {
  const [activeTrack, setActiveTrack] = useState("beginner");
  const current = tracks.find(t => t.id === activeTrack)!;

  return (
    <MainLayout>
      <section className="max-w-5xl mx-auto px-4 py-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            LEARN TRADING
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Education Hub
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simple, honest trading education. No fluff, no upsells — just what you need to trade smarter.
          </p>
        </div>

        {/* Track Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeTrack === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Lessons */}
        <div className="space-y-3">
          {current.lessons.map((lesson, i) => (
            <div key={i} className="glass-card rounded-xl p-6 flex items-start gap-4 group hover:border-primary/20 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.free ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">FREE</span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{lesson.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="glass-card rounded-2xl p-8 mt-12 text-center">
          <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Track Your Progress</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Sign up for a free account to save your progress, bookmark lessons, and get notified when new content drops.
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default Education;
