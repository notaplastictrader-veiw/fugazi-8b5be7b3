import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, AlertTriangle, Star, Zap } from "lucide-react";
import type { BettingSite } from "@/data/bettingSites";

const BettingSiteCard = forwardRef<HTMLDivElement, { site: BettingSite }>(({ site }, ref) => {
  return (
    <div ref={ref} className="glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {site.logo && /^https?:\/\//.test(site.logo) ? (
            <img
              src={site.logo}
              alt={`${site.name} logo`}
              className="w-10 h-10 rounded-lg object-contain bg-background/40 p-1"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                const fb = t.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className={
              site.logo && /^https?:\/\//.test(site.logo)
                ? "w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold items-center justify-center hidden"
                : "text-3xl"
            }
            style={site.logo && /^https?:\/\//.test(site.logo) ? { display: "none" } : undefined}
          >
            {site.logo && /^https?:\/\//.test(site.logo) ? site.name.charAt(0) : site.logo}
          </span>
          <div>
            <h3 className="text-lg font-bold text-foreground">{site.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" /> {site.license}
            </div>
          </div>
        </div>
        <div className="text-right">
          {site.rating > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-lg font-extrabold text-foreground">{site.rating}</span>
              <span className="text-xs text-muted-foreground">/10</span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              NAFT Testing In Progress
            </span>
          )}
        </div>
      </div>

      <div className="bg-primary/10 rounded-xl p-3 text-center">
        <p className="text-[10px] text-muted-foreground uppercase font-mono">Welcome Bonus</p>
        <p className="text-sm font-bold text-primary">{site.bonus}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {site.features.map((f) => (
          <Badge key={f} variant="secondary" className="text-[10px] font-mono">
            <Zap className="w-2.5 h-2.5 mr-0.5" /> {f}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground font-mono uppercase text-[10px]">Min Deposit</p>
          <p className="font-semibold text-foreground">{site.min_deposit}</p>
        </div>
        <div>
          <p className="text-muted-foreground font-mono uppercase text-[10px]">Withdrawals</p>
          <p className="font-semibold text-foreground">{site.withdrawal_speed}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {site.sports.map((s) => (
          <span key={s} className="text-[10px] font-mono text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      {site.warning && (
        <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-2.5 text-xs text-destructive">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{site.warning}</span>
        </div>
      )}

      <Button className="w-full mt-auto" size="sm" asChild>
        <a href={site.url} target="_blank" rel="noopener noreferrer">
          Visit {site.name} <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </Button>
    </div>
  );
});

BettingSiteCard.displayName = "BettingSiteCard";

export default BettingSiteCard;
