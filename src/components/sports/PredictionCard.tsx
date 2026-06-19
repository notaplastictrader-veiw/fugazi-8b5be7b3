import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";
import PredictionResultStamp from "./PredictionResultStamp";

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
  isLive?: boolean;
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

const getRiskLevel = (confidence: number) => {
  if (confidence >= 75) return { label: "Risk", color: "text-primary" };
  if (confidence >= 55) return { label: "Risk", color: "text-accent" };
  return { label: "Risk", color: "text-destructive" };
};

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
  return raw.replace(/\b(1x|x2|12|btts|o\d(?:\.\d)?|u\d(?:\.\d)?)\b/gi, (m) => MARKET_LABELS[m.toLowerCase()] || m);
}

const PredictionCard = ({ prediction: p }: { prediction: Prediction }) => {
  const isPast = !!p.result;
  const roi = getRoiPotential(p.confidence);
  const risk = getRiskLevel(p.confidence);

  return (
    <div className={`relative overflow-hidden glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-primary/20 ${isPast ? "opacity-95" : ""}`}>
      {isPast && p.is_correct !== null && (
        <PredictionResultStamp variant={p.is_correct ? "winner" : "loser"} />
      )}
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
          {!isPast && p.isLive === true && (
            <Badge className="bg-destructive/20 text-destructive text-[10px] font-mono animate-pulse">
              🔴 LIVE
            </Badge>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-mono">{p.title}</p>

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

      {isPast && (
        <div className="flex items-center justify-end text-[10px] text-muted-foreground">
          <span className="font-semibold text-foreground">Result: {p.result}</span>
        </div>
      )}
    </div>
  );
};

export default PredictionCard;
export type { Prediction };
