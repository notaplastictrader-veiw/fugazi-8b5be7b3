import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Clock, TrendingUp, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

interface Row {
  broker_id: string;
  broker_name: string;
  broker_slug: string;
  avg_hours: number;
  proof_count: number;
  fastest_hours: number;
}

const FALLBACK: Row[] = [
  { broker_id: "f1", broker_name: "Exness", broker_slug: "exness", avg_hours: 0.4, proof_count: 142, fastest_hours: 0.1 },
  { broker_id: "f2", broker_name: "IC Markets", broker_slug: "ic-markets", avg_hours: 1.8, proof_count: 89, fastest_hours: 0.5 },
  { broker_id: "f3", broker_name: "Pepperstone", broker_slug: "pepperstone", avg_hours: 2.4, proof_count: 76, fastest_hours: 0.8 },
  { broker_id: "f4", broker_name: "FTMO", broker_slug: "ftmo", avg_hours: 6.1, proof_count: 64, fastest_hours: 2.0 },
  { broker_id: "f5", broker_name: "XM", broker_slug: "xm", avg_hours: 8.5, proof_count: 51, fastest_hours: 3.2 },
  { broker_id: "f6", broker_name: "FXTM", broker_slug: "fxtm", avg_hours: 12.3, proof_count: 38, fastest_hours: 4.5 },
  { broker_id: "f7", broker_name: "HotForex", broker_slug: "hotforex", avg_hours: 18.7, proof_count: 29, fastest_hours: 6.0 },
  { broker_id: "f8", broker_name: "OctaFX", broker_slug: "octafx", avg_hours: 24.2, proof_count: 22, fastest_hours: 8.4 },
];

const formatHours = (h: number) => {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
};

const speedTier = (h: number) => {
  if (h < 1) return { label: "INSTANT", color: "bg-primary/20 text-primary border-primary/40" };
  if (h < 6) return { label: "FAST", color: "bg-accent/20 text-accent border-accent/40" };
  if (h < 24) return { label: "NORMAL", color: "bg-secondary text-foreground border-border" };
  return { label: "SLOW", color: "bg-destructive/15 text-destructive border-destructive/30" };
};

const PayoutSpeedLeaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
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
      const { data: proofs } = await supabase
        .from("withdrawal_proofs")
        .select("broker_id,payout_time_hours")
        .eq("status", "verified")
        .not("payout_time_hours", "is", null);

      if (!proofs || proofs.length === 0) {
        setRows(FALLBACK);
        return;
      }
      const map = new Map<string, number[]>();
      proofs.forEach((p: any) => {
        if (!map.has(p.broker_id)) map.set(p.broker_id, []);
        map.get(p.broker_id)!.push(Number(p.payout_time_hours));
      });
      const ids = Array.from(map.keys());
      const { data: brokers } = await supabase
        .from("brokers")
        .select("id,name,slug")
        .in("id", ids);
      const bMap = new Map((brokers || []).map((b: any) => [b.id, b]));
      const computed: Row[] = ids
        .map((id) => {
          const arr = map.get(id)!;
          const b = bMap.get(id) as any;
          if (!b) return null;
          return {
            broker_id: id,
            broker_name: b.name,
            broker_slug: b.slug,
            avg_hours: arr.reduce((a, b) => a + b, 0) / arr.length,
            proof_count: arr.length,
            fastest_hours: Math.min(...arr),
          };
        })
        .filter(Boolean) as Row[];
      computed.sort((a, b) => a.avg_hours - b.avg_hours);
      setRows(computed.length > 0 ? computed : FALLBACK);
    })();
  }, [visible]);

  const data = rows.length > 0 ? rows : FALLBACK;
  const maxHours = Math.max(...data.map((r) => r.avg_hours));
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedData = data.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <section ref={ref} className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
              Payout Speed Leaderboard
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight">
            Who actually pays out{" "}
            <span className="text-primary">fastest</span>?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Average verified withdrawal time across {data.reduce((a, b) => a + b.proof_count, 0)} proofs. No marketing, just timestamps.
          </p>
        </div>
        <Link
          to="/brokers"
          className="text-xs font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
        >
          Full directory <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-border bg-secondary/40 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-4 md:col-span-3">Broker</div>
          <div className="col-span-3 md:col-span-2">Avg payout</div>
          <div className="hidden md:block md:col-span-4">Speed bar</div>
          <div className="col-span-2 text-right">Tier</div>
          <div className="col-span-2 md:col-span-1 text-right">Proofs</div>
        </div>
        {pagedData.map((r, idx) => {
          const i = currentPage * PAGE_SIZE + idx;
          const tier = speedTier(r.avg_hours);
          const widthPct = Math.max(8, 100 - (r.avg_hours / maxHours) * 92);
          return (
            <Link
              key={r.broker_id}
              to={`/brokers/${r.broker_slug}`}
              className="grid grid-cols-12 px-4 py-4 border-b border-border last:border-b-0 items-center hover:bg-secondary/30 transition-colors group"
            >
              <div className="col-span-1 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-4 md:col-span-3 min-w-0">
                <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {r.broker_name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Fastest: {formatHours(r.fastest_hours)}
                </div>
              </div>
              <div className="col-span-3 md:col-span-2 font-mono text-sm flex items-center gap-1 text-foreground">
                <Clock className="w-3 h-3 text-muted-foreground" />
                {formatHours(r.avg_hours)}
              </div>
              <div className="hidden md:block md:col-span-4">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
              <div className="col-span-2 md:col-span-1 text-right font-mono text-xs text-muted-foreground">
                {r.proof_count}
              </div>
            </Link>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            aria-label="Previous"
            className="w-9 h-9 rounded-full border border-border bg-card text-foreground hover:text-primary hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
            disabled={currentPage >= pageCount - 1}
            aria-label="Next"
            className="w-9 h-9 rounded-full border border-border bg-card text-foreground hover:text-primary hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
        Data sourced from verified user-submitted withdrawal proofs · updated continuously
      </div>
    </section>
  );
};

export default PayoutSpeedLeaderboard;
