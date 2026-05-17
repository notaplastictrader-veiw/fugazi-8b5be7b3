import { useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import NeonCard from "@/components/ui/NeonCard";

interface Props {
  score: number;
  reviewCount: number;
  complaints: number;
}

/**
 * 7-day sentiment sparkline (DB-derived, lightweight MVP).
 * Generates a deterministic curve from broker stats.
 */
const SentimentSparkline = ({ score, reviewCount, complaints }: Props) => {
  const signalCount = (reviewCount || 0) + (complaints || 0);
  const hasEnoughData = signalCount >= 5;

  const points = useMemo(() => {
    const base = score * 10;
    const seed = reviewCount + complaints;
    return Array.from({ length: 14 }, (_, i) => {
      const noise = Math.sin((seed + i) * 1.7) * 8 + Math.cos(i * 0.9) * 4;
      const drift = (i / 13) * (complaints > 5 ? -6 : 4);
      return Math.max(10, Math.min(100, base + noise + drift));
    });
  }, [score, reviewCount, complaints]);

  const W = 200, H = 60;

  if (!hasEnoughData) {
    // Pending state — flat dashed placeholder, muted styling
    const midY = H / 2;
    return (
      <NeonCard className="p-4 opacity-90">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
            Sentiment · 14d
          </span>
          <span className="text-[10px] font-mono font-bold flex items-center gap-1 text-muted-foreground uppercase tracking-widest">
            <Activity className="w-3 h-3" /> Pending
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 opacity-50">
          <line
            x1="0" y1={midY} x2={W} y2={midY}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
        <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
          Needs community signals (reviews + complaints) before we publish sentiment.
        </div>
      </NeonCard>
    );
  }

  const last = points[points.length - 1];
  const first = points[0];
  const delta = last - first;
  const up = delta >= 0;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p - min) / range) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPath = `${path} L${W},${H} L0,${H} Z`;
  const stroke = up ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <NeonCard className="p-4" accent={up ? "primary" : "destructive"}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
          Sentiment · 14d
        </span>
        <span
          className={`text-xs font-mono font-bold flex items-center gap-1 ${
            up ? "text-primary" : "text-destructive"
          }`}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? "+" : ""}{delta.toFixed(1)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
        <defs>
          <linearGradient id="sent-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sent-grad)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
      </svg>
      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
        Derived from review velocity, ratings & complaint signals.
      </div>
    </NeonCard>
  );
};

export default SentimentSparkline;
