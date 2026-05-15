import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowRight, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

const formatCount = (n: number | null): string => {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K+`;
  if (n >= 100) return `${n}+`;
  return `${n}`;
};

const defaultTypewriterTexts = [
  "Search Brokers, Signals, News...",
  "Search Prop Firms, Sports, Alerts...",
  "Search Crypto, Forecasts, Reviews...",
];

const defaultStats = [
  { value: "—", label: "Brokers reviewed" },
  { value: "—", label: "Scam alerts" },
  { value: "—", label: "Verified reviews" },
  { value: "—", label: "Members" },
];

const HeroSection = () => {
  const cms = useSiteSettings<Record<string, any>>("hero_section", {});
  const typewriterTexts = (cms.search_placeholders?.length ? cms.search_placeholders : defaultTypewriterTexts) as string[];
  const cmsStats = (cms.stats?.length ? cms.stats : null) as typeof defaultStats | null;

  const [liveStats, setLiveStats] = useState<typeof defaultStats | null>(null);

  useEffect(() => {
    if (cmsStats) return;
    let cancelled = false;
    (async () => {
      const [reviews, brokers, scams, profiles] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("brokers").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("scam_alerts").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      if (cancelled) return;
      setLiveStats([
        { value: formatCount(brokers.count ?? 0), label: "Brokers listed" },
        { value: formatCount(scams.count ?? 0), label: "Scam alerts" },
        { value: formatCount(reviews.count ?? 0), label: "Verified reviews" },
        { value: "1.2M+", label: "Website visitors" },
      ]);
    })();
    return () => { cancelled = true; };
  }, [cmsStats]);

  const baseStats = (cmsStats ?? liveStats ?? defaultStats) as typeof defaultStats;
  const stats = [
    baseStats[0],
    baseStats[1],
    baseStats[2],
    { value: "1.2M+", label: "Website visitors" },
  ] as typeof defaultStats;

  const [searchValue, setSearchValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const typewriterRef = useRef({ textIndex: 0, charIndex: 0, isDeleting: false });
  const { t } = useI18n();

  const eyebrowItems = [
    { text: "Built for real traders, not ", highlight: "Fugazi Ones", suffix: "", color: "hsl(var(--primary))" },
    { text: "The world's ", highlight: "Most Transparent", suffix: " broker platform", color: "hsl(var(--accent))" },
    { text: "Where ", highlight: "Scams Get Exposed", suffix: " every single day", color: "hsl(var(--destructive))" },
    { text: "", highlight: "Real Proof", suffix: ". Real complaints. Real data.", color: "hsl(var(--teal))" },
    { text: "The platform ", highlight: "Brokers Fear", suffix: " and traders love", color: "hsl(var(--purple))" },
  ];
  const [eyebrowIndex, setEyebrowIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setEyebrowIndex((i) => (i + 1) % eyebrowItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [eyebrowItems.length]);
  const eyebrow = eyebrowItems[eyebrowIndex];

  /* ─── typewriter search placeholder ─── */
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
          return setTimeout(tick, 600);          // pause before next word
        }
        return setTimeout(tick, 55);             // delete speed (slower)
      } else {
        ref.charIndex++;
        setDisplayText(fullText.substring(0, ref.charIndex));
        if (ref.charIndex === fullText.length) {
          ref.isDeleting = true;
          return setTimeout(tick, 2500);         // pause after full word
        }
        return setTimeout(tick, 110);            // type speed (slower)
      }
    };
    const timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [typewriterTexts]);


  return (
    <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-4 text-center">

        {/* 1. Brand badge */}
        <div className="flex justify-center mt-[-8px] mb-3">
          <div className="relative inline-flex items-center px-4 py-1 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary font-mono font-semibold tracking-wider uppercase overflow-hidden shadow-[0_0_12px_hsl(var(--primary)/0.15)]">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <span className="relative flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Not a Fugazi Trader
            </span>
          </div>
        </div>

        {/* 2. Rotating eyebrow — pure CSS crossfade via key remount */}
        <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-border/40 bg-card/50 backdrop-blur-sm mb-4 h-[30px]">
          <span
            key={eyebrowIndex}
            className="flex items-center gap-1 text-xs text-muted-foreground animate-fade-in"
          >
            <span className="inline-block w-[6px] h-[6px] rounded-full mr-1.5 pulse-dot" style={{ backgroundColor: eyebrow.color }} />
            {eyebrow.text}
            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: `${eyebrow.color}20`, color: eyebrow.color, textShadow: `0 0 8px ${eyebrow.color}40` }}>
              {eyebrow.highlight}
            </span>
            {eyebrow.suffix}
          </span>
        </div>

        {/* 3. Headline */}
        <div className="hero-grain">
          <h1 className="font-display font-black tracking-[-1px] leading-[1.1] mb-3 animate-[fade-up_0.6s_ease_0.1s_both]" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            <span className="grunge-text grunge-high">{cms.headline || "Broker Reviews"}</span>
            <br />
            <span className="grunge-text-accent grunge-high">{cms.subheadline || "That Actually Matter."}</span>
          </h1>
        </div>

        {/* 4. Subheadline */}
        <div className="max-w-2xl mx-auto mb-5 animate-[fade-up_0.6s_ease_0.2s_both]">
          <p className="text-sm md:text-base text-muted-foreground font-medium leading-snug mb-1.5">
            We Test Brokers. You Trade Smarter.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("hero.subtitle", "Unbiased broker reviews, real trader signals, and scam alerts — all in one place.")}
          </p>
        </div>

        {/* 4. Search */}
        <div className="max-w-[640px] mx-auto mb-4 animate-[fade-up_0.6s_ease_0.3s_both]">
          <div className="relative flex items-center rounded-[14px] overflow-hidden bg-card/40 border border-primary/20 backdrop-blur-xl focus-within:border-primary/50 focus-within:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            {!searchValue && (
              <span className="absolute left-12 right-[110px] text-sm text-muted-foreground font-mono pointer-events-none select-none tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                {displayText}
                <span className="inline-block w-[2px] h-[1em] bg-muted-foreground ml-[1px] align-middle animate-[pulse_1s_ease-in-out_infinite]" />
              </span>
            )}
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder=""
              className="w-full bg-transparent pl-12 pr-36 py-4 text-sm text-foreground font-mono outline-none"
              aria-label="Search brokers, scams, signals"
            />
            <button
              onClick={() => (window as any).__openGlobalSearch?.(searchValue)}
              className="absolute right-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-display font-bold tracking-wider rounded-[9px] hover:opacity-90 transition-opacity uppercase"
            >
              Search
            </button>
          </div>
        </div>

        {/* 5. Single primary CTA + secondary */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fade-up_0.6s_ease_0.35s_both]">
          <Link
            to="/match"
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold tracking-wide uppercase text-sm shadow-[0_4px_24px_hsl(var(--primary)/0.35)] hover:shadow-[0_6px_32px_hsl(var(--primary)/0.55)] hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Find My Broker in 60s
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/brokers"
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-3 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-sm font-display font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            Browse all brokers
          </Link>
        </div>

        {/* 6. Stats — thin inline strip */}
        <div className="w-full mt-2 animate-[fade-up_0.6s_ease_0.45s_both]">
          <div className="glass-card rounded-full px-3 py-2 md:px-4 md:py-2.5 flex items-center justify-start md:justify-center gap-3 md:gap-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { icon: ShieldCheck, value: stats[0].value, label: stats[0].label, accent: "text-primary" },
              { icon: AlertTriangle, value: stats[1].value, label: stats[1].label, accent: "text-destructive" },
              { icon: Activity, value: stats[2].value, label: stats[2].label, accent: "text-accent" },
              { icon: Sparkles, value: stats[3].value, label: stats[3].label, accent: "text-[hsl(var(--teal))]" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-1.5 shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${s.accent}`} />
                  <span className={`font-display font-bold text-sm md:text-base ${s.accent}`}>{s.value}</span>
                  <span className="text-[10px] md:text-xs font-mono uppercase tracking-wider text-foreground/70">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
