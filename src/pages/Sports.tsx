import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Prediction {
  id: string;
  title: string;
  sport: string;
  team_a: string;
  team_b: string;
  match_date: string;
  prediction: string;
  confidence: number;
  analyst_note: string;
  result: string;
  is_correct: boolean | null;
}

const fallbackPredictions: Prediction[] = [
  { id: "1", title: "Premier League — Matchday 32", sport: "football", team_a: "Arsenal", team_b: "Manchester City", match_date: "2026-04-14T20:00:00Z", prediction: "Arsenal Win", confidence: 72, analyst_note: "Arsenal's home form is dominant this season. City struggling with injuries in midfield.", result: "", is_correct: null },
  { id: "2", title: "IPL 2026 — Match 28", sport: "cricket", team_a: "Mumbai Indians", team_b: "Chennai Super Kings", match_date: "2026-04-15T19:30:00Z", prediction: "CSK Win", confidence: 65, analyst_note: "CSK's bowling attack has been lethal at Chepauk. MI's middle order remains fragile.", result: "", is_correct: null },
  { id: "3", title: "NBA Playoffs — Round 1", sport: "basketball", team_a: "Boston Celtics", team_b: "Miami Heat", match_date: "2026-04-16T01:00:00Z", prediction: "Celtics Win (Series 4-1)", confidence: 80, analyst_note: "Celtics depth and home-court advantage too strong for Heat.", result: "", is_correct: null },
  { id: "4", title: "La Liga — Matchday 30", sport: "football", team_a: "Real Madrid", team_b: "Barcelona", match_date: "2026-04-13T20:00:00Z", prediction: "Draw", confidence: 55, analyst_note: "El Clásico at the Bernabéu — both teams in strong form. Defensive battle expected.", result: "2-2 Draw", is_correct: true },
  { id: "5", title: "ATP Madrid Open — QF", sport: "tennis", team_a: "Carlos Alcaraz", team_b: "Jannik Sinner", match_date: "2026-04-17T14:00:00Z", prediction: "Alcaraz Win", confidence: 68, analyst_note: "Alcaraz on home clay. His aggressive baseline game suits Madrid's altitude.", result: "", is_correct: null },
  { id: "6", title: "IPL 2026 — Match 25", sport: "cricket", team_a: "RCB", team_b: "KKR", match_date: "2026-04-12T15:30:00Z", prediction: "KKR Win", confidence: 60, analyst_note: "KKR's spin attack should dominate RCB's middle order in Kolkata.", result: "KKR won by 22 runs", is_correct: true },
];

const sportIcons: Record<string, string> = { football: "⚽", cricket: "🏏", basketball: "🏀", tennis: "🎾" };
const sportColors: Record<string, string> = {
  football: "bg-primary/20 text-primary",
  cricket: "bg-accent/20 text-accent",
  basketball: "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  tennis: "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
};

const Sports = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("sports_predictions")
        .select("*")
        .eq("status", "published")
        .order("match_date", { ascending: false });
      setPredictions(data && data.length > 0 ? data : fallbackPredictions);
      setLoading(false);
    };
    load();
  }, []);

  const sports = ["all", ...Array.from(new Set(predictions.map((p) => p.sport)))];
  const filtered = sportFilter === "all" ? predictions : predictions.filter((p) => p.sport === sportFilter);

  const upcoming = filtered.filter((p) => !p.result);
  const past = filtered.filter((p) => !!p.result);
  const totalPast = predictions.filter((p) => p.is_correct !== null);
  const correct = totalPast.filter((p) => p.is_correct);
  const accuracy = totalPast.length > 0 ? Math.round((correct.length / totalPast.length) * 100) : 0;

  return (
    <MainLayout>
      <SEO
        title="Sports Predictions"
        description="Data-driven sports predictions across football, cricket, basketball, and tennis. Track records, confidence scores, and verified results."
        path="/sports"
      />
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            🏆 SPORTS PREDICTIONS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Sports <span className="text-primary">Forecast Hub</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Data-driven predictions across Football, Cricket, Basketball, and Tennis. Track record included.
          </p>
        </div>

        {/* Stats bar */}
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all ${sportFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? "All Sports" : `${sportIcons[s] || ""} ${s}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
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
      </section>
    </MainLayout>
  );
};

const PredictionCard = ({ prediction: p }: { prediction: Prediction }) => {
  const isPast = !!p.result;
  const matchTime = new Date(p.match_date);
  const isLive = !isPast && matchTime <= new Date();

  return (
    <div className={`glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-primary/20 ${isPast ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between">
        <Badge className={`text-[10px] font-mono uppercase ${sportColors[p.sport] || "bg-muted text-muted-foreground"}`}>
          {sportIcons[p.sport]} {p.sport}
        </Badge>
        {isPast && p.is_correct !== null && (
          p.is_correct ? (
            <Badge className="bg-primary/20 text-primary text-[10px] font-mono flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> CORRECT
            </Badge>
          ) : (
            <Badge className="bg-destructive/20 text-destructive text-[10px] font-mono flex items-center gap-1">
              <XCircle className="w-3 h-3" /> WRONG
            </Badge>
          )
        )}
        {isLive && (
          <Badge className="bg-destructive/20 text-destructive text-[10px] font-mono animate-pulse">
            🔴 LIVE
          </Badge>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground font-mono">{p.title}</p>

      <div className="flex items-center justify-center gap-4">
        <span className="text-base font-bold text-foreground text-right flex-1">{p.team_a}</span>
        <span className="text-xs text-muted-foreground font-mono px-3 py-1 rounded bg-secondary">VS</span>
        <span className="text-base font-bold text-foreground text-left flex-1">{p.team_b}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Our Pick</p>
          <p className="text-sm font-bold text-primary">{p.prediction}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Confidence</p>
          <p className={`text-sm font-bold ${p.confidence >= 70 ? "text-primary" : p.confidence >= 50 ? "text-accent" : "text-destructive"}`}>
            {p.confidence}%
          </p>
        </div>
      </div>

      {p.analyst_note && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
          💡 {p.analyst_note}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {matchTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {matchTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {isPast && <span className="font-semibold text-foreground">Result: {p.result}</span>}
      </div>
    </div>
  );
};

export default Sports;
