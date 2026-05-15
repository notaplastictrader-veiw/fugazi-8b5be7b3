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
        { value: formatCount(brokers.count ?? 0), label: "Brokers reviewed" },
        { value: formatCount(scams.count ?? 0), label: "Scam alerts" },
        { value: formatCount(reviews.count ?? 0), label: "Verified reviews" },
        { value: formatCount(profiles.count ?? 0), label: "Members" },
      ]);
    })();
    return () => { cancelled = true; };
  }, [cmsStats]);

  const stats = (cmsStats ?? liveStats ?? defaultStats) as typeof defaultStats;

  const [searchValue, setSearchValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const typewriterRef = useRef({ textIndex: 0, charIndex: 0, isDeleting: false });
  const { t } = useI18n();

  const eyebrowVariants = [
    { prefix: "Built for real traders, not", highlight: "Fugazi Ones" },
    { prefix: "We test brokers.", highlight: "You trade smarter." },
    { prefix: "Real reviews.", highlight: "Zero paid promos." },
    { prefix: "Withdrawal proof first.", highlight: "Hype never." },
  ];
  const [eyebrowIdx, setEyebrowIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setEyebrowIdx((i) => (i + 1) % eyebrowVariants.length), 3500);
    return () => clearInterval(id);
  }, []);

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
          return setTimeout(tick, 700);
        }
        return setTimeout(tick, 55);
      } else {
        ref.charIndex++;
        setDisplayText(fullText.substring(0, ref.charIndex));
        if (ref.charIndex === fullText.length) {
          ref.isDeleting = true;
          return setTimeout(tick, 2800);
        }
        return setTimeout(tick, 110);
      }
    };
    const timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [typewriterTexts]);

  return (
    <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-4 text-center">

        {/* 1. Brand badge */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="relative inline-flex items-center px-4 py-1 rounded-full border border-primary/40 bg-primary/8 text-xs text-primary font-mono font-bold tracking-[0.18em] uppercase overflow-hidden shadow-[0_0_12px_hsl(var(--primary)/0.18)]">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <span className="relative flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Not A Fugazi Trader
            </span>
          </div>
          <div className="relative inline-flex items-center px-4 py-1 rounded-full border border-border bg-card/40 text-xs font-mono backdrop-blur-sm overflow-hidden">
            <span className="relative flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              <span key={eyebrowIdx} className="inline-flex items-center gap-1.5 animate-[fade-up_0.5s_ease_both]">
                <span className="text-muted-foreground">{eyebrowVariants[eyebrowIdx].prefix}</span>
                <span className="text-primary font-bold">{eyebrowVariants[eyebrowIdx].highlight}</span>
              </span>
            </span>
          </div>
        </div>

        {/* 2. Headline */}
        <div className="hero-grain">
          <h1 className="font-display font-black tracking-[-1px] leading-[1.05] mb-4 animate-[fade-up_0.6s_ease_0.1s_both]" style={{ fontSize: "clamp(40px, 6.4vw, 76px)" }}>
            <span className="grunge-text grunge-high">{cms.headline || "Find Brokers"}</span>
            <br />
            <span className="grunge-text-accent grunge-high">{cms.subheadline || "You Can Actually Trust."}</span>
          </h1>
        </div>

        {/* 3. One-line subheadline */}
        <p className="max-w-3xl mx-auto mb-6 text-sm md:text-base text-muted-foreground leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis animate-[fade-up_0.6s_ease_0.2s_both]">
          {t("hero.subtitle", "Unbiased broker reviews, real trader signals, and scam alerts — all in one place.")}
        </p>

        {/* 4. Search */}
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

        {/* 6. Live Trust Panel — replaces multiple chips/groups */}
        <div className="glass-card rounded-2xl px-3 py-3 inline-flex items-center gap-3 md:gap-5 animate-[fade-up_0.6s_ease_0.45s_both] flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
            LIVE
          </span>
          <span className="hidden md:inline-block w-px h-4 bg-border" />
          <span className="inline-flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <strong className="font-display font-extrabold text-foreground">{stats[0].value}</strong>
            <span className="text-muted-foreground">{stats[0].label}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <strong className="font-display font-extrabold text-foreground">{stats[1].value}</strong>
            <span className="text-muted-foreground">{stats[1].label}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <strong className="font-display font-extrabold text-foreground">{stats[2].value}</strong>
            <span className="text-muted-foreground">{stats[2].label}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--teal))]" />
            <strong className="font-display font-extrabold text-foreground">{stats[3].value}</strong>
            <span className="text-muted-foreground">{stats[3].label}</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
