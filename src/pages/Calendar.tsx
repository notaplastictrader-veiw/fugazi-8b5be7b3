import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEconomicCalendar, type EconomicCalendarEvent } from "@/hooks/useEconomicCalendar";
import EventDetailModal from "@/components/calendar/EventDetailModal";

const MAJORS = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];
const TZ_KEY = "naft-calendar-tz";

const impactStyles: Record<string, { bg: string; dot: string; border: string }> = {
  high: { bg: "bg-destructive/15 text-destructive", dot: "bg-destructive", border: "border-l-destructive" },
  medium: { bg: "bg-accent/15 text-accent", dot: "bg-accent", border: "border-l-accent" },
  low: { bg: "bg-muted-foreground/15 text-muted-foreground", dot: "bg-muted-foreground", border: "border-l-transparent" },
};

function adjustForTz(e: EconomicCalendarEvent, tz: "UTC" | "Local") {
  if (tz === "UTC" || !e.date) return { date: e.event_date, time: e.event_time };
  try {
    const d = new Date(e.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: e.event_time ? `${hh}:${mi}` : null,
    };
  } catch {
    return { date: e.event_date, time: e.event_time };
  }
}

const Calendar = () => {
  const [dbEvents, setDbEvents] = useState<EconomicCalendarEvent[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [impactFilter, setImpactFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState<"today" | "tomorrow" | "week">("week");
  const [timezone, setTimezone] = useState<"UTC" | "Local">("UTC");
  const [selected, setSelected] = useState<EconomicCalendarEvent | null>(null);
  const { events: liveEvents, loading: loadingLive, lastUpdated } = useEconomicCalendar();

  // Restore tz preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TZ_KEY);
      if (stored === "Local" || stored === "UTC") setTimezone(stored);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(TZ_KEY, timezone); } catch {}
  }, [timezone]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending: true });
      const mapped: EconomicCalendarEvent[] = (data ?? []).map((d: any) => ({
        id: `db-${d.id}`,
        name: d.title,
        title: d.title,
        date: d.event_time
          ? `${d.event_date}T${d.event_time}:00.000Z`
          : `${d.event_date}T00:00:00.000Z`,
        event_date: d.event_date,
        event_time: d.event_time,
        impact: (d.impact ?? "low") as "high" | "medium" | "low",
        currency: (d.currency ?? "").toUpperCase(),
        category: d.category ?? "economic",
        description: d.description ?? "",
        actual: d.actual_value ?? "",
        forecast: d.forecast_value ?? "",
        previous: d.previous_value ?? "",
        actual_value: d.actual_value ?? "",
        forecast_value: d.forecast_value ?? "",
        previous_value: d.previous_value ?? "",
      }));
      setDbEvents(mapped);
      setLoadingDb(false);
    };
    load();
  }, []);

  // Merge — manual DB events win on duplicate (same date + name)
  const merged = useMemo(() => {
    const seen = new Set(dbEvents.map((e) => `${e.event_date}::${e.name.toLowerCase()}`));
    return [
      ...dbEvents,
      ...liveEvents.filter((e) => !seen.has(`${e.event_date}::${e.name.toLowerCase()}`)),
    ];
  }, [dbEvents, liveEvents]);

  const loading = loadingDb && loadingLive && merged.length === 0;

  const { grouped, dateKeys } = useMemo(() => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const todayStr = todayUtc.toISOString().slice(0, 10);
    const tomorrow = new Date(todayUtc.getTime() + 86400000).toISOString().slice(0, 10);
    const weekEnd = new Date(todayUtc.getTime() + 7 * 86400000).toISOString().slice(0, 10);

    const filtered = merged.filter((e) => {
      if (impactFilter !== "all" && e.impact !== impactFilter) return false;
      if (currencyFilter !== "all" && e.currency !== currencyFilter) return false;
      const adj = adjustForTz(e, timezone);
      if (rangeFilter === "today" && adj.date !== todayStr) return false;
      if (rangeFilter === "tomorrow" && adj.date !== tomorrow) return false;
      if (rangeFilter === "week" && (adj.date < todayStr || adj.date > weekEnd)) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aa = adjustForTz(a, timezone);
      const bb = adjustForTz(b, timezone);
      if (aa.date !== bb.date) return aa.date.localeCompare(bb.date);
      return (aa.time ?? "").localeCompare(bb.time ?? "");
    });

    const g: Record<string, EconomicCalendarEvent[]> = {};
    for (const e of sorted) {
      const k = adjustForTz(e, timezone).date;
      (g[k] ||= []).push(e);
    }
    return { grouped: g, dateKeys: Object.keys(g) };
  }, [merged, impactFilter, currencyFilter, rangeFilter, timezone]);

  const formatDateHeader = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((date.getTime() - today.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  };

  const updatedAgo = useMemo(() => {
    if (!lastUpdated) return "Loading…";
    const min = Math.max(1, Math.round((Date.now() - lastUpdated) / 60000));
    if (min < 60) return `Updated ${min} min ago`;
    const hr = Math.round(min / 60);
    return `Updated ${hr}h ago`;
  }, [lastUpdated]);

  return (
    <MainLayout>
      <SEO
        title="Economic Calendar — Forex Events & ML Sentiment"
        description="Live forex economic calendar with high-impact events, ML sentiment, timezone toggle, and currency filters. NFP, CPI, ECB, FOMC."
        path="/calendar"
      />
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            📅 ECONOMIC CALENDAR
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">Calendar</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
            Track high-impact events and ML-powered sentiment for the 8 majors. Plan trades around the data.
          </p>
          <p className="text-xs font-mono text-muted-foreground/70">{updatedAgo}</p>
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-[92px] z-20 bg-background/85 backdrop-blur-md border border-border rounded-2xl p-3 mb-6 space-y-3">
          {/* Range + Timezone row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {([
                ["today", "Today"],
                ["tomorrow", "Tomorrow"],
                ["week", "This Week"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRangeFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all ${
                    rangeFilter === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTimezone(timezone === "UTC" ? "Local" : "UTC")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-secondary text-foreground hover:bg-primary/10 hover:text-primary transition-all"
              title="Toggle timezone"
            >
              <Globe className="w-3 h-3" />
              {timezone === "UTC" ? "UTC" : "Local"}
            </button>
          </div>

          {/* Impact filter */}
          <div className="flex flex-wrap gap-1.5">
            {["all", "high", "medium", "low"].map((level) => (
              <button
                key={level}
                onClick={() => setImpactFilter(level)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase transition-all ${
                  impactFilter === level
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {level === "all" ? "All Impact" : level}
              </button>
            ))}
          </div>

          {/* Currency filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCurrencyFilter("all")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase transition-all ${
                currencyFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {MAJORS.map((c) => (
              <button
                key={c}
                onClick={() => setCurrencyFilter(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase transition-all ${
                  currencyFilter === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 min-h-[400px]">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : dateKeys.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground min-h-[400px]">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No events match your filters.</p>
          </div>
        ) : (
          <div className="space-y-8 min-h-[400px]">
            {dateKeys.map((date) => (
              <div key={date}>
                <h3 className="text-sm font-mono font-semibold text-primary mb-3 sticky top-[260px] bg-background/80 backdrop-blur-sm py-2 z-10">
                  {formatDateHeader(date)}
                </h3>
                <div className="space-y-3">
                  {grouped[date].map((e) => {
                    const style = impactStyles[e.impact] || impactStyles.low;
                    const adj = adjustForTz(e, timezone);
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelected(e)}
                        className={`w-full text-left glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary/30 hover:scale-[1.005] transition-all border-l-4 ${style.border}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-sm">{e.name}</span>
                              <Badge className={`text-[9px] font-mono ${style.bg}`}>{e.impact.toUpperCase()}</Badge>
                              <Badge className="text-[9px] font-mono bg-secondary text-secondary-foreground">{e.currency}</Badge>
                              {e.ml_prediction && (
                                <Badge className="text-[9px] font-mono bg-primary/10 text-primary">
                                  ML: {e.ml_prediction}
                                </Badge>
                              )}
                            </div>
                            {e.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs flex-shrink-0">
                          {adj.time && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" /> {adj.time} {timezone === "UTC" ? "UTC" : ""}
                            </span>
                          )}
                          <div className="flex gap-3">
                            {e.forecast && (
                              <span className="text-muted-foreground">
                                <span className="text-[10px] block opacity-60">Forecast</span>
                                <span className="font-semibold text-foreground">{e.forecast}</span>
                              </span>
                            )}
                            {e.previous && (
                              <span className="text-muted-foreground">
                                <span className="text-[10px] block opacity-60">Previous</span>
                                <span className="font-semibold text-foreground">{e.previous}</span>
                              </span>
                            )}
                            {e.actual && (
                              <span className="text-muted-foreground">
                                <span className="text-[10px] block opacity-60">Actual</span>
                                <span className="font-bold text-primary">{e.actual}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <EventDetailModal
          event={selected}
          open={selected !== null}
          onOpenChange={(o) => !o && setSelected(null)}
          timezone={timezone}
        />
      </section>
    </MainLayout>
  );
};

export default Calendar;
