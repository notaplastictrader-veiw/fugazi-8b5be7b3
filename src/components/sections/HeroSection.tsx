import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const defaultTypewriterTexts = [
  "Search Brokers, Signals, News...",
  "Search Prop Firms, Sports, Alerts...",
  "Search Crypto, Forecasts, Reviews...",
];

const defaultEyebrowItems = [
  { text: "Built for real traders, not ", highlight: "Fugazi Ones", suffix: "", color: "hsl(var(--primary))" },
  { text: "The world's ", highlight: "Most Transparent", suffix: " broker platform", color: "hsl(var(--accent))" },
  { text: "Where ", highlight: "Scams Get Exposed", suffix: " every single day", color: "hsl(var(--destructive))" },
  { text: "", highlight: "Real Proof", suffix: ". Real complaints. Real data.", color: "hsl(var(--teal))" },
  { text: "The platform ", highlight: "Brokers Fear", suffix: " and traders love", color: "hsl(var(--purple))" },
];

const defaultChipGroups = [
  { label: "Top Brokers", items: ["Exness", "IC Markets", "Pepperstone", "XM Global", "FBS"] },
  { label: "Top Prop Firms", items: ["FTMO", "MyForexFunds", "The5ers", "True Forex Funds", "Funded Next"] },
  { label: "Top Crypto", items: ["Binance", "Bybit", "OKX", "Coinbase", "Kraken"] },
];

const defaultStats = [
  { value: "4.8K+", label: "Verified reviews" },
  { value: "280+", label: "Brokers listed" },
  { value: "61+", label: "Scam alerts issued" },
  { value: "120K+", label: "Active traders" },
];

const HeroSection = () => {
  const cms = useSiteSettings<Record<string, any>>("hero_section", {});

  const typewriterTexts = (cms.search_placeholders?.length ? cms.search_placeholders : defaultTypewriterTexts) as string[];
  const eyebrowItems = (cms.eyebrow_items?.length ? cms.eyebrow_items : defaultEyebrowItems) as typeof defaultEyebrowItems;
  // chip_groups now editable from CMS — supports both array-of-strings and newline-text from textarea
  const chipGroups = (Array.isArray(cms.chip_groups) && cms.chip_groups.length > 0
    ? cms.chip_groups.map((g: any) => ({
        label: g.label || "",
        items: Array.isArray(g.items) ? g.items : (typeof g.items === "string" ? g.items.split("\n").map((s: string) => s.trim()).filter(Boolean) : []),
      }))
    : defaultChipGroups) as typeof defaultChipGroups;
  const stats = (cms.stats?.length ? cms.stats : defaultStats) as typeof defaultStats;

  const [eyebrowIndex, setEyebrowIndex] = useState(0);
  const [chipGroupIndex, setChipGroupIndex] = useState(0);
  const [chipFade, setChipFade] = useState(true);
  const [eyebrowAnim, setEyebrowAnim] = useState<"in" | "out">("in");
  const [searchValue, setSearchValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const typewriterRef = useRef({ textIndex: 0, charIndex: 0, isDeleting: false });
  const { t } = useI18n();

  useEffect(() => {
    const interval = setInterval(() => {
      setEyebrowAnim("out");
      setTimeout(() => {
        setEyebrowIndex((i) => (i + 1) % eyebrowItems.length);
        setEyebrowAnim("in");
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [eyebrowItems.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChipFade(false);
      setTimeout(() => {
        setChipGroupIndex((i) => (i + 1) % chipGroups.length);
        setChipFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [chipGroups.length]);

  useEffect(() => {
    const ref = typewriterRef.current;
    const tick = () => {
      const fullText = typewriterTexts[ref.textIndex];
      if (ref.isDeleting) {
        ref.charIndex--;
        setDisplayText(fullText.substring(0, ref.charIndex));
        if (ref.charIndex === 0) {
          ref.isDeleting = false;
          ref.textIndex = (ref.textIndex + 1) % typewriterTexts.length;
          return setTimeout(tick, 400);
        }
        return setTimeout(tick, 35);
      } else {
        ref.charIndex++;
        setDisplayText(fullText.substring(0, ref.charIndex));
        if (ref.charIndex === fullText.length) {
          ref.isDeleting = true;
          return setTimeout(tick, 1800);
        }
        return setTimeout(tick, 70);
      }
    };
    const timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [typewriterTexts]);

  const eyebrow = eyebrowItems[eyebrowIndex];
  const currentChips = chipGroups[chipGroupIndex];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-4 text-center">

        <div className="flex justify-center mt-[-8px] mb-3">
          <div className="relative inline-flex items-center px-4 py-1 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary font-mono font-semibold tracking-wider uppercase overflow-hidden shadow-[0_0_12px_hsl(var(--primary)/0.15)]">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <span className="relative flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Not a Fugazi Trader
            </span>
          </div>
        </div>

        <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-border/40 bg-card/50 backdrop-blur-sm mb-4 overflow-hidden h-[30px]">
          <span
            className={`flex items-center gap-1 text-xs text-muted-foreground transition-all duration-300 ${
              eyebrowAnim === "in" ? "translate-y-0 opacity-100" : "translate-y-[-100%] opacity-0"
            }`}
          >
            <span className="inline-block w-[6px] h-[6px] rounded-full mr-1.5 pulse-dot" style={{ backgroundColor: eyebrow.color || "hsl(var(--primary))" }} />
            {eyebrow.text}
            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: `${eyebrow.color || "hsl(var(--primary))"}20`, color: eyebrow.color || "hsl(var(--primary))", textShadow: `0 0 8px ${eyebrow.color || "hsl(var(--primary))"}40` }}>
              {eyebrow.highlight}
            </span>
            {eyebrow.suffix}
          </span>
        </div>

        <div className="hero-grain">
          <h1 className="font-display font-black tracking-[-1px] leading-[1.1] mb-3 animate-[fade-up_0.6s_ease_0.1s_both]" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            <span className="grunge-text grunge-high">{cms.headline || "Broker Reviews"}</span>
            <br />
            <span className="grunge-text-accent grunge-high">{cms.subheadline || "That Actually Matter."}</span>
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-5 animate-[fade-up_0.6s_ease_0.2s_both]">
          <p className="text-lg md:text-xl font-semibold text-foreground leading-snug mb-1.5">
            We Test Brokers. You Trade Smarter.
          </p>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {t("hero.subtitle", "Unbiased broker reviews, real trader signals, and scam alerts — all in one place.")}
          </p>
        </div>

        <div className="max-w-[640px] mx-auto mb-4 animate-[fade-up_0.6s_ease_0.3s_both]">
          <div className="relative flex items-center rounded-[14px] overflow-hidden bg-card/40 border border-primary/20 backdrop-blur-xl focus-within:border-primary/50 focus-within:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            {!searchValue && (
              <span className="absolute left-12 right-[110px] text-sm text-muted-foreground font-mono pointer-events-none select-none tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                {displayText}
                <span className="inline-block w-[2px] h-[14px] bg-muted-foreground/60 ml-[1px] align-middle animate-[pulse_1s_steps(1)_infinite]" />
              </span>
            )}
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder=""
              className="w-full bg-transparent pl-12 pr-36 py-4 text-sm text-foreground font-mono outline-none"
            />
            <button
              onClick={() => (window as any).__openGlobalSearch?.(searchValue)}
              className="absolute right-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-display font-bold tracking-wider rounded-[9px] hover:opacity-90 transition-opacity uppercase"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mb-6 animate-[fade-up_0.6s_ease_0.4s_both]">
          <div className={`transition-all duration-300 ${chipFade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <div className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest uppercase">{currentChips.label}</div>
            <div className="flex flex-wrap justify-center gap-2">
              {currentChips.items.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchValue(chip)}
                  className="px-3 py-1 text-xs text-muted-foreground border border-border rounded-full hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

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
