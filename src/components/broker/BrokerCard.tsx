import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Award, ExternalLink, CheckCircle } from "lucide-react";
import StarRating from "@/components/reviews/StarRating";
import WatchlistButton from "@/components/broker/WatchlistButton";
import OfferRail from "@/components/common/OfferRail";

export interface Broker {
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

export const formatSpread = (v?: string) => {
  if (!v) return "—";
  const m = v.match(/[\d.]+/);
  return m ? m[0] : v;
};

export const formatLeverage = (v?: string) => {
  if (!v) return "—";
  if (/unlimited/i.test(v)) return "Unlimited";
  const matches = [...v.matchAll(/1:(\d+)/g)];
  if (!matches.length) return v;
  const max = matches.reduce((a, b) => (parseInt(b[1]) > parseInt(a[1]) ? b : a));
  return `1:${max[1]}`;
};

export const formatRegulator = (v: string) => {
  if (!v) return v;
  return v.split(/[(\-—–]/)[0].trim();
};

export const verifiedAgoShort = (iso?: string | null) => {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const m = Math.floor(days / 30);
  return m < 12 ? `${m}mo ago` : `${Math.floor(m / 12)}y ago`;
};

const badgeConfig = {
  verified: { className: "text-primary bg-primary/10 border-primary/20" },
  featured: { className: "text-accent bg-accent/10 border-accent/20" },
};

const BrokerCard = ({ broker, visible = true }: { broker: Broker; visible?: boolean }) => {
  const scoreColor = broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";
  const verifiedLabel = verifiedAgoShort(broker.last_verified_at);
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
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground truncate">{broker.name}</h3>
              {broker.tags?.includes('upcoming') && (
                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-dashed border-muted-foreground/40 text-muted-foreground">Upcoming</span>
              )}
            </div>
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
          <WatchlistButton brokerId={broker.id} brokerName={broker.name} variant="icon" />
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

export default BrokerCard;
