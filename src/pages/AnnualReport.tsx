import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, TrendingUp, Users, MessageSquare, AlertTriangle, Trophy, Sparkles, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type Report = {
  year: number;
  generated_at: string;
  headline_stats: {
    new_users: number; reviews: number; complaints: number; scam_alerts: number;
    signals_published: number; signal_win_rate: number; forecasts: number;
    forum_threads: number; forum_replies: number; award_votes: number;
  };
  top_brokers_overall: any[];
  most_reviewed_brokers: any[];
  most_flagged_brokers: any[];
};

export default function AnnualReport() {
  const { year } = useParams();
  const y = Number(year || new Date().getFullYear());
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      const { data: res, error } = await supabase.functions.invoke("annual-report", {
        body: null, method: "GET" as any,
      }).catch(async () => {
        // fallback to direct fetch with query string
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/annual-report?year=${y}`;
        const r = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string },
        });
        return { data: await r.json(), error: r.ok ? null : new Error("Failed") };
      });
      if (error) setError(error.message);
      else setData(res as Report);
      setLoading(false);
    })();
  }, [y]);

  return (
    <MainLayout>
      <SEO
        title={`State of Brokers ${y} — NAFT Annual Report`}
        description={`The numbers behind ${y}: trader signups, reviews, scam alerts, top brokers, and signal performance — straight from the NAFT community.`}
        path={`/reports/${y}`}
        image={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/annual-report-og?year=${y}${data ? `&users=${data.headline_stats.new_users}&reviews=${data.headline_stats.reviews}&alerts=${data.headline_stats.scam_alerts}&win_rate=${data.headline_stats.signal_win_rate}` : ""}`}
      />
      <section className="pt-10 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3" /> Annual Report
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground">
              State of <span className="text-primary">Brokers</span> {y}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              The unfiltered numbers behind a year of community-driven broker review.
            </p>
            <Link to="/awards" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline font-mono uppercase tracking-wider">
              See the {y} NAFT Awards <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : error || !data ? (
            <div className="text-center py-20 text-muted-foreground">Could not load report. {error}</div>
          ) : (
            <>
              {/* Headline stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
                {[
                  { icon: Users, label: "New traders", value: data.headline_stats.new_users },
                  { icon: MessageSquare, label: "Reviews", value: data.headline_stats.reviews },
                  { icon: AlertTriangle, label: "Complaints", value: data.headline_stats.complaints },
                  { icon: AlertTriangle, label: "Scam alerts", value: data.headline_stats.scam_alerts },
                  { icon: TrendingUp, label: "Signal win rate", value: `${data.headline_stats.signal_win_rate}%` },
                  { icon: TrendingUp, label: "Signals published", value: data.headline_stats.signals_published },
                  { icon: TrendingUp, label: "Forecasts", value: data.headline_stats.forecasts },
                  { icon: MessageSquare, label: "Forum threads", value: data.headline_stats.forum_threads },
                  { icon: MessageSquare, label: "Forum replies", value: data.headline_stats.forum_replies },
                  { icon: Trophy, label: "Award votes", value: data.headline_stats.award_votes },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card">
                    <s.icon className="w-4 h-4 text-primary mb-2" />
                    <div className="text-2xl font-display font-extrabold text-foreground">{s.value}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Most reviewed */}
              <Section title="Most-reviewed brokers" subtitle={`Where the community spent its time in ${y}`}>
                {data.most_reviewed_brokers.length === 0 ? (
                  <Empty msg="No reviews yet for this year." />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.most_reviewed_brokers.map((b: any, i: number) => (
                      <BrokerCard key={b.id} rank={i + 1} broker={b} stat={`${b.year_reviews} reviews · ${b.year_avg}★`} />
                    ))}
                  </div>
                )}
              </Section>

              {/* Most flagged */}
              <Section title="Most-flagged brokers" subtitle="Highest community complaint volume — proceed with caution">
                {data.most_flagged_brokers.length === 0 ? (
                  <Empty msg="No flagged brokers this year. Quiet year." />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.most_flagged_brokers.map((b: any, i: number) => (
                      <BrokerCard key={b.id} rank={i + 1} broker={b} stat={`${b.complaints} complaints`} flagged />
                    ))}
                  </div>
                )}
              </Section>

              {/* Top overall */}
              <Section title="Top-rated overall" subtitle="Highest community star rating to date">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.top_brokers_overall.map((b: any, i: number) => (
                    <BrokerCard key={b.id} rank={i + 1} broker={b} stat={`${b.stars}★ · ${b.review_count} reviews`} />
                  ))}
                </div>
              </Section>

              <div className="mt-16 text-center text-xs font-mono text-muted-foreground">
                Generated {new Date(data.generated_at).toLocaleString()} · Data straight from the NAFT community
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="mb-5">
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-12 border border-dashed border-border rounded-xl text-sm text-muted-foreground">{msg}</div>;
}

function BrokerCard({ rank, broker, stat, flagged }: { rank: number; broker: any; stat: string; flagged?: boolean }) {
  return (
    <Link to={`/broker/${broker.slug}`} className={`block p-4 rounded-xl border bg-card hover:border-primary/40 transition ${flagged ? "border-destructive/40" : "border-border"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${flagged ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>{rank}</div>
        {broker.logo_url ? (
          <img loading="lazy" decoding="async" src={broker.logo_url} alt={broker.name} className="w-10 h-10 rounded object-contain bg-muted/40 p-1" />
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-primary font-bold">{broker.name?.charAt(0)}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-foreground truncate">{broker.name}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{stat}</div>
        </div>
      </div>
    </Link>
  );
}
