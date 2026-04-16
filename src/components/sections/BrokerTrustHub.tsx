import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Shield, AlertTriangle, Award, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
}

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

  return (
    <div className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{broker.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {broker.regulation?.map((r) => (
              <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{r}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
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
        <div><div className="text-xs text-muted-foreground">Avg Spread</div><div className="text-sm font-mono font-semibold text-foreground">{broker.avg_spread}</div></div>
        <div><div className="text-xs text-muted-foreground">Leverage</div><div className="text-sm font-mono font-semibold text-foreground">{broker.leverage}</div></div>
        <div><div className="text-xs text-muted-foreground">Min Deposit</div><div className="text-sm font-mono font-semibold text-foreground">{broker.min_deposit}</div></div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Trust Score</span>
          <span className="text-sm font-mono font-bold text-foreground">{broker.score}/10</span>
        </div>
        <div className="score-bar">
          <div className={`score-bar-fill ${scoreColor} transition-all duration-700`} style={{ width: visible ? `${broker.score * 10}%` : "0%" }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(broker.stars) ? "text-accent fill-accent" : "text-border"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({broker.review_count})</span>
        </div>
        <a href={`/brokers/${broker.slug}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
          Full review <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {(broker.complaints || 0) > 20 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" /> {broker.complaints} complaints filed
        </div>
      )}
    </div>
  );
};

const PropFirmCard = ({ firm, visible }: { firm: Broker; visible: boolean }) => {
  const scoreColor = firm.score >= 8 ? "bg-primary" : firm.score >= 6 ? "bg-accent" : "bg-destructive";
  const hasInstantFunding = firm.tags?.includes("instant-funding");

  return (
    <div className="glass-card rounded-xl p-5 hover:border-accent/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{firm.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {firm.regulation?.map((r) => (
              <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{r}</span>
            ))}
          </div>
        </div>
        {(firm.badge === "verified" || firm.badge === "featured") && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
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
          <div className="text-sm font-mono font-semibold text-foreground">{firm.leverage}</div>
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
          <span className="text-sm font-mono font-bold text-foreground">{firm.score}/10</span>
        </div>
        <div className="score-bar">
          <div className={`score-bar-fill ${scoreColor} transition-all duration-700`} style={{ width: visible ? `${firm.score * 10}%` : "0%" }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(firm.stars) ? "text-accent fill-accent" : "text-border"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({firm.review_count})</span>
        </div>
        <a href={`/brokers/${firm.slug}`} className="flex items-center gap-1 text-xs text-accent hover:underline">
          Full review <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

const BrokerTrustHub = () => {
  const cms = useSiteSettings<Record<string, any>>("broker_trust_hub", {});
  const sectionTitleText = cms.section_title || "Top Verified";
  const brokerCount = cms.broker_count || 50;
  const propFirmCategories = (cms.prop_firm_categories?.length ? cms.prop_firm_categories : ["All Prop Firms", "Instant Funding", "1-Step Challenge", "2-Step Challenge", "Discount Offers", "Crypto Funded", "No Time Limit"]) as string[];
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
      const { data } = await supabase.from("brokers").select("*").eq("status", "published").order("score", { ascending: false }).limit(brokerCount);
      if (data && data.length > 0) setBrokers(data as Broker[]);
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

  const filteredPropFirms = brokers.filter(b => b.type === "prop-firm").slice(0, 6);

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Brokers Section */}
        <span className="section-tag">// TRUST HUB</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          {sectionTitleText} <span className="text-primary">Brokers</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-8">Every broker scored by real user data — complaints, withdrawal speed, regulation strength.</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {brokerFilters.map((f) => (
            <button key={f} onClick={() => setBrokerFilter(f)}
              className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                brokerFilter === f ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}>{f}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrokers.map((broker) => <BrokerCard key={broker.slug} broker={broker} visible={visible} />)}
        </div>

        <div className="mt-6">
          <a href="/brokers" className="text-sm text-primary hover:underline font-medium">View All Brokers →</a>
        </div>

        {/* Prop Firms Section */}
        <div className="mt-20">
          <span className="section-tag">// PROP FIRMS</span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
            Top Verified <span className="text-accent">Prop Firms</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {propFirmCategories.map((name) => (
              <span key={name} className="px-3 py-1 text-xs font-mono rounded-full border border-accent/30 text-accent bg-accent/5">{name}</span>
            ))}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPropFirms.map((firm) => <PropFirmCard key={firm.slug} firm={firm} visible={visible} />)}
          </div>

          <div className="mt-6">
            <a href="/prop-firms" className="text-sm text-accent hover:underline font-medium">View All Prop Firms →</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrokerTrustHub;
