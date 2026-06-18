import { Clock } from "lucide-react";
import { teamShortCode } from "@/lib/teamShortCode";

export interface MatchPredictionCardProps {
  league: string;
  kickoffIso: string;
  teamA: string;
  teamB: string;
  /** Optional pre-computed short codes. Falls back to lookup table. */
  teamAShort?: string;
  teamBShort?: string;
  /** Optional analyst pick — e.g. "Draw", "Canada wins". When omitted, pill hides. */
  prediction?: string;
  /** 0-100. When omitted, bar hides. */
  confidence?: number;
  /** One-line analyst note. */
  note?: string;
  /** Live countdown / status chip (used by Upcoming Matches). */
  countdown?: { label: string; tone: "live" | "soon" | "today" | "future" | "past" };
}

function formatUtcTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return "TBD";
    const t = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    });
    return `${t} UTC`;
  } catch {
    return "TBD";
  }
}

function deriveTone(prediction: string | undefined, teamA: string, teamB: string):
  "win-a" | "win-b" | "draw" | "neutral" {
  if (!prediction) return "neutral";
  const p = prediction.toLowerCase();
  if (p.includes("draw")) return "draw";
  if (teamA && p.includes(teamA.toLowerCase())) return "win-a";
  if (teamB && p.includes(teamB.toLowerCase())) return "win-b";
  return "neutral";
}

const TONE_STYLES = {
  "win-a":   { bar: "bg-primary",     pillBg: "bg-primary/15 text-primary border-primary/30",         barFill: "bg-primary" },
  "win-b":   { bar: "bg-primary",     pillBg: "bg-primary/15 text-primary border-primary/30",         barFill: "bg-primary" },
  "draw":    { bar: "bg-accent",      pillBg: "bg-accent/15 text-accent border-accent/30",            barFill: "bg-accent" },
  "neutral": { bar: "bg-muted-foreground/40", pillBg: "bg-secondary text-foreground border-border",   barFill: "bg-muted-foreground/60" },
} as const;

const COUNTDOWN_TONE: Record<string, string> = {
  live:   "bg-destructive/15 text-destructive border-destructive/30 animate-pulse",
  soon:   "bg-destructive/10 text-destructive border-destructive/30",
  today:  "bg-primary/10 text-primary border-primary/30",
  future: "bg-secondary text-foreground border-border",
  past:   "bg-muted text-muted-foreground border-border",
};

const MatchPredictionCard = ({
  league,
  kickoffIso,
  teamA,
  teamB,
  teamAShort,
  teamBShort,
  prediction,
  confidence,
  note,
  countdown,
}: MatchPredictionCardProps) => {
  const time = formatUtcTime(kickoffIso);
  const tone = deriveTone(prediction, teamA, teamB);
  const styles = TONE_STYLES[tone];
  const codeA = (teamAShort || teamShortCode(teamA)).toUpperCase();
  const codeB = (teamBShort || teamShortCode(teamB)).toUpperCase();
  const conf = typeof confidence === "number" ? Math.max(0, Math.min(100, Math.round(confidence))) : undefined;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 transition-all hover:-translate-y-0.5">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${styles.bar}`} />

      <div className="p-5">
        {/* League + UTC time */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider truncate">
            {league} <span className="opacity-60">•</span> {time}
          </span>
          {countdown && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border tabular-nums ${COUNTDOWN_TONE[countdown.tone]}`}>
              <Clock className="w-3 h-3" /> {countdown.label}
            </span>
          )}
        </div>

        {/* Teams row — short codes, full names, no scores */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-display font-extrabold text-foreground tracking-tight">{codeA}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{teamA}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">vs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-extrabold text-foreground tracking-tight">{codeB}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{teamB}</p>
          </div>
        </div>

        {/* Prediction pill */}
        {prediction && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${styles.pillBg}`}>
              {prediction}
            </span>
          </div>
        )}

        {/* Note */}
        {note && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">{note}</p>
        )}

        {/* Confidence bar */}
        {typeof conf === "number" && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Confidence</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full ${styles.barFill} transition-all`} style={{ width: `${conf}%` }} />
            </div>
            <span className="text-xs font-mono font-bold tabular-nums text-foreground">{conf}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPredictionCard;
