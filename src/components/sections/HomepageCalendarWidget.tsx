import { Link } from "react-router-dom";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEconomicCalendar } from "@/hooks/useEconomicCalendar";

const HomepageCalendarWidget = () => {
  const { events, loading } = useEconomicCalendar();

  if (loading) return null;

  const todayUtc = new Date().toISOString().slice(0, 10);
  const todaysHigh = events
    .filter((e) => e.event_date === todayUtc && e.impact === "high")
    .sort((a, b) => (a.event_time ?? "").localeCompare(b.event_time ?? ""))
    .slice(0, 3);

  if (todaysHigh.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-destructive/10 text-destructive mb-3">
            🔥 HIGH-IMPACT TODAY
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Today's Market <span className="text-primary">Movers</span>
          </h2>
        </div>
        <Link
          to="/calendar"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-mono text-primary hover:underline"
        >
          Full calendar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {todaysHigh.map((e) => (
          <Link
            key={e.id}
            to="/calendar"
            className="glass-card rounded-xl p-4 border-l-4 border-l-destructive hover:border-primary/40 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge className="text-[9px] font-mono bg-destructive/15 text-destructive">HIGH</Badge>
              <Badge className="text-[9px] font-mono bg-secondary text-secondary-foreground">
                {e.currency}
              </Badge>
              {e.ml_prediction && (
                <Badge className="text-[9px] font-mono bg-primary/10 text-primary">
                  ML: {e.ml_prediction}
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-foreground text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
              {e.name}
            </h3>
            <div className="flex items-center justify-between text-xs">
              {e.event_time && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> {e.event_time} UTC
                </span>
              )}
              <div className="flex gap-2">
                {e.forecast && (
                  <span className="text-muted-foreground">
                    F: <span className="text-foreground font-semibold">{e.forecast}</span>
                  </span>
                )}
                {e.previous && (
                  <span className="text-muted-foreground">
                    P: <span className="text-foreground font-semibold">{e.previous}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/calendar"
        className="sm:hidden flex items-center justify-center gap-1 text-sm font-mono text-primary hover:underline mt-4"
      >
        Full calendar <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
};

export default HomepageCalendarWidget;
