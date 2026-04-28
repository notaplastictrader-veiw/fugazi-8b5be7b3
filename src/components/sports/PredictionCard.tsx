import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface Prediction {
  id: string;
  title: string;
  sport: string;
  team_a: string;
  team_b: string;
  match_date: string;
  prediction: string;
  confidence: number;
  analyst_note: string;
  result: string;
  is_correct: boolean | null;
}

const sportIcons: Record<string, string> = { football: "⚽", cricket: "🏏", basketball: "🏀", tennis: "🎾", mma: "🥊" };
const sportColors: Record<string, string> = {
  football: "bg-primary/20 text-primary",
  cricket: "bg-accent/20 text-accent",
  basketball: "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  tennis: "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  mma: "bg-[hsl(var(--purple))]/20 text-[hsl(var(--purple))]",
};

const getRoiPotential = (confidence: number) => {
  if (confidence >= 75) return { label: "HIGH ROI", color: "bg-primary/20 text-primary" };
  if (confidence >= 55) return { label: "MED ROI", color: "bg-accent/20 text-accent" };
  return { label: "LOW ROI", color: "bg-muted text-muted-foreground" };
};

const getRiskLevel = (_confidence: number) => ({ label: "Risk", color: "text-muted-foreground" });

const MARKET_LABELS: Record<string, string> = {
  "1": "Home Win",
  "2": "Away Win",
  "x": "Draw",
  "1x": "Home or Draw",
  "12": "Home or Away (No Draw)",
  "x2": "Draw or Away",
  "btts": "Both Teams to Score",
  "btts yes": "Both Teams to Score",
  "btts no": "No — Both Teams Won't Score",
  "o2.5": "Over 2.5 Goals",
  "u2.5": "Under 2.5 Goals",
  "over 2.5": "Over 2.5 Goals",
  "under 2.5": "Under 2.5 Goals",
  "o1.5": "Over 1.5 Goals",
  "u1.5": "Under 1.5 Goals",
};

function humanizePick(raw: string): string {
  if (!raw) return raw;
  const key = raw.trim().toLowerCase();
  if (MARKET_LABELS[key]) return MARKET_LABELS[key];
  // try to translate inline tokens like "Market: 12 · Odds ..."
  return raw.replace(/\b(1x|x2|12|btts|o\d(?:\.\d)?|u\d(?:\.\d)?)\b/gi, (m) => MARKET_LABELS[m.toLowerCase()] || m);
}

type MatchPhase =
  | { kind: "past" }
  | { kind: "live" }
  | { kind: "awaiting" }
  | { kind: "soon"; label: string }
  | { kind: "future"; label: string };

const LIVE_WINDOW_MS = 3 * 60 * 60_000; // 3 hours

function formatMatchTime(date: Date): string {
  const t = date.getTime();
  if (!Number.isFinite(t)) return "TBD";
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
  const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  if (dayDiff === 0) return `Today · ${time}`;
  if (dayDiff === 1) return `Tomorrow · ${time}`;
  if (dayDiff === -1) return `Yesterday · ${time}`;
  const datePart = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(date);
  return `${datePart} · ${time}`;
}

function getPhase(matchTime: Date, now: number, isPast: boolean): MatchPhase {
  if (isPast) return { kind: "past" };
  const target = matchTime.getTime();
  if (!Number.isFinite(target)) return { kind: "future", label: "TBD" };
  const diff = target - now;
  if (diff <= -LIVE_WINDOW_MS) return { kind: "awaiting" };
  if (diff <= 0) return { kind: "live" };
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (diff <= 5 * 60_000) return { kind: "soon", label: `${minutes}m ${seconds.toString().padStart(2, "0")}s` };
  if (days > 0) return { kind: "future", label: `in ${days}d ${hours}h` };
  if (hours > 0) return { kind: "future", label: `in ${hours}h ${minutes.toString().padStart(2, "0")}m` };
  return { kind: "future", label: `in ${minutes}m ${seconds.toString().padStart(2, "0")}s` };
}

const PredictionCard = ({ prediction: p }: { prediction: Prediction }) => {
  const isPast = !!p.result;
  const matchTime = new Date(p.match_date);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (isPast) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isPast]);
  const phase = getPhase(matchTime, now, isPast);
  const roi = getRoiPotential(p.confidence);
  const risk = getRiskLevel(p.confidence);

  return (
    <div className={`glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-primary/20 ${isPast ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between">
        <Badge className={`text-[10px] font-mono uppercase ${sportColors[p.sport] || "bg-muted text-muted-foreground"}`}>
          {sportIcons[p.sport]} {p.sport}
        </Badge>
        <div className="flex items-center gap-1.5">
          {!isPast && (
            <Badge className={`text-[10px] font-mono ${roi.color}`}>
              <TrendingUp className="w-3 h-3 mr-0.5" /> {roi.label}
            </Badge>
          )}
          {isPast && p.is_correct !== null && (
            p.is_correct ? (
              <Badge className="bg-primary/20 text-primary text-[10px] font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> CORRECT
              </Badge>
            ) : (
              <Badge className="bg-destructive/20 text-destructive text-[10px] font-mono flex items-center gap-1">
                <XCircle className="w-3 h-3" /> WRONG
              </Badge>
            )
          )}
          {phase.kind === "live" && (
            <Badge className="bg-destructive/20 text-destructive text-[10px] font-mono animate-pulse">
              🔴 LIVE
            </Badge>
          )}
          {phase.kind === "soon" && (
            <Badge className="bg-accent/20 text-accent text-[10px] font-mono tabular-nums">
              <Clock className="w-3 h-3 mr-0.5" /> STARTS IN {phase.label}
            </Badge>
          )}
          {phase.kind === "future" && (
            <Badge className="bg-secondary text-foreground border border-border text-[10px] font-mono tabular-nums">
              <Clock className="w-3 h-3 mr-0.5" /> {phase.label}
            </Badge>
          )}
          {phase.kind === "awaiting" && (
            <Badge className="bg-muted text-muted-foreground text-[10px] font-mono">
              Awaiting result
            </Badge>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-mono">{p.title}</p>
      <p className="text-[10px] text-muted-foreground/80 font-mono flex items-center gap-1 -mt-2">
        <Clock className="w-3 h-3" /> {formatMatchTime(matchTime)}
      </p>

      <div className="flex items-center justify-center gap-4">
        <span className="text-base font-bold text-foreground text-right flex-1">{p.team_a}</span>
        <span className="text-xs text-muted-foreground font-mono px-3 py-1 rounded bg-secondary">VS</span>
        <span className="text-base font-bold text-foreground text-left flex-1">{p.team_b}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Our Pick</p>
          <p className="text-sm font-bold text-primary">{humanizePick(p.prediction)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Confidence</p>
          <p className={`text-sm font-bold ${p.confidence >= 70 ? "text-primary" : p.confidence >= 50 ? "text-accent" : "text-destructive"}`}>
            {p.confidence}%
          </p>
        </div>
      </div>

      {/* Risk Warning */}
      {!isPast && (
        <div className={`flex items-center gap-1.5 text-[10px] font-mono ${risk.color}`}>
          <AlertTriangle className="w-3 h-3" />
          <span>{risk.label} — Betting involves financial risk. Never bet more than you can afford to lose.</span>
        </div>
      )}

      {p.analyst_note && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
          💡 {humanizePick(p.analyst_note)}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {matchTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {matchTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {isPast && <span className="font-semibold text-foreground">Result: {p.result}</span>}
      </div>
    </div>
  );
};

export default PredictionCard;
export type { Prediction };
