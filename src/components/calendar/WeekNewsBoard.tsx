import { useMemo, useState } from "react";
import { useEconomicCalendar, type EconomicCalendarEvent } from "@/hooks/useEconomicCalendar";
import { useTheme } from "@/hooks/useTheme";
import EventDetailModal from "@/components/calendar/EventDetailModal";

const FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺",
  CAD: "🇨🇦", CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];

function getCurrentWeekMonToFri(): string[] {
  const now = new Date();
  const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = utc.getUTCDay(); // 0=Sun..6=Sat
  const daysBack = dow === 0 ? 6 : dow - 1;
  const monday = new Date(utc.getTime() - daysBack * 86400000);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday.getTime() + i * 86400000);
    return d.toISOString().slice(0, 10);
  });
}

function formatDayNum(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${day} ${month}`;
}

const themeLogoMap: Record<string, string> = {
  dark: "/images/naft-candlestick-dark-lime.svg",
  light: "/images/naft-candlestick-light-green.svg",
  sentinel: "/images/naft-candlestick-dark-red.svg",
};

const WeekNewsBoard = () => {
  const { events, loading } = useEconomicCalendar();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<EconomicCalendarEvent | null>(null);
  const weekDates = useMemo(() => getCurrentWeekMonToFri(), []);

  const byDay = useMemo(() => {
    const map: Record<string, EconomicCalendarEvent[]> = {};
    for (const d of weekDates) map[d] = [];
    for (const e of events) {
      if (!map[e.event_date]) continue;
      if (e.impact !== "high" && e.impact !== "medium") continue;
      map[e.event_date].push(e);
    }
    for (const d of weekDates) {
      map[d].sort((a, b) => {
        const at = a.event_time || "";
        const bt = b.event_time || "";
        if (!at && bt) return -1;
        if (at && !bt) return 1;
        return at.localeCompare(bt);
      });
    }
    return map;
  }, [events, weekDates]);

  const headerRange = useMemo(
    () => `${formatDayNum(weekDates[0])} – ${formatDayNum(weekDates[4])}`,
    [weekDates]
  );

  const logoSrc = themeLogoMap[theme] || themeLogoMap.dark;

  return (
    <section className="mb-12">
      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="flex flex-col items-center pt-6 pb-5 px-4">
          <img
            src={logoSrc}
            alt="NAFT"
            className="h-14 w-14 mb-4 rounded-md"
            loading="lazy"
          />
          <div className="w-full max-w-2xl bg-card/70 border border-border rounded-2xl px-6 py-5 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-foreground tracking-tight">
              This Week's Important News
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-mono mt-1">
              ({headerRange})
            </p>
            <p className="text-xs text-muted-foreground/70 font-mono mt-2">
              *All times are in UTC.
            </p>
          </div>
        </div>

        {/* Day band */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-primary text-primary-foreground">
          {weekDates.map((iso, i) => (
            <div
              key={iso}
              className="px-4 py-3 border-r border-primary-foreground/10 last:border-r-0"
            >
              <div className="font-display font-extrabold text-2xl leading-none">
                {DAY_LABELS[i]}
              </div>
              <div className="font-mono text-xs opacity-80 mt-1">
                {formatDayNum(iso)}
              </div>
            </div>
          ))}
        </div>

        {/* Event grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-background">
          {weekDates.map((iso) => {
            const dayEvents = byDay[iso] || [];
            return (
              <div
                key={iso}
                className="border-r border-border last:border-r-0 p-3 space-y-3 min-h-[180px]"
              >
                {loading && dayEvents.length === 0 && (
                  <div className="h-16 rounded-lg bg-muted/40 animate-pulse" />
                )}
                {!loading && dayEvents.length === 0 && (
                  <div className="text-center text-muted-foreground/40 font-mono text-xs py-6">
                    —
                  </div>
                )}
                {dayEvents.map((e) => {
                  const flag = FLAGS[e.currency] || "🏳️";
                  const isAllDay = !e.event_time;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="w-full text-left bg-card border border-border rounded-xl px-3 py-2.5 hover:border-primary/50 hover:bg-card/80 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {isAllDay ? "All day" : e.event_time}
                        </span>
                        <span className="text-base leading-none" aria-label={e.currency}>
                          {flag}
                        </span>
                      </div>
                      <div className="text-xs text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {e.name}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-1">
                        {e.currency}
                        {e.impact === "high" && (
                          <span className="ml-1.5 text-destructive">● HIGH</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <EventDetailModal
        event={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        timezone="UTC"
      />
    </section>
  );
};

export default WeekNewsBoard;
