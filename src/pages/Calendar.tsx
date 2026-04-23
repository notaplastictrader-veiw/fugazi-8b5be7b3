import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEconomicCalendar } from "@/hooks/useEconomicCalendar";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  impact: string;
  currency: string;
  category: string;
  actual_value: string;
  forecast_value: string;
  previous_value: string;
}

const fallbackEvents: CalendarEvent[] = [
  { id: "1", title: "US Non-Farm Payrolls", description: "Monthly employment change in the US non-farm sector.", event_date: "2026-04-14", event_time: "13:30", impact: "high", currency: "USD", category: "economic", actual_value: "", forecast_value: "185K", previous_value: "175K" },
  { id: "2", title: "ECB Interest Rate Decision", description: "European Central Bank monetary policy decision.", event_date: "2026-04-15", event_time: "12:45", impact: "high", currency: "EUR", category: "economic", actual_value: "", forecast_value: "3.75%", previous_value: "4.00%" },
  { id: "3", title: "UK CPI (YoY)", description: "Year-over-year Consumer Price Index for the United Kingdom.", event_date: "2026-04-16", event_time: "07:00", impact: "medium", currency: "GBP", category: "economic", actual_value: "", forecast_value: "3.2%", previous_value: "3.4%" },
  { id: "4", title: "US Crude Oil Inventories", description: "Weekly change in US crude oil stockpiles.", event_date: "2026-04-16", event_time: "15:30", impact: "medium", currency: "USD", category: "economic", actual_value: "", forecast_value: "-1.2M", previous_value: "+0.8M" },
  { id: "5", title: "FOMC Meeting Minutes", description: "Detailed minutes from the latest Federal Reserve meeting.", event_date: "2026-04-17", event_time: "19:00", impact: "high", currency: "USD", category: "economic", actual_value: "", forecast_value: "", previous_value: "" },
  { id: "6", title: "Japan GDP (QoQ)", description: "Japan's quarterly GDP growth rate.", event_date: "2026-04-18", event_time: "00:50", impact: "medium", currency: "JPY", category: "economic", actual_value: "", forecast_value: "0.3%", previous_value: "0.1%" },
  { id: "7", title: "Australia Employment Change", description: "Monthly change in employed persons in Australia.", event_date: "2026-04-18", event_time: "02:30", impact: "medium", currency: "AUD", category: "economic", actual_value: "", forecast_value: "+25K", previous_value: "+18K" },
  { id: "8", title: "Canada Retail Sales (MoM)", description: "Monthly retail sales growth in Canada.", event_date: "2026-04-19", event_time: "13:30", impact: "low", currency: "CAD", category: "economic", actual_value: "", forecast_value: "0.5%", previous_value: "0.3%" },
];

const impactStyles: Record<string, { bg: string; dot: string }> = {
  high: { bg: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
  medium: { bg: "bg-accent/15 text-accent", dot: "bg-accent" },
  low: { bg: "bg-muted-foreground/15 text-muted-foreground", dot: "bg-muted-foreground" },
};

const Calendar = () => {
  const [dbEvents, setDbEvents] = useState<CalendarEvent[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [impactFilter, setImpactFilter] = useState("all");
  const { events: liveEvents, loading: loadingLive } = useEconomicCalendar();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending: true });
      setDbEvents(data ?? []);
      setLoadingDb(false);
    };
    load();
  }, []);

  // Merge: DB events take priority on duplicate (same title + date)
  const seen = new Set(dbEvents.map((e) => `${e.event_date}::${e.title.toLowerCase()}`));
  const merged: CalendarEvent[] = [
    ...dbEvents,
    ...liveEvents.filter(
      (e) => !seen.has(`${e.event_date}::${e.title.toLowerCase()}`),
    ),
  ];
  const events = merged.length > 0 ? merged : fallbackEvents;
  const loading = loadingDb && loadingLive && events.length === 0;

  const filtered = impactFilter === "all" ? events : events.filter((e) => e.impact === impactFilter);

  // Group by date
  const grouped = filtered.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const d = e.event_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = date.getTime() - today.getTime();
    const days = Math.round(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  return (
    <MainLayout>
      <SEO
        title="Economic Calendar"
        description="Forex economic calendar with high-impact events, GDP, CPI, NFP, and central bank decisions. Filter by impact and currency."
        path="/calendar"
      />
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            📅 ECONOMIC CALENDAR
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">Calendar</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track high-impact economic events that move the markets. Plan your trades around key data releases.
          </p>
        </div>

        {/* Impact Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {["all", "high", "medium", "low"].map((level) => (
            <button
              key={level}
              onClick={() => setImpactFilter(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all ${impactFilter === level ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {level === "all" ? "All Events" : `${level} Impact`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No events scheduled.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, evts]) => (
              <div key={date}>
                <h3 className="text-sm font-mono font-semibold text-primary mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                  {formatDate(date)}
                </h3>
                <div className="space-y-3">
                  {evts.map((e) => {
                    const style = impactStyles[e.impact] || impactStyles.low;
                    return (
                      <div key={e.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-sm">{e.title}</span>
                              <Badge className={`text-[9px] font-mono ${style.bg}`}>{e.impact.toUpperCase()}</Badge>
                              <Badge className="text-[9px] font-mono bg-secondary text-secondary-foreground">{e.currency}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs flex-shrink-0">
                          {e.event_time && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" /> {e.event_time} UTC
                            </span>
                          )}
                          <div className="flex gap-3">
                            {e.forecast_value && (
                              <span className="text-muted-foreground">
                                <span className="text-[10px] block opacity-60">Forecast</span>
                                <span className="font-semibold text-foreground">{e.forecast_value}</span>
                              </span>
                            )}
                            {e.previous_value && (
                              <span className="text-muted-foreground">
                                <span className="text-[10px] block opacity-60">Previous</span>
                                <span className="font-semibold text-foreground">{e.previous_value}</span>
                              </span>
                            )}
                            {e.actual_value && (
                              <span className="text-muted-foreground">
                                <span className="text-[10px] block opacity-60">Actual</span>
                                <span className="font-bold text-primary">{e.actual_value}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default Calendar;
