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

import { formatSpreadNumber, formatLeverageNumber, formatMinDepositNumber } from "@/lib/brokerFormat";
export const formatSpread = formatSpreadNumber;
export const formatLeverage = formatLeverageNumber;

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

const BrokerCard = ({ broker, visible = true }: { broker: Broker; visible?: boolean }) => {
  const scoreColor = broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";
  const railColor = broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";
  const verifiedLabel = verifiedAgoShort(broker.last_verified_at);
  const viewers = 80 + (parseInt((broker.id || "0").replace(/\D/g, "").slice(-3) || "0", 10) % 320);
  const regs = broker.regulation || [];
  const isVerified = broker.badge === "verified" || broker.badge === "featured";

  return (
    <div className="group relative flex bg-card border border-border/60 rounded-sm overflow-hidden hover:border-primary/30 transition-all">
      {/* Side rail */}
      <div className={`w-0.5 shrink-0 ${railColor}`} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              {broker.logo_url ? (
                <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                  <img src={broker.logo_url} alt={`${broker.name} logo`} className="max-w-full max-h-full object-contain" loading="lazy" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-display font-extrabold text-primary">{broker.name.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight leading-none truncate">{broker.name}</h3>
                  {broker.tags?.includes('upcoming') && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-muted/40 text-muted-foreground">Upcoming</span>
                  )}
                </div>
                {regs.length > 0 && (
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5 uppercase tracking-wide truncate" title={regs.join(", ")}>
                    {regs.slice(0, 3).map(formatRegulator).join(" · ")}
                    {regs.length > 3 && (
                      <Link to={`/brokers/${broker.slug}`} className="text-muted-foreground/40 hover:text-primary ml-1">+{regs.length - 3} more</Link>
                    )}
                  </p>
                )}
              </div>
            </div>
            <WatchlistButton brokerId={broker.id} brokerName={broker.name} variant="icon" />
          </div>

          {/* Status row */}
          {(isVerified || broker.badge === "featured") && (
            <div className="flex items-center gap-3 mb-5">
              {isVerified && (
                <span
                  className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 rounded-sm"
                  title="NAFT-vetted: independently verified, not a fugazi"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Not a Fugazi</span>
                </span>
              )}
              {broker.badge === "featured" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-widest">
                  <Award className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Avg Spread</p>
              <p className="font-display text-2xl font-bold text-foreground leading-none truncate" title={broker.avg_spread}>{formatSpread(broker.avg_spread)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Leverage</p>
              <p className="font-display text-2xl font-bold text-foreground leading-none truncate" title={broker.leverage}>{formatLeverage(broker.leverage)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Min Dep.</p>
              <p className="font-display text-2xl font-bold text-foreground leading-none truncate" title={broker.min_deposit}>{broker.min_deposit}</p>
            </div>
          </div>

          {/* Trust Score */}
          <div className="mb-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">Trust Score</span>
              <span className="font-display text-xl font-bold text-primary leading-none">
                {broker.score}<span className="text-muted-foreground/40 text-xs ml-0.5">/10</span>
              </span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
              <div className={`h-full ${scoreColor} rounded-full transition-all duration-700`} style={{ width: visible ? `${broker.score * 10}%` : "0%" }} />
            </div>
          </div>

          {/* Meta line */}
          <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide mt-3">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-primary/70" />
              {verifiedLabel ? `Verified ${verifiedLabel}` : "Verified by NAFT"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary pulse-dot" />
              {viewers} viewing
            </span>
          </div>
        </div>

        {/* Action area */}
        <div className="mt-auto px-5 py-4 border-t border-border/40 bg-foreground/[0.015]">
          {(broker.affiliate_url || broker.website_url) ? (
            <OfferRail
              code={null}
              label={broker.promo_label}
              url={broker.affiliate_url || broker.website_url}
              entityName={broker.name}
            />
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground font-display font-extrabold text-xs tracking-wide uppercase py-2.5 px-3">
              Coming Soon
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <StarRating value={broker.stars} size={14} />
              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase ml-1">({broker.review_count})</span>
            </div>
            {(broker.complaints || 0) > 20 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive uppercase tracking-widest shrink-0">
                <AlertTriangle className="w-3 h-3" /> {broker.complaints} complaints
              </span>
            ) : (broker.review_count || 0) === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-widest shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                NAFT Testing In Progress
              </span>
            ) : (
              <Link
                to={`/brokers/${broker.slug}`}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-foreground/70 hover:text-primary uppercase tracking-widest transition-colors shrink-0 group/link"
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

export default BrokerCard;
