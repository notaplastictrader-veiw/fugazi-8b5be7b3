import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Radio, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

interface Pulse {
  id: string;
  title: string;
  severity: string;
  created_at: string;
  broker_id: string | null;
  broker_name?: string;
  broker_slug?: string;
}

const FALLBACK: Pulse[] = [
  { id: "p1", title: "TradeWave Markets — Withdrawal refused", severity: "high", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), broker_id: null },
  { id: "p2", title: "GoldFX Pro — Fake regulation claim", severity: "high", created_at: new Date(Date.now() - 5 * 86400000).toISOString(), broker_id: null },
  { id: "p3", title: "CryptoEdge BD — Account frozen", severity: "medium", created_at: new Date(Date.now() - 9 * 86400000).toISOString(), broker_id: null },
  { id: "p4", title: "FastPip Capital — Bonus trap clauses", severity: "medium", created_at: new Date(Date.now() - 12 * 86400000).toISOString(), broker_id: null },
  { id: "p5", title: "AlphaBull FX — Slippage manipulation", severity: "low", created_at: new Date(Date.now() - 18 * 86400000).toISOString(), broker_id: null },
  { id: "p6", title: "QuantumTrade — Spread spike at news", severity: "low", created_at: new Date(Date.now() - 22 * 86400000).toISOString(), broker_id: null },
];

const sevColor = (s: string) =>
  s === "high"
    ? "bg-destructive shadow-[0_0_12px_hsl(var(--destructive))]"
    : s === "medium"
    ? "bg-accent shadow-[0_0_10px_hsl(var(--accent))]"
    : "bg-primary shadow-[0_0_8px_hsl(var(--primary))]";

const sevLabel = (s: string) =>
  s === "high" ? "HIGH" : s === "medium" ? "MED" : "LOW";

const daysAgo = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "1d ago";
  return `${d}d ago`;
};

const ScamPulseRadar = () => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
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

  const load = async () => {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data } = await supabase
      .from("scam_alerts")
      .select("id,title,severity,created_at,broker_id")
      .eq("status", "published")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(12);

    if (!data || data.length === 0) {
      setPulses(FALLBACK);
      return;
    }
    const ids = data.map((d: any) => d.broker_id).filter(Boolean);
    const { data: brokers } = ids.length
      ? await supabase.from("brokers").select("id,name,slug").in("id", ids)
      : { data: [] as any[] };
    const bMap = new Map((brokers || []).map((b: any) => [b.id, b]));
    setPulses(
      (data as any[]).map((d) => ({
        ...d,
        broker_name: d.broker_id ? (bMap.get(d.broker_id) as any)?.name : undefined,
        broker_slug: d.broker_id ? (bMap.get(d.broker_id) as any)?.slug : undefined,
      }))
    );
  };

  useEffect(() => {
    if (!visible) return;
    load();
    const channel = supabase
      .channel("scam-pulse-radar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scam_alerts" },
        () => load()
      )
      .subscribe();
    const interval = setInterval(load, 60000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const data = pulses.length > 0 ? pulses : FALLBACK;
  const highCount = data.filter((p) => p.severity === "high").length;
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedData = data.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <section ref={ref} className="container mx-auto px-4 py-16">
      <div className="rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/5 via-card to-card overflow-hidden">
        <div className="px-6 py-5 border-b border-destructive/20 flex items-center justify-between flex-wrap gap-3 bg-destructive/5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Radio className="w-3 h-3 text-destructive" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-destructive">
                  Scam Pulse Radar · Live
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold leading-tight">
                {highCount > 0 ? `${highCount} high-severity` : "Live"} alerts in the last 30 days
              </h2>
            </div>
          </div>
          <Link
            to="/scam-alerts"
            className="text-xs font-mono uppercase tracking-widest text-destructive hover:underline flex items-center gap-1"
          >
            All alerts <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {data.map((p) => {
            const Wrapper: any = p.broker_slug ? Link : "div";
            const props = p.broker_slug ? { to: `/brokers/${p.broker_slug}` } : {};
            return (
              <Wrapper
                key={p.id}
                {...props}
                className={`flex items-center gap-4 px-6 py-4 ${
                  p.broker_slug ? "hover:bg-secondary/40 transition-colors group" : ""
                }`}
              >
                <span
                  className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${sevColor(p.severity)}`}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-foreground truncate group-hover:text-destructive transition-colors">
                    {p.title}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{daysAgo(p.created_at)}</span>
                    {p.broker_name && (
                      <>
                        <span>·</span>
                        <span>{p.broker_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                    p.severity === "high"
                      ? "border-destructive/40 text-destructive bg-destructive/10"
                      : p.severity === "medium"
                      ? "border-accent/40 text-accent bg-accent/10"
                      : "border-primary/40 text-primary bg-primary/10"
                  }`}
                >
                  {sevLabel(p.severity)}
                </span>
              </Wrapper>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <AlertTriangle className="w-3 h-3" />
            Auto-refreshing every 60s · realtime feed
          </div>
          <Link
            to="/dashboard/complaints"
            className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline"
          >
            Report a scam →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ScamPulseRadar;
