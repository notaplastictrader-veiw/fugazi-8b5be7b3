import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Loader2, Check, Sparkles } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Category = { id: string; slug: string; title: string; description: string; year: number };
type Nominee = { id: string; category_id: string; broker_id: string | null; title: string; subtitle: string; logo_url: string; vote_count: number };

const YEAR = new Date().getFullYear();

export default function Awards() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({}); // category_id -> nominee_id
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => { load(); }, [user]);

  async function load() {
    setLoading(true);
    const { data: cats } = await supabase
      .from("award_categories").select("*").eq("year", YEAR).eq("is_active", true)
      .order("display_order");
    const catList = (cats || []) as Category[];
    setCategories(catList);

    if (catList.length) {
      const { data: noms } = await supabase
        .from("award_nominees").select("*")
        .in("category_id", catList.map(c => c.id))
        .order("vote_count", { ascending: false });
      setNominees((noms || []) as Nominee[]);
    }

    if (user) {
      const { data: votes } = await supabase
        .from("award_votes").select("category_id, nominee_id").eq("user_id", user.id);
      const map: Record<string, string> = {};
      (votes || []).forEach((v: any) => { map[v.category_id] = v.nominee_id; });
      setMyVotes(map);
    }
    setLoading(false);
  }

  async function vote(categoryId: string, nomineeId: string) {
    if (!user) { toast.error("Sign in to vote"); return; }
    if (myVotes[categoryId]) { toast.info("You've already voted in this category"); return; }
    setVoting(nomineeId);
    const { error } = await supabase.from("award_votes").insert({
      user_id: user.id, category_id: categoryId, nominee_id: nomineeId,
    });
    setVoting(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Vote cast");
    load();
  }

  return (
    <MainLayout>
      <SEO
        title={`NAFT Awards ${YEAR} — Community-Voted Best Brokers`}
        description={`Vote for the best forex brokers, prop firms, and signal providers of ${YEAR}. One vote per category, by real verified traders.`}
        path="/awards"
      />
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3" /> {YEAR} Edition
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground mb-4">
              The <span className="text-primary">NAFT Awards</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              The only broker awards voted by the people who actually trade.
              No pay-to-play. No sponsored picks. One vote, one trader.
            </p>
            <Link
              to="/awards/results"
              className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline font-mono uppercase tracking-wider"
            >
              View live winners →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Award categories for {YEAR} will be announced soon.</p>
              <Link to="/contact" className="text-primary text-sm mt-2 inline-block">Suggest a category →</Link>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map(cat => {
                const noms = nominees.filter(n => n.category_id === cat.id);
                const totalVotes = noms.reduce((s, n) => s + n.vote_count, 0);
                const myVote = myVotes[cat.id];
                return (
                  <div key={cat.id}>
                    <div className="mb-5">
                      <div className="flex items-center gap-3 mb-1">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground">{cat.title}</h2>
                      </div>
                      {cat.description && <p className="text-sm text-muted-foreground ml-8">{cat.description}</p>}
                      <p className="text-xs font-mono text-muted-foreground ml-8 mt-1 uppercase tracking-wider">
                        {totalVotes} votes cast {myVote && "· you voted"}
                      </p>
                    </div>

                    {noms.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic ml-8">Nominees coming soon.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {noms.map(n => {
                          const pct = totalVotes ? Math.round((n.vote_count / totalVotes) * 100) : 0;
                          const voted = myVote === n.id;
                          return (
                            <div
                              key={n.id}
                              className={`p-5 rounded-xl border transition-all ${
                                voted ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-start gap-3 mb-3">
                                {n.logo_url ? (
                                  <img src={n.logo_url} alt={n.title} className="w-12 h-12 rounded-lg object-contain bg-muted/40 p-1" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-primary font-display font-bold">
                                    {n.title.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-display font-bold text-foreground truncate">{n.title}</h3>
                                  {n.subtitle && <p className="text-xs text-muted-foreground truncate">{n.subtitle}</p>}
                                </div>
                              </div>

                              {/* Vote bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
                                  <span>{n.vote_count} votes</span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant={voted ? "default" : "outline"}
                                disabled={!!myVote || voting === n.id}
                                onClick={() => vote(cat.id, n.id)}
                                className="w-full gap-2"
                              >
                                {voting === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                 voted ? <><Check className="w-3.5 h-3.5" /> Your Vote</> :
                                 myVote ? "Voted in this category" : "Vote"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!user && categories.length > 0 && (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-semibold">Sign in</Link> to cast your votes.
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
