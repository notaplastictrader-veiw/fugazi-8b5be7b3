import { useEffect, useMemo, useState } from "react";
import { Calendar, RefreshCw, Trophy, Radio, Clock } from "lucide-react";
import { isPopularMatch } from "@/lib/popularTeams";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSportsSchedule, type ResultMatch, type UpcomingMatch } from "@/hooks/useSportsSchedule";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";
import PredictionResultStamp from "@/components/sports/PredictionResultStamp";

type SportFilter = "all" | "Football" | "Cricket";
type LeagueFilter = "all" | "Premier League" | "IPL";

const FILTERS: { key: SportFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Football", label: "⚽ Football" },
  { key: "Cricket", label: "🏏 Cricket" },
];

const LEAGUE_CHIPS: { key: LeagueFilter; label: string; sport: SportFilter }[] = [
  { key: "all", label: "All Leagues", sport: "all" },
  { key: "Premier League", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 EPL", sport: "Football" },
  { key: "IPL", label: "🏏 IPL", sport: "Cricket" },
];

interface PredictionRow {
  id: string;
  sport: string;
  team_a: string;
  team_b: string;
  prediction: string;
}

function formatRelative(ts: number): string {
  if (!ts) return "—";
  const diffMin = Math.round((Date.now() - ts) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  const h = Math.round(diffMin / 60);
  return h === 1 ? "1 hour ago" : `${h} hours ago`;
}

function formatMatchDate(iso: string): { day: string; time: string } {
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return { day, time };
  } catch {
    return { day: iso, time: "" };
  }
}

function formatCountdown(iso: string, now: number): { label: string; tone: "live" | "soon" | "today" | "future" | "past" } {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return { label: "TBD", tone: "future" };
  const diff = target - now;
  if (diff <= -2 * 60 * 60_000) return { label: "Ended", tone: "past" };
  if (diff <= 0) return { label: "Live now", tone: "live" };
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (days > 0) return { label: `${days}d ${hours}h`, tone: "future" };
  if (hours > 0) return { label: `${hours}h ${minutes.toString().padStart(2, "0")}m`, tone: hours < 6 ? "today" : "future" };
  if (minutes > 0) return { label: `${minutes}m ${seconds.toString().padStart(2, "0")}s`, tone: "soon" };
  return { label: `${seconds}s`, tone: "soon" };
}

function matchPrediction(result: ResultMatch, predictions: PredictionRow[]): "won" | "lost" | null {
  if (result.homeScore === null || result.awayScore === null) return null;
  const home = result.homeTeam.toLowerCase();
  const away = result.awayTeam.toLowerCase();
  const sportLower = result.sport.toLowerCase();

  const pred = predictions.find((p) => {
    const ps = (p.sport || "").toLowerCase();
    if (ps && ps !== sportLower) return false;
    const a = (p.team_a || "").toLowerCase();
    const b = (p.team_b || "").toLowerCase();
    if (!a || !b) return false;
    return (
      (home.includes(a) || a.includes(home)) &&
      (away.includes(b) || b.includes(away))
    ) || (
      (home.includes(b) || b.includes(home)) &&
      (away.includes(a) || a.includes(away))
    );
  });

  if (!pred) return null;

  const actualWinner =
    result.homeScore > result.awayScore ? result.homeTeam.toLowerCase()
    : result.awayScore > result.homeScore ? result.awayTeam.toLowerCase()
    : "draw";
  const predictionLower = (pred.prediction || "").toLowerCase();

  if (actualWinner === "draw") {
    return predictionLower.includes("draw") ? "won" : "lost";
  }

  // Prediction text usually contains the team name + "win"
  if (predictionLower.includes(actualWinner) || actualWinner.split(" ").some((w) => w.length > 3 && predictionLower.includes(w))) {
    return "won";
  }
  return "lost";
}

const UpcomingCard = ({ m, now }: { m: UpcomingMatch; now: number }) => {
  const { day, time } = formatMatchDate(m.date);
  const isLive = m.status === "Live";
  const countdown = formatCountdown(m.date, now);
  const toneClass =
    countdown.tone === "live" ? "bg-destructive/15 text-destructive border-destructive/30 animate-pulse"
    : countdown.tone === "soon" ? "bg-destructive/10 text-destructive border-destructive/30"
    : countdown.tone === "today" ? "bg-primary/10 text-primary border-primary/30"
    : countdown.tone === "past" ? "bg-muted text-muted-foreground border-border"
    : "bg-secondary text-foreground border-border";
  return (
    <div className="glass-card rounded-2xl p-5 border border-destructive/20 hover:border-destructive/40 transition-all hover:shadow-[0_0_24px_-6px_hsl(var(--destructive)/0.4)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider truncate pr-2">
          {m.league}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-destructive font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            LIVE
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border tabular-nums ${toneClass}`}>
            <Clock className="w-3 h-3" /> {countdown.label}
          </span>
        )}
      </div>
      <div className="space-y-1.5 mb-4">
        <p className="text-base font-semibold text-foreground truncate">{m.homeTeam}</p>
        <p className="text-[10px] text-muted-foreground font-mono">vs</p>
        <p className="text-base font-semibold text-foreground truncate">{m.awayTeam}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" />{day}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="w-3 h-3" />{time || m.time || "TBD"}</span>
      </div>
    </div>
  );
};

const ResultCard = ({ m, verdict }: { m: ResultMatch; verdict: "won" | "lost" | null }) => {
  const { day } = formatMatchDate(m.date);
  const homeWin = m.homeScore !== null && m.awayScore !== null && m.homeScore > m.awayScore;
  const awayWin = m.homeScore !== null && m.awayScore !== null && m.awayScore > m.homeScore;

  return (
    <div className="glass-card rounded-2xl p-5 border border-destructive/20 hover:border-destructive/40 transition-all hover:shadow-[0_0_24px_-6px_hsl(var(--destructive)/0.4)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
          {m.league}
        </span>
        {verdict && (
          <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
            verdict === "won"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-destructive/15 text-destructive border border-destructive/30"
          }`}>
            {verdict === "won" ? "✓ WON" : "✗ LOST"}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-base font-semibold truncate ${homeWin ? "text-primary" : awayWin ? "text-destructive/80" : "text-foreground"}`}>
            {m.homeTeam}
          </p>
          <span className={`text-xl font-extrabold tabular-nums ${homeWin ? "text-primary" : awayWin ? "text-destructive/80" : "text-foreground"}`}>
            {m.homeScore ?? "-"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className={`text-base font-semibold truncate ${awayWin ? "text-primary" : homeWin ? "text-destructive/80" : "text-foreground"}`}>
            {m.awayTeam}
          </p>
          <span className={`text-xl font-extrabold tabular-nums ${awayWin ? "text-primary" : homeWin ? "text-destructive/80" : "text-foreground"}`}>
            {m.awayScore ?? "-"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" />{day}</span>
        <span className="font-mono uppercase text-[10px]">{m.status}</span>
      </div>
    </div>
  );
};

function normalizeTeam(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

const SportsScheduleSection = () => {
  const { upcoming, results, stale, lastFetched, loading, refresh } = useSportsSchedule();
  const [filter, setFilter] = useState<SportFilter>("all");
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("all");
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Tick every second so countdowns and "X min ago" stay fresh
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Load predictions for WON/LOST matching
  useEffect(() => {
    supabase
      .from("sports_predictions")
      .select("id, sport, team_a, team_b, prediction")
      .eq("status", "published")
      .then(({ data }) => {
        if (data) setPredictions(data as PredictionRow[]);
      });
  }, []);

  const applyFilters = <T extends UpcomingMatch>(list: T[]): T[] =>
    list.filter((m) => {
      if (filter !== "all" && m.sport !== filter) return false;
      if (leagueFilter !== "all" && m.league !== leagueFilter) return false;
      return true;
    });

  // Popular-first ordering as the default list (no slice — show everything,
  // pagination takes over from here).
  const orderPopularFirst = <T extends UpcomingMatch>(list: T[]): T[] => {
    const pop = list.filter((m) => isPopularMatch(m.homeTeam, m.awayTeam));
    const ids = new Set(pop.map((m) => m.id));
    return [...pop, ...list.filter((m) => !ids.has(m.id))];
  };

  const recentResults = useMemo(() => {
    const startOfYesterday = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - 1);
      return d.getTime();
    })();
    const nowMs = Date.now();
    return results.filter((m) => {
      const t = new Date(m.date).getTime();
      return Number.isFinite(t) && t >= startOfYesterday && t <= nowMs + 60_000;
    });
  }, [results]);

  const filteredUpcoming = useMemo(() => orderPopularFirst(applyFilters(upcoming)), [upcoming, filter, leagueFilter]);
  const filteredResults = useMemo(() => orderPopularFirst(applyFilters(recentResults)), [recentResults, filter, leagueFilter]);
  const upcomingHasPopular = useMemo(() => filteredUpcoming.some((m) => isPopularMatch(m.homeTeam, m.awayTeam)), [filteredUpcoming]);
  const resultsHasPopular = useMemo(() => filteredResults.some((m) => isPopularMatch(m.homeTeam, m.awayTeam)), [filteredResults]);

  const upcomingList = usePaginatedList(filteredUpcoming, {
    searchKeys: ["homeTeam", "awayTeam", "league"],
    sortOptions: [
      { value: "default", label: "Popular first", compare: () => 0 },
      { value: "soonest", label: "Soonest", compare: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
      { value: "latest", label: "Latest", compare: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() },
    ],
    pageSize: 6,
    paramPrefix: "ups",
  });

  const resultsList = usePaginatedList(filteredResults, {
    searchKeys: ["homeTeam", "awayTeam", "league"],
    sortOptions: [
      { value: "default", label: "Popular first", compare: () => 0 },
      { value: "latest", label: "Most recent", compare: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() },
      { value: "oldest", label: "Oldest first", compare: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
    ],
    pageSize: 6,
    paramPrefix: "res",
  });

  // Status pill: loading | cached | fresh
  const statusPill = (() => {
    if (loading) {
      return {
        text: "Loading sports data…",
        cls: "bg-primary/10 text-primary border-primary/30",
        dot: "bg-primary animate-pulse",
      };
    }
    if (stale) {
      return {
        text: `Cached · updated ${formatRelative(lastFetched)}`,
        cls: "bg-muted text-muted-foreground border-border",
        dot: "bg-muted-foreground",
      };
    }
    return {
      text: `Live · updated ${formatRelative(lastFetched)}`,
      cls: "bg-primary/10 text-primary border-primary/30",
      dot: "bg-primary animate-pulse",
    };
  })();

  return (
    <section className="mt-16 pt-12 border-t border-border/40">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-destructive/10 text-destructive mb-3">
            📡 LIVE FEED
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-foreground">
            Sports Schedule & <span className="text-destructive">Results</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real fixtures and final scores from cricket and football leagues — refreshed every 10 minutes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${statusPill.cls}`}
            aria-live="polite"
            aria-label={statusPill.text}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dot}`} />
            {statusPill.text}
          </span>
          <button
            onClick={() => refresh()}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
            aria-label="Refresh sports data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Sport filter tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setLeagueFilter("all"); }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all ${
              filter === f.key
                ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* League chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider mr-1">League:</span>
        {LEAGUE_CHIPS
          .filter((c) => c.key === "all" || filter === "all" || c.sport === filter)
          .map((c) => (
            <button
              key={c.key}
              onClick={() => setLeagueFilter(c.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all ${
                leagueFilter === c.key
                  ? "bg-primary/15 text-primary border-primary/40 shadow-sm shadow-primary/20"
                  : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
              }`}
            >
              {c.label}
            </button>
          ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div className="mb-12">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-5">
              <Radio className="w-4 h-4 text-destructive" /> Upcoming Matches
              <span className="text-[10px] text-muted-foreground font-mono">({filteredUpcoming.length})</span>
              {upcomingList.sort === "default" && !upcomingList.query && upcomingHasPopular && (
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider ml-1">· Popular First</span>
              )}
            </h3>
            {filteredUpcoming.length > 0 ? (
              <>
                <ListingToolbar
                  query={upcomingList.query}
                  onQueryChange={upcomingList.setQuery}
                  sort={upcomingList.sort}
                  onSortChange={upcomingList.setSort}
                  sortOptions={upcomingList.sortOptions}
                  rangeStart={upcomingList.rangeStart}
                  rangeEnd={upcomingList.rangeEnd}
                  totalFiltered={upcomingList.totalFiltered}
                  totalAll={upcomingList.totalAll}
                  itemLabel="matches"
                  searchPlaceholder="Search teams or league..."
                />
                {upcomingList.totalFiltered === 0 ? (
                  <EmptyResults query={upcomingList.query} onReset={upcomingList.reset} />
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {upcomingList.visibleItems.map((m) => (
                        <UpcomingCard key={m.id} m={m} now={now} />
                      ))}
                    </div>
                    <SmartPagination
                      page={upcomingList.page}
                      totalPages={upcomingList.totalPages}
                      onPageChange={upcomingList.setPage}
                      className="mt-6"
                    />
                  </>
                )}
              </>
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
                No upcoming matches for this filter.
              </div>
            )}
          </div>

          {/* Results */}
          <div id="latest-results" className="scroll-mt-24">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-5">
              <Trophy className="w-4 h-4 text-primary" /> Latest Results
              <span className="text-[10px] text-muted-foreground font-mono">({filteredResults.length})</span>
              {resultsList.sort === "default" && !resultsList.query && resultsHasPopular && (
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider ml-1">· Popular First</span>
              )}
            </h3>
            {filteredResults.length > 0 ? (
              <>
                <ListingToolbar
                  query={resultsList.query}
                  onQueryChange={resultsList.setQuery}
                  sort={resultsList.sort}
                  onSortChange={resultsList.setSort}
                  sortOptions={resultsList.sortOptions}
                  rangeStart={resultsList.rangeStart}
                  rangeEnd={resultsList.rangeEnd}
                  totalFiltered={resultsList.totalFiltered}
                  totalAll={resultsList.totalAll}
                  itemLabel="results"
                  searchPlaceholder="Search teams or league..."
                />
                {resultsList.totalFiltered === 0 ? (
                  <EmptyResults query={resultsList.query} onReset={resultsList.reset} />
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {resultsList.visibleItems.map((m) => (
                        <ResultCard key={m.id} m={m} verdict={matchPrediction(m, predictions)} />
                      ))}
                    </div>
                    <SmartPagination
                      page={resultsList.page}
                      totalPages={resultsList.totalPages}
                      onPageChange={resultsList.setPage}
                      className="mt-6"
                    />
                  </>
                )}
              </>
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
                No recent results for this filter.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default SportsScheduleSection;
