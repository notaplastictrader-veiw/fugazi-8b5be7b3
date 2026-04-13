import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, AlertTriangle, Star, Zap } from "lucide-react";
import type { BettingSite } from "@/data/bettingSites";

const BettingSiteCard = ({ site }: { site: BettingSite }) => {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{site.logo}</span>
          <div>
            <h3 className="text-lg font-bold text-foreground">{site.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" /> {site.license}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-lg font-extrabold text-foreground">{site.rating}</span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
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
};

export default BettingSiteCard;
