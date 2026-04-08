import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const eyebrowItems = [
  { text: "Built for real traders, not ", highlight: "plastic ones", suffix: "", color: "hsl(var(--primary))" },
  { text: "South Asia's ", highlight: "most trusted", suffix: " broker platform", color: "hsl(var(--accent))" },
  { text: "Where ", highlight: "scams get exposed", suffix: " every single day", color: "hsl(var(--destructive))" },
  { text: "", highlight: "Real proof", suffix: ". Real complaints. Real data.", color: "hsl(var(--teal))" },
  { text: "The platform ", highlight: "brokers fear", suffix: " and traders love", color: "hsl(var(--purple))" },
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
  const [searchValue, setSearchValue] = useState("");
  const [eyebrowAnim, setEyebrowAnim] = useState<"in" | "out">("in");

  useEffect(() => {
    const interval = setInterval(() => {
      setEyebrowAnim("out");
      setTimeout(() => {
        setEyebrowIndex((i) => (i + 1) % eyebrowItems.length);
        setEyebrowAnim("in");
      }, 300);
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

  const handleChipClick = (chip: string) => {
    setSearchValue(chip);
    setIsFocused(true);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-4 text-center">
        {/* Rotating Eyebrow with slide animation */}
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-10 overflow-hidden h-[36px]">
          <span
            className={`flex items-center gap-1 text-xs text-muted-foreground transition-all duration-300 ${
              eyebrowAnim === "in"
                ? "translate-y-0 opacity-100"
                : "translate-y-[-100%] opacity-0"
            }`}
          >
            <span
              className="inline-block w-[6px] h-[6px] rounded-full mr-1.5 pulse-dot"
              style={{ backgroundColor: eyebrow.color }}
            />
            {eyebrow.text}
            <span
              className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{
                background: `${eyebrow.color}20`,
                color: eyebrow.color,
                textShadow: `0 0 8px ${eyebrow.color}40`,
              }}
            >
              {eyebrow.highlight}
            </span>
            {eyebrow.suffix}
          </span>
        </div>

        {/* Title — staggered fade-up */}
        <div className="hero-grain">
          <h1
            className="font-display font-black tracking-[-4px] leading-[0.95] mb-6 animate-[fade-up_0.6s_ease_0.1s_both]"
            style={{ fontSize: "clamp(64px, 9vw, 120px)" }}
          >
            <span className="grunge-text" data-text="Not A Plastic">Not A Plastic</span>
            <br />
            <span className="grunge-text-accent" data-text="Trader.">Trader.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-[17px] font-light text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-[fade-up_0.6s_ease_0.2s_both]">
          Real reviews. Real complaints. Real withdrawal proof.
          <br className="hidden sm:block" />
          We verify everything so you never lose money to a fake broker again.
        </p>

        {/* Search bar */}
        <div className="max-w-[640px] mx-auto mb-5 animate-[fade-up_0.6s_ease_0.3s_both]">
          <div className="relative flex items-center glass-card rounded-[14px] overflow-hidden focus-within:border-primary/40 transition-colors">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={isFocused ? "" : searchHints[hintIndex]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => { if (!searchValue) setIsFocused(false); }}
              className="w-full bg-transparent pl-12 pr-36 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="absolute right-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-display font-bold tracking-wider rounded-[9px] hover:opacity-90 transition-opacity uppercase">
              Search
            </button>
          </div>
        </div>

        {/* Quick-search chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-[fade-up_0.6s_ease_0.4s_both]">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1 text-xs text-muted-foreground border border-border rounded-full hover:border-primary/40 hover:text-primary transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="glass-card rounded-xl px-2 py-4 inline-flex flex-wrap items-center gap-0 divide-x divide-border animate-[fade-up_0.6s_ease_0.5s_both]">
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
