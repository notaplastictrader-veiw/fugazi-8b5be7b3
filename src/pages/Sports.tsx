import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PredictionCard from "@/components/sports/PredictionCard";
import MatchPredictionCard from "@/components/sports/MatchPredictionCard";
import BettingSiteCard from "@/components/sports/BettingSiteCard";
import SportsScheduleSection from "@/components/sports/SportsScheduleSection";
import { bettingSites as staticBettingSites } from "@/data/bettingSites";
import { useSportsSchedule } from "@/hooks/useSportsSchedule";
import type { Prediction } from "@/components/sports/PredictionCard";
import { isPopularMatch } from "@/lib/popularTeams";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";


const FILTER_TABS = ["all", "football", "cricket", "tennis", "betting"] as const;
const filterLabels: Record<string, string> = {
  all: "All Sports", football: "⚽ Football", cricket: "🏏 Cricket",
  tennis: "🎾 Tennis", betting: "🎰 Betting Sites",
};

const Sports = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [bettingSites, setBettingSites] = useState<any[]>(staticBettingSites);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  
  const { refresh: refreshSchedule, aiPredictions } = useSportsSchedule();

  const handleManualRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    toast.loading("Refreshing sports data...", { id: "sports-refresh" });
    try {
      const [{ data: preds }, { data: bs }] = await Promise.all([
        supabase.from("sports_predictions").select("*").eq("status", "published").order("match_date", { ascending: false }),
        supabase.from("betting_sites").select("*").eq("status", "published").order("display_order"),
      ]);
      if (preds && preds.length > 0) setPredictions(preds);
      if (bs && bs.length) {
        setBettingSites(bs.map(b => ({
          id: b.id, name: b.name, slug: b.slug, logo: b.logo, rating: Number(b.rating),
          bonus: b.bonus, sports: b.sports || [], features: b.features || [],
          min_deposit: b.min_deposit, withdrawal_speed: b.withdrawal_speed,
          license: b.license, url: b.url, warning: b.warning || undefined,
        })));
      }
      await refreshSchedule();
      toast.success("Sports data refreshed", { id: "sports-refresh" });
    } catch (err: any) {
      toast.error("Refresh failed", { id: "sports-refresh", description: err?.message ?? "Try again shortly" });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const [{ data }, { data: bs }] = await Promise.all([
        supabase.from("sports_predictions").select("*").eq("status", "published").order("match_date", { ascending: false }),
        supabase.from("betting_sites").select("*").eq("status", "published").order("display_order"),
      ]);
      setPredictions(data || []);
      if (bs && bs.length) {
        setBettingSites(bs.map(b => ({
          id: b.id, name: b.name, slug: b.slug, logo: b.logo, rating: Number(b.rating),
          bonus: b.bonus, sports: b.sports || [], features: b.features || [],
          min_deposit: b.min_deposit, withdrawal_speed: b.withdrawal_speed,
          license: b.license, url: b.url, warning: b.warning || undefined,
        })));
      }
      setLoading(false);
    };
    load();
  }, []);

  // Convert live AI football predictions into the same Prediction shape as DB rows
  const aiAsPredictions: Prediction[] = (aiPredictions || []).map((p) => {
    // Derive confidence from the lowest implied odds in the formatted odds string ("1: 2.55 · X: 3.54 · 2: 2.51")
    let confidence = 60;
    if (p.odds) {
      const nums = Array.from(p.odds.matchAll(/(\d+(?:\.\d+)?)/g)).map((m) => parseFloat(m[1])).filter((n) => n > 1);
      if (nums.length) {
        const best = Math.min(...nums);
        const implied = Math.round((1 / best) * 100);
        confidence = Math.max(50, Math.min(85, implied));
      }
    }
    return {
      id: `ai-${p.id}`,
      title: p.competition || p.federation || "Football",
      sport: "football",
      team_a: p.homeTeam,
      team_b: p.awayTeam,
      match_date: p.date,
      prediction: p.prediction,
      confidence,
      analyst_note: p.odds ? `Market: ${p.market || "1X2"} · Odds ${p.odds}` : `Market: ${p.market || "1X2"}`,
      result: "",
      is_correct: null,
      isLive: p.isLive === true,
    };
  });

  // Dedupe vs DB predictions by normalized teams + same calendar day
  const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const dbKeys = new Set(
    predictions
      .filter((p) => p.sport === "football")
      .map((p) => `${norm(p.team_a)}|${norm(p.team_b)}|${p.match_date.slice(0, 10)}`)
  );
  const aiUnique = aiAsPredictions.filter((p) => {
    const k1 = `${norm(p.team_a)}|${norm(p.team_b)}|${p.match_date.slice(0, 10)}`;
    const k2 = `${norm(p.team_b)}|${norm(p.team_a)}|${p.match_date.slice(0, 10)}`;
    return !dbKeys.has(k1) && !dbKeys.has(k2);
  });

  const allPredictions = [...predictions, ...aiUnique];
  const isBetting = activeFilter === "betting";
  const filtered = activeFilter === "all" ? allPredictions : allPredictions.filter((p) => p.sport === activeFilter);

  const UPCOMING_GRACE_MS = 3 * 60 * 60 * 1000; // keep live matches visible for 3h after kickoff
  const nowMsForUpcoming = Date.now();
  const upcoming = filtered
    .filter((p) => !p.result && new Date(p.match_date).getTime() + UPCOMING_GRACE_MS > nowMsForUpcoming)
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  // Popular-team subset first (default ordering) — only pin if kicking off within 48h
  // so distant future matches don't camp on page 1 and the list rotates daily.
  const POPULAR_PIN_WINDOW_MS = 48 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const upcomingPopularAll = upcoming.filter(
    (p) => isPopularMatch(p.team_a, p.team_b) && new Date(p.match_date).getTime() - nowMs <= POPULAR_PIN_WINDOW_MS
  );
  const popularIds = new Set(upcomingPopularAll.map((p) => p.id));
  const upcomingDefault = [...upcomingPopularAll, ...upcoming.filter((p) => !popularIds.has(p.id))];

  const upcomingList = usePaginatedList(upcomingDefault, {
    searchKeys: ["team_a", "team_b", "title", "prediction"],
    sortOptions: [
      { value: "default", label: "Popular first", compare: () => 0 },
      { value: "soonest", label: "Soonest", compare: (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime() },
      { value: "latest", label: "Latest", compare: (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime() },
      { value: "confidence", label: "Highest confidence", compare: (a, b) => b.confidence - a.confidence },
    ],
    pageSize: 8,
    paramPrefix: "up",
  });

  const bettingList = usePaginatedList(bettingSites, {
    searchKeys: ["name", "sports", "features", "license"],
    sortOptions: [
      { value: "featured", label: "Featured", compare: () => 0 },
      { value: "rating-desc", label: "Top rated", compare: (a: any, b: any) => (b.rating || 0) - (a.rating || 0) },
      { value: "name-asc", label: "Name A–Z", compare: (a: any, b: any) => String(a.name).localeCompare(String(b.name)) },
    ],
    pageSize: 12,
    paramPrefix: "bs",
  });
  // Real stats derived only from the DB. No synthetic growth, no seeded values.
  // Track record builds up honestly as picks settle.
  const totalPicks = predictions.length;
  const settledPredictions = predictions.filter((p) => p.result && p.is_correct !== null);
  const settledCount = settledPredictions.length;
  const correctCount = settledPredictions.filter((p) => p.is_correct === true).length;
  const pending = totalPicks - settledCount;
  const winRate = settledCount > 0 ? Math.round((correctCount / settledCount) * 100) : null;

  const scrollToResults = () => {
    document.getElementById("latest-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MainLayout>
      <SEO
        title="Sports Predictions & Betting Sites"
        description="Data-driven sports predictions and trusted betting site reviews. Football, cricket, basketball, tennis — with track records and verified results."
        path="/sports"
      />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            🏆 SPORTS HUB
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Sports <span className="text-primary">Forecast Hub</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Data-driven predictions and trusted betting site reviews. Track record included.
          </p>
          <div className="mt-5 flex justify-center">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase bg-secondary text-foreground border border-border hover:bg-secondary/70 hover:border-primary/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Refresh sports data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh sports data"}
            </button>
          </div>
        </div>

        {/* Stats bar — hide when betting tab active. All values derive from real DB rows. */}
        {!isBetting && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-primary">{totalPicks}</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Total Picks</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-foreground">{settledCount}</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Settled</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-foreground">{correctCount}</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Correct</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              {winRate === null ? (
                <>
                  <p className="text-2xl font-extrabold text-muted-foreground">—</p>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">Win Rate</p>
                </>
              ) : (
                <>
                  <p className={`text-2xl font-extrabold ${winRate >= 60 ? "text-primary" : "text-destructive"}`}>{winRate}%</p>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">Win Rate</p>
                </>
              )}
            </div>
            {pending > 0 && (
              <p className="col-span-2 md:col-span-4 text-center text-[10px] text-muted-foreground font-mono">
                {pending} pending — admin settles past matches manually; cron auto-settles when upstream data covers the league.
              </p>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all ${
                tab === "betting"
                  ? activeFilter === tab
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 scale-105 ring-2 ring-primary/40"
                    : "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 hover:from-primary/30 hover:to-accent/30 hover:scale-105 animate-pulse"
                  : activeFilter === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {filterLabels[tab]}{tab === "betting" && " 🔥"}
            </button>
          ))}
        </div>

        {loading && !isBetting ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : isBetting ? (
          /* Betting Sites Grid */
          <div>
            <div className="text-center mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-2">Trusted Betting Platforms</h2>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Independently reviewed. We highlight warnings where applicable. Always gamble responsibly.
              </p>
            </div>
            <ListingToolbar
              query={bettingList.query}
              onQueryChange={bettingList.setQuery}
              sort={bettingList.sort}
              onSortChange={bettingList.setSort}
              sortOptions={bettingList.sortOptions}
              rangeStart={bettingList.rangeStart}
              rangeEnd={bettingList.rangeEnd}
              totalFiltered={bettingList.totalFiltered}
              totalAll={bettingList.totalAll}
              itemLabel="sites"
              searchPlaceholder="Search betting sites..."
            />
            {bettingList.totalFiltered === 0 ? (
              <EmptyResults query={bettingList.query} onReset={bettingList.reset} />
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bettingList.visibleItems.map((site: any) => (
                    <BettingSiteCard key={site.id} site={site} />
                  ))}
                </div>
                <SmartPagination
                  page={bettingList.page}
                  totalPages={bettingList.totalPages}
                  onPageChange={bettingList.setPage}
                  className="mt-8"
                />
              </>
            )}
            <div className="mt-8 bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
              <p className="text-xs text-destructive font-mono">
                ⚠️ Gambling involves financial risk. 18+ only. Please bet responsibly and check your local regulations.
              </p>
            </div>
          </div>
        ) : (
          /* Predictions Feed */
          <>
            {upcoming.length > 0 ? (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
                  <Target className="w-5 h-5 text-primary" /> Upcoming Predictions
                  {upcomingList.sort === "default" && !upcomingList.query && upcomingPopularAll.length > 0 && (
                    <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider ml-1">
                      · Popular Teams First
                    </span>
                  )}
                </h2>
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
                  searchPlaceholder="Search teams, league, market..."
                />
                {upcomingList.totalFiltered === 0 ? (
                  <EmptyResults query={upcomingList.query} onReset={upcomingList.reset} />
                ) : (
                  <>
                    {(() => {
                      // Group cards by UTC calendar day, e.g. "Fri Jun 19"
                      const groups = new Map<string, typeof upcomingList.visibleItems>();
                      for (const p of upcomingList.visibleItems) {
                        const d = new Date(p.match_date);
                        const key = Number.isFinite(d.getTime())
                          ? d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
                          : "TBD";
                        if (!groups.has(key)) groups.set(key, [] as any);
                        (groups.get(key) as any).push(p);
                      }
                      return Array.from(groups.entries()).map(([day, items]) => (
                        <div key={day} className="mb-8">
                          <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2 mb-4">
                            {day}
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            {items.map((p) => (
                              <MatchPredictionCard
                                key={p.id}
                                league={p.title || p.sport}
                                kickoffIso={p.match_date}
                                teamA={p.team_a}
                                teamB={p.team_b}
                                prediction={p.prediction}
                                confidence={p.confidence}
                                note={p.analyst_note}
                              />
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                    <SmartPagination
                      page={upcomingList.page}
                      totalPages={upcomingList.totalPages}
                      onPageChange={upcomingList.setPage}
                      className="mt-8"
                    />
                  </>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={scrollToResults}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-all"
                  >
                    See latest results <Trophy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No upcoming predictions yet. Check the live results below.</p>
              </div>
            )}
          </>
        )}

        <SportsScheduleSection />
      </section>
    </MainLayout>
  );
};

export default Sports;
