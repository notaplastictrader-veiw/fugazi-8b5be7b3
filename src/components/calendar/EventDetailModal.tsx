import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Clock } from "lucide-react";
import type { EconomicCalendarEvent } from "@/hooks/useEconomicCalendar";

interface Props {
  event: EconomicCalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timezone: "UTC" | "Local";
}

const impactColor: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-accent/15 text-accent border-accent/30",
  low: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
};

const mlColor: Record<string, string> = {
  Bullish: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Bearish: "bg-destructive/15 text-destructive border-destructive/30",
  Neutral: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
};

const mlIcon = {
  Bullish: TrendingUp,
  Bearish: TrendingDown,
  Neutral: Minus,
};

function formatTime(iso: string, tz: "UTC" | "Local") {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz === "UTC" ? "UTC" : undefined,
      timeZoneName: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export default function EventDetailModal({ event, open, onOpenChange, timezone }: Props) {
  if (!event) return null;
  const ml = event.ml_prediction;
  const MlIcon = ml ? mlIcon[ml] : null;
  const ffSearchUrl = `https://www.forexfactory.com/calendar?day=${event.event_date}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glass-card">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className={`text-[10px] font-mono border ${impactColor[event.impact]}`}>
              {event.impact.toUpperCase()} IMPACT
            </Badge>
            <Badge className="text-[10px] font-mono bg-secondary text-secondary-foreground">
              {event.currency}
            </Badge>
            {ml && MlIcon && (
              <Badge className={`text-[10px] font-mono border inline-flex items-center gap-1 ${mlColor[ml]}`}>
                <MlIcon className="w-3 h-3" /> ML: {ml}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-display font-bold leading-tight">
            {event.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.date, timezone)}</span>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Previous</div>
              <div className="font-bold text-foreground">{event.previous || "—"}</div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Forecast</div>
              <div className="font-bold text-foreground">{event.forecast || "—"}</div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
              <div className="text-[10px] uppercase font-mono text-primary mb-1">Actual</div>
              <div className="font-bold text-primary">{event.actual || "—"}</div>
            </div>
          </div>

          <a
            href={ffSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline pt-2"
          >
            View on Forex Factory <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
