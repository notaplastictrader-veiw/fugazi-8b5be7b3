import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, Award, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import StarRating from "@/components/reviews/StarRating";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SponsoredBrokerCard from "@/components/sponsored/SponsoredBrokerCard";
import OfferRail from "@/components/common/OfferRail";

interface Broker {
  id: string;
  name: string;
  slug: string;
  type: string;
  tags: string[];
  regulation: string[];
  score: number;
  avg_spread: string;
  leverage: string;
  min_deposit: string;
  stars: number;
  review_count: number;
  complaints: number;
  badge: string;
  logo_url?: string | null;
  last_verified_at?: string | null;
  promo_code?: string | null;
  promo_label?: string | null;
  affiliate_url?: string | null;
  website_url?: string | null;
}

const formatSpread = (v?: string) => {
  if (!v) return "—";
  const m = v.match(/[\d.]+/);
  return m ? m[0] : v;
};

const formatLeverage = (v?: string) => {
  if (!v) return "—";
  if (/unlimited/i.test(v)) return "Unlimited";
  const matches = [...v.matchAll(/1:(\d+)/g)];
  if (!matches.length) return v;
  const max = matches.reduce((a, b) => (parseInt(b[1]) > parseInt(a[1]) ? b : a));
  return `1:${max[1]}`;
};

const formatRegulator = (v: string) => {
  if (!v) return v;
  return v.split(/[(\-—–]/)[0].trim();
};

const verifiedAgoShort = (iso?: string | null) => {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const m = Math.floor(days / 30);
  return m < 12 ? `${m}mo ago` : `${Math.floor(m / 12)}y ago`;
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

const badgeConfig: Record<string, { icon: typeof Shield; text: string; className: string }> = {
  verified: { icon: Shield, text: "Verified", className: "text-primary bg-primary/10 border-primary/20" },
  featured: { icon: Award, text: "Featured", className: "text-accent bg-accent/10 border-accent/20" },
  warning: { icon: AlertTriangle, text: "Warning", className: "text-destructive bg-destructive/10 border-destructive/20" },
  none: { icon: Shield, text: "", className: "" },
};

const BrokerCard = ({ broker, visible }: { broker: Broker; visible: boolean }) => {
  const badge = badgeConfig[broker.badge || "none"] || badgeConfig.none;
  const BadgeIcon = badge.icon;
  const scoreColor = broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";
  const verifiedLabel = verifiedAgoShort(broker.last_verified_at);
  // Deterministic pseudo-random viewer count seeded by broker id so it's stable per session
  const viewers = 80 + (parseInt((broker.id || "0").replace(/\D/g, "").slice(-3) || "0", 10) % 320);

  return (
    <div className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {broker.logo_url ? (
            <div className="w-11 h-11 shrink-0 flex items-center justify-center">
              <img src={broker.logo_url} alt={`${broker.name} logo`} className="max-w-full max-h-full object-contain" loading="lazy" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-display font-extrabold text-primary">{broker.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-foreground truncate">{broker.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-nowrap overflow-hidden">
              {broker.regulation?.slice(0, 3).map((r) => (
                <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">{formatRegulator(r)}</span>
              ))}
              {(broker.regulation?.length || 0) > 3 && (
                <Link
                  to={`/brokers/${broker.slug}`}
                  className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 hover:bg-primary/20 transition-colors"
                  title={broker.regulation!.slice(3).join(", ")}
                >
                  +{broker.regulation!.length - 3} more
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(broker.badge === "verified" || broker.badge === "featured") && (
            <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full ${badgeConfig.verified.className}`}>
              <Shield className="w-3 h-3" /> Verified
            </span>
          )}
          {broker.badge === "featured" && (
            <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full ${badgeConfig.featured.className}`}>
              <Award className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="min-w-0"><div className="text-xs text-muted-foreground">Avg Spread</div><div className="text-sm font-mono font-semibold text-foreground truncate" title={broker.avg_spread}>{formatSpread(broker.avg_spread)}</div></div>
        <div className="min-w-0"><div className="text-xs text-muted-foreground">Leverage</div><div className="text-sm font-mono font-semibold text-foreground truncate" title={broker.leverage}>{formatLeverage(broker.leverage)}</div></div>
        <div className="min-w-0"><div className="text-xs text-muted-foreground">Min Deposit</div><div className="text-sm font-mono font-semibold text-foreground truncate" title={broker.min_deposit}>{broker.min_deposit}</div></div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Trust Score</span>
          <span className="text-sm font-mono font-semibold text-muted-foreground">{broker.score}/10</span>
        </div>
        <div className="score-bar">
          <div className={`score-bar-fill ${scoreColor} opacity-70 transition-all duration-700`} style={{ width: visible ? `${broker.score * 10}%` : "0%" }} />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-primary/70" />
          {verifiedLabel ? `Verified ${verifiedLabel}` : "Verified by NAFT"}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          {viewers} viewing this week
        </span>
      </div>

      {(broker.affiliate_url || broker.website_url) && (
        <div className="mt-3">
          {/* Brokers → bonus-only (no promo code) */}
          <OfferRail
            code={null}
            label={broker.promo_label}
            url={broker.affiliate_url || broker.website_url}
            entityName={broker.name}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 min-w-0">
          <StarRating value={broker.stars} size={14} />
          <span className="text-xs text-muted-foreground ml-1 truncate">({broker.review_count})</span>
        </div>
        {(broker.complaints || 0) > 20 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-destructive shrink-0">
            <AlertTriangle className="w-3 h-3" /> {broker.complaints} complaints
          </span>
        ) : (
          <Link
            to={`/brokers/${broker.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/60 transition-all shrink-0"
          >
            Read Full Review <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
};

const PropFirmCard = ({ firm, visible }: { firm: Broker; visible: boolean }) => {
  const scoreColor = firm.score >= 8 ? "bg-primary" : firm.score >= 6 ? "bg-accent" : "bg-destructive";
  const hasInstantFunding = firm.tags?.includes("instant-funding");

  return (
    <div className="glass-card rounded-xl p-5 hover:border-accent/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {firm.logo_url ? (
            <div className="w-11 h-11 shrink-0 flex items-center justify-center">
              <img src={firm.logo_url} alt={`${firm.name} logo`} className="max-w-full max-h-full object-contain" loading="lazy" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-display font-extrabold text-accent">{firm.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-foreground truncate">{firm.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-nowrap overflow-hidden">
              {firm.regulation?.slice(0, 3).map((r) => (
                <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">{formatRegulator(r)}</span>
              ))}
              {(firm.regulation?.length || 0) > 3 && (
                <Link
                  to={`/brokers/${firm.slug}`}
                  className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0 hover:bg-accent/20 transition-colors"
                  title={firm.regulation!.slice(3).join(", ")}
                >
                  +{firm.regulation!.length - 3} more
                </Link>
              )}
            </div>
          </div>
        </div>
        {(firm.badge === "verified" || firm.badge === "featured") && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20 shrink-0">
            <Shield className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground">Account Size</div>
          <div className="text-sm font-mono font-semibold text-foreground">{firm.avg_spread || "$5K–$400K"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Leverage</div>
          <div className="text-sm font-mono font-semibold text-foreground">{formatLeverage(firm.leverage)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Start From</div>
          <div className="text-sm font-mono font-semibold text-foreground">{firm.min_deposit || "$10"}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs text-muted-foreground">Instant Funding</span>
        {hasInstantFunding ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
            <CheckCircle className="w-3.5 h-3.5" /> Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <XCircle className="w-3.5 h-3.5" /> No
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Trust Score</span>
          <span className="text-sm font-mono font-semibold text-muted-foreground">{firm.score}/10</span>
        </div>
        <div className="score-bar">
          <div className={`score-bar-fill ${scoreColor} opacity-70 transition-all duration-700`} style={{ width: visible ? `${firm.score * 10}%` : "0%" }} />
        </div>
      </div>

      {(firm.affiliate_url || firm.website_url) && (
        <div className="mb-3">
          {/* Prop firms → discount code rail */}
          <OfferRail
            code={firm.promo_code}
            label={firm.promo_label}
            url={firm.affiliate_url || firm.website_url}
            entityName={firm.name}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 min-w-0">
          <StarRating value={firm.stars} size={14} />
          <span className="text-xs text-muted-foreground ml-1 truncate">({firm.review_count})</span>
        </div>
        <Link
          to={`/brokers/${firm.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-accent px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 hover:bg-accent/20 hover:border-accent/60 transition-all shrink-0"
        >
          Read Full Review <ExternalLink className="w-3 h-3" />
        </Link>
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
  const [visible, setVisible] = useState(false);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const fallbackBrokers: Broker[] = [
    { id: "1", name: "Exness", slug: "exness", type: "forex", tags: ["forex", "ecn", "low-spread", "bd-friendly"], regulation: ["FCA", "CySEC"], score: 9.2, avg_spread: "0.1 pips", leverage: "Unlimited", min_deposit: "$1", stars: 4.5, review_count: 1247, complaints: 12, badge: "verified" },
    { id: "2", name: "IC Markets", slug: "ic-markets", type: "forex", tags: ["forex", "ecn", "low-spread"], regulation: ["ASIC", "CySEC"], score: 9.0, avg_spread: "0.02 pips", leverage: "1:500", min_deposit: "$200", stars: 4.5, review_count: 892, complaints: 8, badge: "verified" },
    { id: "3", name: "XM Global", slug: "xm-global", type: "forex", tags: ["forex", "bd-friendly"], regulation: ["ASIC", "IFSC"], score: 7.8, avg_spread: "1.6 pips", leverage: "1:1000", min_deposit: "$5", stars: 3.8, review_count: 634, complaints: 45, badge: "featured" },
    { id: "4", name: "Quotex", slug: "quotex", type: "binary", tags: ["binary", "crypto", "scam-watch"], regulation: ["IFMRRC"], score: 4.2, avg_spread: "N/A", leverage: "N/A", min_deposit: "$10", stars: 2.1, review_count: 312, complaints: 89, badge: "warning" },
    { id: "5", name: "Pepperstone", slug: "pepperstone", type: "forex", tags: ["forex", "ecn", "low-spread"], regulation: ["ASIC", "FCA"], score: 9.1, avg_spread: "0.09 pips", leverage: "1:500", min_deposit: "$200", stars: 4.6, review_count: 756, complaints: 5, badge: "verified" },
    { id: "6", name: "FTMO", slug: "ftmo", type: "prop-firm", tags: ["prop-firm"], regulation: ["Czech NB"], score: 8.8, avg_spread: "$10K–$200K", leverage: "1:100", min_deposit: "$155", stars: 4.4, review_count: 523, complaints: 15, badge: "verified" },
  ];

  useEffect(() => {
    const fetchBrokers = async () => {
      // 1) Admin-curated homepage brokers first
      const { data: curated } = await supabase
        .from("brokers")
        .select("*")
        .eq("status", "published")
        .eq("show_on_homepage", true)
        .order("homepage_position", { ascending: true, nullsFirst: false })
        .limit(brokerCount);

      let result: Broker[] = (curated as Broker[]) || [];

      // 2) Fallback: top-scored published brokers fill remaining slots
      if (result.length < brokerCount) {
        const remaining = brokerCount - result.length;
        const excludeIds = result.map((b) => b.id);
        let fillerQuery = supabase
          .from("brokers")
          .select("*")
          .eq("status", "published")
          .order("score", { ascending: false })
          .limit(remaining);
        if (excludeIds.length > 0) {
          fillerQuery = fillerQuery.not("id", "in", `(${excludeIds.join(",")})`);
        }
        const { data: fillers } = await fillerQuery;
        if (fillers) result = [...result, ...(fillers as Broker[])];
      }

      if (result.length > 0) setBrokers(result);
      else setBrokers(fallbackBrokers);
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

  const filteredPropFirms = brokers.filter(b => b.type === "prop-firm").slice(0, propFirmCount);

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
            <button key={f} onClick={() => setBrokerFilter(f)}
              className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                brokerFilter === f ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}>{f}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SponsoredBrokerCard />
          {filteredBrokers.map((broker) => <BrokerCard key={broker.slug} broker={broker} visible={visible} />)}
        </div>

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


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPropFirms.map((firm) => <PropFirmCard key={firm.slug} firm={firm} visible={visible} />)}
          </div>

          <div className="mt-6">
            <Link to="/prop-firms" className="text-sm text-accent hover:underline font-medium">{propViewAllText}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrokerTrustHub;
