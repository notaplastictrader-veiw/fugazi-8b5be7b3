import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const eyebrowTexts = [
  "South Asia's Most Trusted Broker Review Platform",
  "Not your typical Lambo trader — we expose the fakes",
  "Built for real traders, by real traders",
];

const searchHints = ["Exness", "IC Markets", "FTMO", "Pepperstone", "XM Global", "Quotex"];

const chips = ["Exness", "IC Markets", "XM", "FTMO", "Pepperstone", "Quotex"];

const stats = [
  { value: "4.8K+", label: "Reviews" },
  { value: "280+", label: "Brokers" },
  { value: "61+", label: "Scam Alerts" },
  { value: "120K+", label: "Active Traders" },
];

const HeroSection = () => {
  const [eyebrowIndex, setEyebrowIndex] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEyebrowIndex((i) => (i + 1) % eyebrowTexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((i) => (i + 1) % searchHints.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-8 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-primary tracking-wide">
            {eyebrowTexts[eyebrowIndex]}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-6">
          Not A Plastic
          <br />
          <span className="text-primary">Trader.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Real reviews. Real complaints. Real withdrawal proof.
          <br className="hidden sm:block" />
          The platform brokers can't buy.
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative flex items-center glass-card rounded-xl overflow-hidden">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${searchHints[hintIndex]}...`}
              className="w-full bg-transparent pl-12 pr-28 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="absolute right-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {chips.map((chip) => (
            <button
              key={chip}
              className="px-3 py-1 text-xs font-mono text-muted-foreground border border-border rounded-full hover:border-primary/40 hover:text-primary transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="glass-card rounded-xl px-6 py-4 inline-flex items-center gap-0 divide-x divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 text-center">
              <div className="text-xl md:text-2xl font-bold text-foreground font-mono">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
