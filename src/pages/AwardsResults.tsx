import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Trophy, Crown, Medal, Loader2, ArrowLeft } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type Cat = { id: string; year: number; slug: string; title: string; description: string };
type Nom = { id: string; category_id: string; title: string; subtitle: string; logo_url: string; vote_count: number };

export default function AwardsResults() {
  const [sp] = useSearchParams();
  const year = Number(sp.get("year") || new Date().getFullYear());
  const [cats, setCats] = useState<Cat[]>([]);
  const [noms, setNoms] = useState<Nom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [year]);

  async function load() {
    setLoading(true);
    const { data: cs } = await supabase.from("award_categories").select("*")
      .eq("year", year).eq("is_active", true).order("display_order");
    const list = (cs || []) as Cat[];
    setCats(list);
    if (list.length) {
      const { data: ns } = await supabase.from("award_nominees").select("*")
        .in("category_id", list.map(c => c.id))
        .order("vote_count", { ascending: false });
      setNoms((ns || []) as Nom[]);
    } else setNoms([]);
    setLoading(false);
  }

  return (
    <MainLayout>
      <SEO
        title={`NAFT Awards ${year} — Winners`}
        description={`The traders have spoken. See the winners of the ${year} NAFT Community Awards.`}
        path="/awards/results"
      />
      <section className="pt-10 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/awards" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to voting
          </Link>

          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-4">
              <Trophy className="w-3.5 h-3.5" /> NAFT Awards · {year}
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground">
              The <span className="text-primary">Winners</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Voted by verified traders. No paid placements. No hidden agendas.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : cats.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No results yet for {year}.</div>
          ) : (
            <div className="space-y-10">
              {cats.map(cat => {
                const cnoms = noms.filter(n => n.category_id === cat.id);
                if (!cnoms.length) return null;
                const winner = cnoms[0];
                const runners = cnoms.slice(1, 3);
                const total = cnoms.reduce((s, n) => s + n.vote_count, 0) || 1;
                return (
                  <div key={cat.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">{cat.title}</div>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>

                    {/* Winner */}
                    <div className="p-6 flex items-center gap-4 border-b border-border">
                      <div className="relative shrink-0">
                        {winner.logo_url ? (
                          <img src={winner.logo_url} alt={winner.title} className="w-16 h-16 rounded-xl object-contain bg-background p-2 ring-2 ring-primary/40" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-2xl font-display font-extrabold ring-2 ring-primary/40">{winner.title.charAt(0)}</div>
                        )}
                        <Crown className="w-5 h-5 text-primary absolute -top-2 -right-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Winner</div>
                        <div className="font-display font-extrabold text-2xl text-foreground truncate">{winner.title}</div>
                        {winner.subtitle && <div className="text-xs text-muted-foreground truncate">{winner.subtitle}</div>}
                        <div className="mt-2 text-xs font-mono text-primary">
                          {winner.vote_count} votes · {Math.round((winner.vote_count / total) * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Runners up */}
                    {runners.length > 0 && (
                      <div className="p-4 bg-muted/30 grid sm:grid-cols-2 gap-3">
                        {runners.map((n, i) => (
                          <div key={n.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                            <Medal className={`w-4 h-4 shrink-0 ${i === 0 ? "text-foreground/70" : "text-amber-600"}`} />
                            {n.logo_url ? (
                              <img src={n.logo_url} alt={n.title} className="w-8 h-8 rounded object-contain bg-muted/40 p-1 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-muted shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{n.title}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{n.vote_count} votes</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
