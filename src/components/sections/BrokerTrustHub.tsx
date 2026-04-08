import { useState } from "react";
import { brokers } from "@/data/brokers";
import { Star, Shield, AlertTriangle, Award, ExternalLink } from "lucide-react";

const filters = ["All", "Forex", "Crypto", "ECN", "Low Spread", "BD Friendly", "Scam Watch"];

const filterMap: Record<string, string> = {
  "All": "",
  "Forex": "forex",
  "Crypto": "crypto",
  "ECN": "ecn",
  "Low Spread": "low-spread",
  "BD Friendly": "bd-friendly",
  "Scam Watch": "scam-watch",
};

const badgeConfig = {
  verified: { icon: Shield, text: "Verified", className: "text-primary bg-primary/10 border-primary/20" },
  featured: { icon: Award, text: "Featured", className: "text-accent bg-accent/10 border-accent/20" },
  warning: { icon: AlertTriangle, text: "Warning", className: "text-destructive bg-destructive/10 border-destructive/20" },
  none: { icon: Shield, text: "", className: "" },
};

const BrokerTrustHub = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? brokers
    : brokers.filter((b) => b.tags.includes(filterMap[activeFilter]));

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// TRUST HUB</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          Top Verified <span className="text-primary">Brokers</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-8">Every broker scored by real user data — complaints, withdrawal speed, regulation strength.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Broker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((broker) => {
            const badge = badgeConfig[broker.badge];
            const BadgeIcon = badge.icon;
            const scoreColor =
              broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";

            return (
              <div key={broker.slug} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{broker.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      {broker.regulation.map((r) => (
                        <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  {broker.badge !== "none" && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full ${badge.className}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.text}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Avg Spread</div>
                    <div className="text-sm font-mono font-semibold text-foreground">{broker.avgSpread}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Leverage</div>
                    <div className="text-sm font-mono font-semibold text-foreground">{broker.leverage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Min Deposit</div>
                    <div className="text-sm font-mono font-semibold text-foreground">{broker.minDeposit}</div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Trust Score</span>
                    <span className="text-sm font-mono font-bold text-foreground">{broker.score}/10</span>
                  </div>
                  <div className="score-bar">
                    <div className={`score-bar-fill ${scoreColor}`} style={{ width: `${broker.score * 10}%` }} />
                  </div>
                </div>

                {/* Stars & Reviews */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(broker.stars) ? "text-accent fill-accent" : "text-border"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({broker.reviewCount})</span>
                  </div>
                  <a href="#" className="flex items-center gap-1 text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Full review <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {broker.complaints > 20 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {broker.complaints} complaints filed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrokerTrustHub;
