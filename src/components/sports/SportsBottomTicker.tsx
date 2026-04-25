import { useEffect, useMemo, useState } from "react";
import { useSportsSchedule } from "@/hooks/useSportsSchedule";

const LEAGUE_ICON: Record<string, string> = {
  "Premier League": "⚽",
  "IPL": "🏏",
  "NBA": "🏀",
};

function formatCountdown(iso: string, now: number): string {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return "TBD";
  const diff = target - now;
  if (diff <= 0) return "LIVE";
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes.toString().padStart(2, "0")}m`;
  return `in ${minutes}m`;
}

const SportsBottomTicker = () => {
  const { upcoming, results, stale, loading } = useSportsSchedule();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const items = useMemo(() => {
    const live = upcoming.filter((m) => m.status === "Live").map((m) => ({
      kind: "live" as const,
      key: `live-${m.id}`,
      league: m.league,
      text: `${m.homeTeam} vs ${m.awayTeam}`,
      meta: "LIVE",
    }));
    const next = upcoming.filter((m) => m.status !== "Live").slice(0, 12).map((m) => ({
      kind: "upcoming" as const,
      key: `up-${m.id}`,
      league: m.league,
      text: `${m.homeTeam} vs ${m.awayTeam}`,
      meta: formatCountdown(m.date, now),
    }));
    const recent = results.slice(0, 10).map((m) => ({
      kind: "result" as const,
      key: `res-${m.id}`,
      league: m.league,
      text: `${m.homeTeam} ${m.homeScore ?? "-"} – ${m.awayScore ?? "-"} ${m.awayTeam}`,
      meta: "FT",
    }));
    return [...live, ...next, ...recent];
  }, [upcoming, results, now]);

  const displayItems = items.length > 0 ? [...items, ...items] : [];
  const hasLive = items.some((i) => i.kind === "live");

  return (
    <div className="fixed bottom-[32px] left-0 right-0 z-[199] bg-card/95 backdrop-blur-md border-t border-destructive/30 overflow-hidden h-[34px] flex items-center shadow-[0_-4px_16px_-8px_hsl(var(--destructive)/0.4)]">
      {/* Brand chip */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full border-r border-border bg-destructive/10">
        <span className="relative flex h-1.5 w-1.5">
          {hasLive && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
          )}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
        </span>
        <span className="text-[10px] font-mono font-bold tracking-wider text-destructive">
          {hasLive ? "SPORTS LIVE" : "SPORTS"}
        </span>
        {stale && (
          <span className="text-[9px] font-mono text-muted-foreground">·CACHED</span>
        )}
      </div>

      {displayItems.length > 0 ? (
        <div className="ticker-track">
          {displayItems.map((item, i) => (
            <span key={`${item.key}-${i}`} className="flex-shrink-0 flex items-center gap-2 text-[11px] font-mono">
              <span className="text-muted-foreground">{LEAGUE_ICON[item.league] ?? "🏟"} {item.league}</span>
              <span className="text-foreground font-semibold">{item.text}</span>
              <span
                className={
                  item.kind === "live"
                    ? "text-destructive font-bold"
                    : item.kind === "result"
                      ? "text-primary"
                      : "text-muted-foreground"
                }
              >
                {item.meta}
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div className="px-4 text-[11px] font-mono text-muted-foreground">
          {loading ? "Loading sports feed…" : "No fixtures available."}
        </div>
      )}
    </div>
  );
};

export default SportsBottomTicker;
