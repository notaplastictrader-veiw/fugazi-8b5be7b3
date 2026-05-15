import { Activity, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  score: number | null | undefined;
  breakdown?: {
    complaints_total?: number;
    complaints_30d?: number;
    scam_alerts?: number;
    avg_rating?: number;
    review_count?: number;
    verified_proofs?: number;
  } | null;
  updatedAt?: string | null;
  compact?: boolean;
  className?: string;
}

function tierFor(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", icon: TrendingUp };
  if (score >= 60) return { label: "Healthy", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: Activity };
  if (score >= 40) return { label: "Watch", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Minus };
  return { label: "Risk", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: TrendingDown };
}

export default function BrokerHealthScore({ score, breakdown, updatedAt, compact = false, className }: Props) {
  if (score == null) return null;
  const s = Number(score);
  const t = tierFor(s);

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono", t.bg, t.color, className)}>
        <t.icon className="h-3 w-3" />
        {s.toFixed(0)} · {t.label}
      </span>
    );
  }

  const stat = (label: string, value: string | number) => (
    <div className="text-center">
      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );

  return (
    <div className={cn("glass-card border p-5", t.border, className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-condensed uppercase tracking-wide text-sm">Broker Health Score™</h3>
        </div>
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest", t.bg, t.color)}>
          {t.label}
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <div className={cn("text-5xl font-bold", t.color)}>{s.toFixed(1)}</div>
        <div className="text-sm text-muted-foreground">/ 100</div>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
        <div
          className={cn("h-full rounded-full transition-all", t.bg.replace("/10", "/60"))}
          style={{ width: `${Math.max(2, Math.min(100, s))}%` }}
        />
      </div>

      {breakdown && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          {stat("Complaints", breakdown.complaints_total ?? 0)}
          {stat("Last 30d", breakdown.complaints_30d ?? 0)}
          {stat("Scam alerts", breakdown.scam_alerts ?? 0)}
          {stat("Avg rating", breakdown.avg_rating ?? "—")}
          {stat("Reviews", breakdown.review_count ?? 0)}
          {stat("Proofs", breakdown.verified_proofs ?? 0)}
        </div>
      )}

      {updatedAt && (
        <p className="mt-3 text-[10px] text-muted-foreground font-mono uppercase tracking-widest text-center">
          Updated {new Date(updatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
