import { forwardRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Shield,
  AlertTriangle,
  Star,
  Zap,
  Eye,
  Check,
  X,
  Clock,
  Wallet,
  Trophy,
  Gauge,
} from "lucide-react";
import type { BettingSite } from "@/data/bettingSites";

const BettingSiteCard = forwardRef<HTMLDivElement, { site: BettingSite }>(({ site }, ref) => {
  const [open, setOpen] = useState(false);

  // 3-second decision verdict
  const verdict = (() => {
    if (site.warning) return { label: "Caution Advised", tone: "destructive" as const };
    if (site.rating >= 8.5) return { label: "Top Pick", tone: "primary" as const };
    if (site.rating >= 7) return { label: "Recommended", tone: "primary" as const };
    if (site.rating > 0) return { label: "Average", tone: "muted" as const };
    return { label: "Under Review", tone: "muted" as const };
  })();

  // Auto-derived quick pros/cons
  const pros: string[] = [];
  const cons: string[] = [];
  if (site.rating >= 8) pros.push(`Strong community rating (${site.rating}/10)`);
  if (site.bonus && site.bonus !== "—") pros.push(`Welcome bonus: ${site.bonus}`);
  if (site.license && !/unlicensed|none|n\/a/i.test(site.license)) pros.push(`Licensed: ${site.license}`);
  if (site.withdrawal_speed && /instant|hour|same day|1-3|24h/i.test(site.withdrawal_speed))
    pros.push(`Fast withdrawals (${site.withdrawal_speed})`);
  if (site.features?.length) pros.push(`${site.features.length}+ standout features`);

  if (site.warning) cons.push(site.warning);
  if (site.rating > 0 && site.rating < 6) cons.push("Below-average user rating");
  if (!site.license || /unlicensed|none|n\/a/i.test(site.license || "")) cons.push("License status unclear");
  if (site.withdrawal_speed && /slow|5-7|week|delay/i.test(site.withdrawal_speed))
    cons.push(`Slower withdrawals (${site.withdrawal_speed})`);

  if (pros.length === 0) pros.push("Full review coming soon — basics look standard");
  if (cons.length === 0) cons.push("No major red flags reported yet");

  return (
    <>
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

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            aria-label={`Quick overview of ${site.name}`}
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> Quick Overview
          </Button>
          <Button size="sm" asChild>
            <a href={site.url} target="_blank" rel="noopener noreferrer">
              Visit <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {site.name}
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                  verdict.tone === "primary"
                    ? "bg-primary/15 text-primary"
                    : verdict.tone === "destructive"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {verdict.label}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              3-second snapshot — decide fast, then dig deeper on their site.
            </DialogDescription>
          </DialogHeader>

          {/* Snapshot grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-secondary/40 rounded-lg p-2.5">
              <p className="flex items-center gap-1 text-muted-foreground font-mono uppercase text-[10px]">
                <Gauge className="w-3 h-3" /> Rating
              </p>
              <p className="font-bold text-foreground">
                {site.rating > 0 ? `${site.rating} / 10` : "Under review"}
              </p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-2.5">
              <p className="flex items-center gap-1 text-muted-foreground font-mono uppercase text-[10px]">
                <Shield className="w-3 h-3" /> License
              </p>
              <p className="font-bold text-foreground">{site.license || "—"}</p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-2.5">
              <p className="flex items-center gap-1 text-muted-foreground font-mono uppercase text-[10px]">
                <Wallet className="w-3 h-3" /> Min Deposit
              </p>
              <p className="font-bold text-foreground">{site.min_deposit || "—"}</p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-2.5">
              <p className="flex items-center gap-1 text-muted-foreground font-mono uppercase text-[10px]">
                <Clock className="w-3 h-3" /> Withdrawals
              </p>
              <p className="font-bold text-foreground">{site.withdrawal_speed || "—"}</p>
            </div>
          </div>

          {/* Bonus */}
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Welcome Bonus</p>
            <p className="text-sm font-bold text-primary">{site.bonus || "—"}</p>
          </div>

          {/* Sports */}
          {site.sports?.length > 0 && (
            <div>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
                <Trophy className="w-3 h-3" /> Sports Covered
              </p>
              <div className="flex flex-wrap gap-1">
                {site.sports.map((s) => (
                  <span key={s} className="text-[10px] font-mono text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
              <p className="text-[10px] font-mono uppercase text-primary mb-2">Pros</p>
              <ul className="space-y-1.5 text-xs">
                {pros.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-foreground">
                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" /> <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-destructive/5 border border-destructive/15 rounded-lg p-3">
              <p className="text-[10px] font-mono uppercase text-destructive mb-2">Cons</p>
              <ul className="space-y-1.5 text-xs">
                {cons.slice(0, 4).map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-foreground">
                    <X className="w-3 h-3 text-destructive shrink-0 mt-0.5" /> <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {site.warning && (
            <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-2.5 text-xs text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{site.warning}</span>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground font-mono text-center">
            Full editorial review coming soon. Snapshot built from verified site data.
          </p>

          <Button asChild className="w-full">
            <a href={site.url} target="_blank" rel="noopener noreferrer">
              Visit {site.name} <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
});

BettingSiteCard.displayName = "BettingSiteCard";

export default BettingSiteCard;
