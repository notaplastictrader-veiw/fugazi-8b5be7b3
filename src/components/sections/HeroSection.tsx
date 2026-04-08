import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const eyebrowItems = [
  { text: "Built for real traders, not ", highlight: "plastic ones", color: "bg-primary/20 text-primary" },
  { text: "South Asia's most ", highlight: "trusted", color: "bg-accent/20 text-accent" },
  { text: "Where scams get ", highlight: "exposed", color: "bg-destructive/20 text-destructive" },
  { text: "Real proof. Real complaints. Real ", highlight: "data", color: "bg-teal/20 text-teal" },
  { text: "The platform brokers fear and traders ", highlight: "love", color: "bg-purple/20 text-purple" },
];

const searchHints = ["Search brokers...", "Search prop firms...", "Search sports tips...", "Search signal groups...", "Search betting sites..."];

const chips = ["Exness", "IC Markets", "FTMO", "Pepperstone", "XM Global", "Quotex"];

const stats = [
  { value: "4.8K+", label: "Verified reviews" },
  { value: "280+", label: "Brokers listed" },
  { value: "61+", label: "Scam alerts issued" },
  { value: "120K+", label: "Active traders" },
];

const HeroSection = () => {
  const [eyebrowIndex, setEyebrowIndex] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setEyebrowIndex((i) => (i + 1) % eyebrowItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setHintIndex((i) => (i + 1) % searchHints.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isFocused]);

  const eyebrow = eyebrowItems[eyebrowIndex];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-4 text-center">
        {/* Rotating Eyebrow */}
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-10">
          <span className="text-xs text-muted-foreground">
            {eyebrow.text}
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ml-1 ${eyebrow.color}`}>
              {eyebrow.highlight}
            </span>
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black tracking-[-4px] leading-[0.95] text-foreground mb-6" style={{ fontSize: "clamp(64px, 9vw, 120px)" }}>
          Not A Plastic
          <br />
          <span className="text-primary">Trader.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[17px] font-light text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Real reviews. Real complaints. Real withdrawal proof.
          <br className="hidden sm:block" />
          We verify everything so you never lose money to a fake broker again.
        </p>

        {/* Search bar */}
        <div className="max-w-[640px] mx-auto mb-5">
          <div className="relative flex items-center glass-card rounded-[14px] overflow-hidden focus-within:border-primary/40 transition-colors">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={isFocused ? "" : searchHints[hintIndex]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent pl-12 pr-36 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="absolute right-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-display font-bold tracking-wider rounded-[9px] hover:opacity-90 transition-opacity uppercase">
              Search
            </button>
          </div>
        </div>

        {/* Quick-search chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {chips.map((chip) => (
            <button
              key={chip}
              className="px-3 py-1 text-xs text-muted-foreground border border-border rounded-full hover:border-primary/40 hover:text-primary transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="glass-card rounded-xl px-2 py-4 inline-flex items-center gap-0 divide-x divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="px-5 md:px-8 text-center">
              <div className="text-xl md:text-2xl font-display font-extrabold text-foreground">{stat.value}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
