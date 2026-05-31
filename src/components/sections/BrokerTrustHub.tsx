import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Award, CheckCircle, XCircle, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import StarRating from "@/components/reviews/StarRating";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SponsoredBrokerCard from "@/components/sponsored/SponsoredBrokerCard";
import OfferRail from "@/components/common/OfferRail";
import BrokerCard, { Broker, formatLeverage, formatRegulator } from "@/components/broker/BrokerCard";
import { formatSpreadNumber, formatMinDepositNumber } from "@/lib/brokerFormat";

const propAccountRange = (firm: any): string | null => {
  const sizes: number[] = [];
  const lr = firm?.long_review;
  const push = (v: any) => {
    if (v == null) return;
    const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(n) && n > 0) sizes.push(n);
  };
  if (Array.isArray(lr?.challenges)) lr.challenges.forEach((c: any) => Array.isArray(c?.sizes) && c.sizes.forEach((s: any) => push(s?.size)));
  if (sizes.length === 0 && Array.isArray(lr?.account_types)) lr.account_types.forEach((a: any) => push(a?.name));
  if (sizes.length === 0 && Array.isArray(firm?.account_types)) firm.account_types.forEach((a: any) => push(a?.name));
  if (sizes.length === 0) return null;
  const min = Math.min(...sizes), max = Math.max(...sizes);
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
};

const brokerFilters = ["All", "Forex", "Crypto", "Binary", "ECN", "Prop Firms", "Scam Watch"];
const propFirmFilters = ["All", "Instant Funding", "Challenge-based", "Crypto Funded", "No Time Limit"];

const filterMap: Record<string, string> = {
  All: "",
  Forex: "forex",
  Crypto: "crypto",
  Binary: "binary",
  ECN: "ecn",
  "Prop Firms": "prop-firm",
  "Scam Watch": "scam-watch",
  "Instant Funding": "instant-funding",
  "Challenge-based": "challenge",
  "Crypto Funded": "crypto-funded",
  "No Time Limit": "no-time-limit",
};


const PropFirmCard = ({ firm, visible }: { firm: Broker; visible: boolean }) => {
  const scoreColor = firm.score >= 8 ? "bg-accent" : firm.score >= 6 ? "bg-accent/70" : "bg-destructive";
  const hasInstantFunding = firm.tags?.includes("instant-funding");
  const regs = firm.regulation || [];
  const isVerified = firm.badge === "verified" || firm.badge === "featured";

  return (
    <div className="group relative flex bg-card border border-border/60 rounded-sm overflow-hidden hover:border-accent/30 transition-all">
      {/* Side rail */}
      <div className="w-0.5 shrink-0 bg-accent" />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              {firm.logo_url ? (
                <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                  <img src={firm.logo_url} alt={`${firm.name} logo`} className="max-w-full max-h-full object-contain" loading="lazy" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-display font-extrabold text-accent">{firm.name.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-tight leading-none truncate">{firm.name}</h3>
                {regs.length > 0 && (
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5 uppercase tracking-wide truncate" title={regs.join(", ")}>
                    {regs.slice(0, 3).map(formatRegulator).join(" · ")}
                    {regs.length > 3 && (
                      <Link to={`/brokers/${firm.slug}`} className="text-muted-foreground/40 hover:text-accent ml-1">+{regs.length - 3} more</Link>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isVerified && (
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-2 py-1 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Verified</span>
              </span>
              {hasInstantFunding && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3" /> Instant Funding
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="min-w-0 text-center">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Account</p>
              <p className="font-display text-xl font-bold text-foreground leading-none truncate" title={propAccountRange(firm) || firm.avg_spread}>{propAccountRange(firm) || "$5K–$400K"}</p>
            </div>
            <div className="min-w-0 text-center">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Max Leverage</p>
              <p className="font-display text-xl font-bold text-foreground leading-none truncate" title={firm.leverage}>{formatLeverage(firm.leverage)}</p>
            </div>
            <div className="min-w-0 text-center">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Start From</p>
              <p className="font-display text-xl font-bold text-foreground leading-none truncate">{formatMinDepositNumber(firm.min_deposit)}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">Trust Score</span>
                <span className="font-display text-lg font-bold text-accent leading-none">
                  {firm.score}<span className="text-muted-foreground/40 text-xs ml-0.5">/10</span>
                </span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
              <div className={`h-full ${scoreColor} rounded-full transition-all duration-700`} style={{ width: visible ? `${firm.score * 10}%` : "0%" }} />
            </div>
          </div>

          {!isVerified && (
            <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide mt-3">
              <span className="inline-flex items-center gap-1.5">
                {hasInstantFunding ? (
                  <><CheckCircle className="w-3 h-3 text-primary/70" /> Instant Funding</>
                ) : (
                  <><XCircle className="w-3 h-3" /> No Instant Funding</>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto px-5 py-4 border-t border-border/40 bg-foreground/[0.015]">
          {(firm.affiliate_url || firm.website_url) ? (
            <OfferRail
              code={firm.promo_code}
              label={firm.promo_label}
              url={firm.affiliate_url || firm.website_url}
              entityName={firm.name}
            />
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground font-display font-extrabold text-xs tracking-wide uppercase py-2.5 px-3">
              Coming Soon
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <StarRating value={firm.stars} size={14} />
              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase ml-1">({firm.review_count})</span>
            </div>
            {(firm.review_count || 0) === 0 && !firm.long_review ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-widest shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                NAFT Testing In Progress
              </span>
            ) : (
              <Link
                to={`/brokers/${firm.slug}`}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-foreground/70 hover:text-accent uppercase tracking-widest transition-colors shrink-0 group/link"
              >
                Read Review
                <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BrokerTrustHub = () => {
  const cms = useSiteSettings<Record<string, any>>("broker_trust_hub", {});
  const sectionTitleText = cms.section_title || "Top Verified";
  const brokerAccent = cms.broker_accent || "Brokers";
  const brokerSubtitle = cms.broker_subtitle || "Every broker scored by real user data — complaints, withdrawal speed, regulation strength.";
  const brokerCount = cms.broker_count || 50;
  const brokerViewAllText = cms.broker_view_all_text || "View All Brokers →";
  const brokerFiltersList = (cms.broker_filters?.length ? cms.broker_filters : brokerFilters) as string[];
  const propSectionTitle = cms.prop_section_title || "Top Verified";
  const propAccent = cms.prop_accent || "Prop Firms";
  const propSubtitle = cms.prop_subtitle || "Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.";
  const propFirmCount = cms.prop_firm_count || 6;
  const propViewAllText = cms.prop_view_all_text || "View All Prop Firms →";
  const propFirmCategories = (cms.prop_firm_categories?.length ? cms.prop_firm_categories : ["All Prop Firms", "Instant Funding", "1-Step Clg", "2-Step Clg", "Dis% Offers", "No Time Limit"]) as string[];
  const [brokerFilter, setBrokerFilter] = useState("All");
  const [visible, setVisible] = useState(true);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [brokerPage, setBrokerPage] = useState(0);
  const [propPage, setPropPage] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const PAGE = 6;

  const fallbackBrokers: Broker[] = [
    { id: "1", name: "Exness", slug: "exness", type: "forex", tags: ["forex", "ecn", "low-spread"], regulation: ["FCA", "CySEC"], score: 9.2, avg_spread: "0.1 pips", leverage: "Unlimited", min_deposit: "$1", stars: 4.5, review_count: 1247, complaints: 12, badge: "verified" },
    { id: "2", name: "IC Markets", slug: "ic-markets", type: "forex", tags: ["forex", "ecn", "low-spread"], regulation: ["ASIC", "CySEC"], score: 9.0, avg_spread: "0.02 pips", leverage: "1:500", min_deposit: "$200", stars: 4.5, review_count: 892, complaints: 8, badge: "verified" },
    { id: "3", name: "XM Global", slug: "xm-global", type: "forex", tags: ["forex", "bd-friendly"], regulation: ["ASIC", "IFSC"], score: 7.8, avg_spread: "1.6 pips", leverage: "1:1000", min_deposit: "$5", stars: 3.8, review_count: 634, complaints: 45, badge: "featured" },
    { id: "4", name: "Quotex", slug: "quotex", type: "binary", tags: ["binary", "crypto", "scam-watch"], regulation: ["IFMRRC"], score: 4.2, avg_spread: "N/A", leverage: "N/A", min_deposit: "$10", stars: 2.1, review_count: 312, complaints: 89, badge: "warning" },
    { id: "5", name: "Pepperstone", slug: "pepperstone", type: "forex", tags: ["forex", "ecn", "low-spread"], regulation: ["ASIC", "FCA"], score: 9.1, avg_spread: "0.09 pips", leverage: "1:500", min_deposit: "$200", stars: 4.6, review_count: 756, complaints: 5, badge: "verified" },
    { id: "6", name: "FTMO", slug: "ftmo", type: "prop-firm", tags: ["prop-firm"], regulation: ["Czech NB"], score: 8.8, avg_spread: "$10K–$200K", leverage: "1:100", min_deposit: "$155", stars: 4.4, review_count: 523, complaints: 15, badge: "verified" },
    { id: "7", name: "MyForexFunds", slug: "myforexfunds", type: "prop-firm", tags: ["prop-firm", "instant-funding"], regulation: ["—"], score: 8.4, avg_spread: "$5K–$300K", leverage: "1:100", min_deposit: "$84", stars: 4.2, review_count: 412, complaints: 22, badge: "verified" },
    { id: "8", name: "The Funded Trader", slug: "the-funded-trader", type: "prop-firm", tags: ["prop-firm", "challenge"], regulation: ["—"], score: 8.3, avg_spread: "$10K–$200K", leverage: "1:100", min_deposit: "$99", stars: 4.1, review_count: 318, complaints: 18, badge: "verified" },
    { id: "9", name: "Maven Trading", slug: "maven-trading", type: "prop-firm", tags: ["prop-firm", "challenge"], regulation: ["—"], score: 8.2, avg_spread: "$10K–$200K", leverage: "1:100", min_deposit: "$59", stars: 4.0, review_count: 246, complaints: 11, badge: "verified" },
    { id: "10", name: "FundedNext", slug: "fundednext", type: "prop-firm", tags: ["prop-firm", "instant-funding"], regulation: ["—"], score: 8.1, avg_spread: "$6K–$200K", leverage: "1:100", min_deposit: "$59", stars: 4.0, review_count: 287, complaints: 14, badge: "verified" },
    { id: "11", name: "E8 Funding", slug: "e8-funding", type: "prop-firm", tags: ["prop-firm", "no-time-limit"], regulation: ["—"], score: 8.0, avg_spread: "$25K–$250K", leverage: "1:100", min_deposit: "$138", stars: 3.9, review_count: 198, complaints: 9, badge: "verified" },
  ];

  useEffect(() => {
    const fetchBrokers = async () => {
      const hasReview = (b: any) =>
        (b?.review_count ?? 0) > 0 || b?.long_review != null;
      const isExcludedTag = (b: any) =>
        b?.tags?.includes("upcoming") || b?.tags?.includes("review-coming-soon");

      // 1) Admin-curated homepage brokers first (only reviewed ones)
      const { data: curated } = await supabase
        .from("brokers")
        .select("*")
        .eq("status", "published")
        .eq("show_on_homepage", true)
        .order("homepage_position", { ascending: true, nullsFirst: false })
        .limit(brokerCount);

      let result: Broker[] = ((curated as Broker[]) || []).filter(
        (b) => !isExcludedTag(b) && hasReview(b)
      );

      // 2) Fallback: top-scored reviewed brokers fill remaining slots
      if (result.length < brokerCount) {
        const remaining = brokerCount - result.length;
        const excludeIds = result.map((b) => b.id);
        let fillerQuery = supabase
          .from("brokers")
          .select("*")
          .eq("status", "published")
          .or("review_count.gt.0,long_review.not.is.null")
          .order("score", { ascending: false })
          .limit(remaining + 20);
        if (excludeIds.length > 0) {
          fillerQuery = fillerQuery.not("id", "in", `(${excludeIds.join(",")})`);
        }
        const { data: fillers } = await fillerQuery;
        if (fillers) {
          const extra = (fillers as Broker[])
            .filter((b) => !isExcludedTag(b) && hasReview(b))
            .slice(0, remaining);
          result = [...result, ...extra];
        }
      }

      result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      result = result.slice(0, brokerCount);

      if (result.length > 0) setBrokers(result);
      else setBrokers(fallbackBrokers.filter((b) => !b.tags?.includes("upcoming")));
    };
    fetchBrokers();
  }, [brokerCount]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filteredBrokers = brokerFilter === "All"
    ? brokers.filter(b => b.type !== "prop-firm")
    : brokers.filter(b => b.tags?.includes(filterMap[brokerFilter]));

  const allPropFirms = brokers.filter(b => b.type === "prop-firm");

  const brokerPageCount = Math.max(1, Math.ceil((filteredBrokers.length + 1) / PAGE));
  const brokerCurrent = Math.min(brokerPage, brokerPageCount - 1);
  const brokerSlice = (() => {
    const items: React.ReactNode[] = [
      <SponsoredBrokerCard key="sponsored" />,
      ...filteredBrokers.map((broker) => <BrokerCard key={broker.slug} broker={broker} visible={visible} />),
    ];
    return items.slice(brokerCurrent * PAGE, brokerCurrent * PAGE + PAGE);
  })();

  const propPageCount = Math.max(1, Math.ceil(allPropFirms.length / PAGE));
  const propCurrent = Math.min(propPage, propPageCount - 1);
  const propSlice = allPropFirms.slice(propCurrent * PAGE, propCurrent * PAGE + PAGE);

  const Pager = ({ page, count, onChange, accent }: { page: number; count: number; onChange: (p: number) => void; accent: "primary" | "accent" }) => {
    if (count <= 1) return null;
    const hover = accent === "primary" ? "hover:text-primary hover:border-primary/50" : "hover:text-accent hover:border-accent/50";
    return (
      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous"
          className={`w-9 h-9 rounded-full border border-border bg-card text-foreground ${hover} disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Page {page + 1} of {count}
        </span>
        <button onClick={() => onChange(Math.min(count - 1, page + 1))} disabled={page >= count - 1} aria-label="Next"
          className={`w-9 h-9 rounded-full border border-border bg-card text-foreground ${hover} disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center`}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Brokers Section */}
        <span className="section-tag">// TRUST HUB</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          {sectionTitleText} <span className="text-primary">{brokerAccent}</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-8">{brokerSubtitle}</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {brokerFiltersList.map((f) => (
            <button key={f} onClick={() => { setBrokerFilter(f); setBrokerPage(0); }}
              className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                brokerFilter === f ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}>{f}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brokerSlice}
        </div>
        <Pager page={brokerCurrent} count={brokerPageCount} onChange={setBrokerPage} accent="primary" />

        <div className="mt-6">
          <Link to="/brokers" className="text-sm text-primary hover:underline font-medium">{brokerViewAllText}</Link>
        </div>

        {/* Prop Firms Section */}
        <div className="mt-20">
          <span className="section-tag">// PROP FIRMS</span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
            {propSectionTitle} <span className="text-accent">{propAccent}</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{propSubtitle}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {propFirmCategories.map((name) => (
              <span key={name} className="px-3 py-1 text-xs font-mono rounded-full border border-accent/30 text-accent bg-accent/5">{name}</span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {propSlice.map((firm) => <PropFirmCard key={firm.slug} firm={firm} visible={visible} />)}
          </div>
          <Pager page={propCurrent} count={propPageCount} onChange={setPropPage} accent="accent" />

          <div className="mt-6">
            <Link to="/prop-firms" className="text-sm text-accent hover:underline font-medium">{propViewAllText}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrokerTrustHub;
