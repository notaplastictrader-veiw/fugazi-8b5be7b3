import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PredictionCard from "@/components/sports/PredictionCard";
import BettingSiteCard from "@/components/sports/BettingSiteCard";
import SportsScheduleSection from "@/components/sports/SportsScheduleSection";
import { bettingSites as staticBettingSites } from "@/data/bettingSites";
import { useSportsSchedule } from "@/hooks/useSportsSchedule";
import type { Prediction } from "@/components/sports/PredictionCard";
import { isPopularMatch } from "@/lib/popularTeams";

const POPULAR_LIMIT = 4;

const fallbackPredictions: Prediction[] = [
  { id: "1", title: "Premier League — Matchday 32", sport: "football", team_a: "Arsenal", team_b: "Manchester City", match_date: "2026-04-14T20:00:00Z", prediction: "Arsenal Win", confidence: 72, analyst_note: "Arsenal's home form is dominant this season. City struggling with injuries in midfield.", result: "", is_correct: null },
  { id: "2", title: "IPL 2026 — Match 28", sport: "cricket", team_a: "Mumbai Indians", team_b: "Chennai Super Kings", match_date: "2026-04-15T19:30:00Z", prediction: "CSK Win", confidence: 65, analyst_note: "CSK's bowling attack has been lethal at Chepauk. MI's middle order remains fragile.", result: "", is_correct: null },
  { id: "3", title: "NBA Playoffs — Round 1", sport: "basketball", team_a: "Boston Celtics", team_b: "Miami Heat", match_date: "2026-04-16T01:00:00Z", prediction: "Celtics Win (Series 4-1)", confidence: 80, analyst_note: "Celtics depth and home-court advantage too strong for Heat.", result: "", is_correct: null },
  { id: "4", title: "La Liga — Matchday 30", sport: "football", team_a: "Real Madrid", team_b: "Barcelona", match_date: "2026-04-13T20:00:00Z", prediction: "Draw", confidence: 55, analyst_note: "El Clásico at the Bernabéu — both teams in strong form. Defensive battle expected.", result: "2-2 Draw", is_correct: true },
  { id: "5", title: "ATP Madrid Open — QF", sport: "tennis", team_a: "Carlos Alcaraz", team_b: "Jannik Sinner", match_date: "2026-04-17T14:00:00Z", prediction: "Alcaraz Win", confidence: 68, analyst_note: "Alcaraz on home clay. His aggressive baseline game suits Madrid's altitude.", result: "", is_correct: null },
  { id: "6", title: "IPL 2026 — Match 25", sport: "cricket", team_a: "RCB", team_b: "KKR", match_date: "2026-04-12T15:30:00Z", prediction: "KKR Win", confidence: 60, analyst_note: "KKR's spin attack should dominate RCB's middle order in Kolkata.", result: "KKR won by 22 runs", is_correct: true },
];

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
      setPredictions(data && data.length > 0 ? data : fallbackPredictions);
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

  const upcoming = filtered
    .filter((p) => !p.result)
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  const past = filtered.filter((p) => !!p.result);
  const totalPast = predictions.filter((p) => p.is_correct !== null);
  const correct = totalPast.filter((p) => p.is_correct);
  const accuracy = totalPast.length > 0 ? Math.round((correct.length / totalPast.length) * 100) : 0;

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

        {/* Stats bar — hide when betting tab active */}
        {!isBetting && (
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-primary">{totalPast.length}</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Total Picks</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-primary">{correct.length}</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Correct</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className={`text-2xl font-extrabold ${accuracy >= 60 ? "text-primary" : "text-destructive"}`}>{accuracy}%</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Accuracy</p>
            </div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bettingSites.map((site) => (
                <BettingSiteCard key={site.id} site={site} />
              ))}
            </div>
            <div className="mt-8 bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
              <p className="text-xs text-destructive font-mono">
                ⚠️ Gambling involves financial risk. 18+ only. Please bet responsibly and check your local regulations.
              </p>
            </div>
          </div>
        ) : (
          /* Predictions Feed */
          <>
            {upcoming.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
                  <Target className="w-5 h-5 text-primary" /> Upcoming Predictions
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {upcoming.map((p) => <PredictionCard key={p.id} prediction={p} />)}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
                  <Trophy className="w-5 h-5 text-accent" /> Past Results
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {past.map((p) => <PredictionCard key={p.id} prediction={p} />)}
                </div>
              </div>
            )}

            {upcoming.length === 0 && past.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No predictions available yet.</p>
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
