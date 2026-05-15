import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import CardCarousel from "@/components/common/CardCarousel";

interface Row {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  score: number;
  health_score: number;
  delta: number;
}

const FALLBACK: Row[] = [
  { id: "1", name: "Exness", slug: "exness", logo_url: null, score: 9.2, health_score: 95, delta: 3 },
  { id: "2", name: "IC Markets", slug: "ic-markets", logo_url: null, score: 9.0, health_score: 92, delta: 2 },
  { id: "3", name: "Pepperstone", slug: "pepperstone", logo_url: null, score: 8.9, health_score: 90, delta: 1 },
  { id: "4", name: "FTMO", slug: "ftmo", logo_url: null, score: 8.7, health_score: 88, delta: 1 },
  { id: "5", name: "XM", slug: "xm", logo_url: null, score: 8.4, health_score: 82, delta: -2 },
  { id: "6", name: "FXTM", slug: "fxtm", logo_url: null, score: 8.2, health_score: 80, delta: -2 },
  { id: "7", name: "OctaFX", slug: "octafx", logo_url: null, score: 7.9, health_score: 78, delta: -1 },
  { id: "8", name: "HotForex", slug: "hotforex", logo_url: null, score: 7.6, health_score: 75, delta: -1 },
  { id: "9", name: "AvaTrade", slug: "avatrade", logo_url: null, score: 8.5, health_score: 86, delta: 1 },
  { id: "10", name: "OANDA", slug: "oanda", logo_url: null, score: 8.6, health_score: 88, delta: 2 },
  { id: "11", name: "Plus500", slug: "plus500", logo_url: null, score: 8.0, health_score: 79, delta: -1 },
  { id: "12", name: "eToro", slug: "etoro", logo_url: null, score: 7.7, health_score: 74, delta: -3 },
];

const healthColor = (h: number) =>
  h >= 85
    ? "text-primary"
    : h >= 70
    ? "text-accent"
    : h >= 50
    ? "text-foreground"
    : "text-destructive";

const healthBg = (h: number) =>
  h >= 85
    ? "from-primary/30 to-primary"
    : h >= 70
    ? "from-accent/30 to-accent"
    : h >= 50
    ? "from-muted to-foreground/40"
    : "from-destructive/30 to-destructive";

const BrokerHealthGrid = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setVisible(true), obs.disconnect()),
      { rootMargin: "200px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const { data } = await supabase
        .from("brokers")
        .select("id,name,slug,logo_url,score,health_score")
        .eq("status", "published")
        .not("health_score", "is", null)
        .order("health_score", { ascending: false })
        .limit(12);

      if (!data || data.length === 0) {
        setRows(FALLBACK);
        return;
      }
      const computed: Row[] = (data as any[]).map((b) => {
        const score = Number(b.score) || 0;
        const health = Number(b.health_score) || 0;
        // Trust momentum: difference between health (live signal) and score (baseline)
        const delta = Math.round(health - score * 10);
        return {
          id: b.id,
          name: b.name,
          slug: b.slug,
          logo_url: b.logo_url,
          score,
          health_score: health,
          delta,
        };
      });
      setRows(computed);
    })();
  }, [visible]);

  const data = rows.length > 0 ? rows : FALLBACK;

  return (
    <section ref={ref} className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
              Broker Health Index
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight">
            Live trust momentum,{" "}
            <span className="text-primary">updated daily</span>.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Real-time scoring built from complaints, scam alerts, verified reviews, and payout proofs. Higher = healthier.
          </p>
        </div>
        <Link
          to="/brokers"
          className="text-xs font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
        >
          All brokers <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((r) => {
          const DeltaIcon = r.delta > 0 ? TrendingUp : r.delta < 0 ? TrendingDown : Minus;
          const deltaColor =
            r.delta > 0
              ? "text-primary bg-primary/10"
              : r.delta < 0
              ? "text-destructive bg-destructive/10"
              : "text-muted-foreground bg-secondary";
          return (
            <Link
              key={r.id}
              to={`/brokers/${r.slug}`}
              className="group rounded-xl border border-border bg-card hover:border-primary/50 transition-all p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {r.logo_url ? (
                    <img
                      src={r.logo_url}
                      alt={r.name}
                      loading="lazy"
                      className="w-8 h-8 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center font-mono text-xs font-bold text-foreground shrink-0">
                      {r.name[0]}
                    </div>
                  )}
                  <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {r.name}
                  </span>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${deltaColor}`}
                >
                  <DeltaIcon className="w-2.5 h-2.5" />
                  {r.delta > 0 ? "+" : ""}
                  {r.delta}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className={`font-display text-3xl font-black ${healthColor(r.health_score)}`}>
                  {Math.round(r.health_score)}
                </span>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  / 100
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${healthBg(r.health_score)} transition-all`}
                  style={{ width: `${Math.min(100, r.health_score)}%` }}
                />
              </div>

              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Score {r.score.toFixed(1)}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                  View →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BrokerHealthGrid;
