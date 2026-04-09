import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Shield, AlertTriangle, Award, ExternalLink } from "lucide-react";

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
        <a href={`/brokers/${broker.slug}`} className="flex items-center gap-1 text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
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

const BrokerTrustHub = () => {
  const [brokerFilter, setBrokerFilter] = useState("All");
  
  const [visible, setVisible] = useState(false);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrokers = async () => {
      const { data } = await supabase.from("brokers").select("*").eq("status", "published").order("score", { ascending: false });
      if (data) setBrokers(data as Broker[]);
    };
    fetchBrokers();
  }, []);

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
          Top Verified <span className="text-primary">Brokers</span>
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
            {["Bullwaves Prime", "FTMO", "MyForexFunds", "The Funded Trader", "True Forex Funds", "Maven Trading"].map((name) => (
              <span key={name} className="px-3 py-1 text-xs font-mono rounded-full border border-accent/30 text-accent bg-accent/5">{name}</span>
            ))}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPropFirms.map((broker) => <BrokerCard key={broker.slug} broker={broker} visible={visible} />)}
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
