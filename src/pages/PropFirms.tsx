import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Star, Shield, Award, ExternalLink, Search } from "lucide-react";

interface Broker {
  id: string; name: string; slug: string; type: string; tags: string[];
  regulation: string[]; score: number; avg_spread: string; leverage: string;
  min_deposit: string; stars: number; review_count: number; complaints: number; badge: string;
}

const filters = ["All", "Instant Funding", "Challenge-based", "Crypto Funded", "No Time Limit"];
const filterMap: Record<string, string> = { All: "", "Instant Funding": "instant-funding", "Challenge-based": "challenge", "Crypto Funded": "crypto-funded", "No Time Limit": "no-time-limit" };

const PropFirms = () => {
  const [firms, setFirms] = useState<Broker[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("brokers").select("*").eq("status", "published").eq("type", "prop-firm").order("score", { ascending: false });
      if (data) setFirms(data as Broker[]);
    };
    fetch();
  }, []);

  const filtered = firms
    .filter(b => filter === "All" || b.tags?.includes(filterMap[filter]))
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const scoreColor = (s: number) => s >= 8 ? "bg-primary" : s >= 6 ? "bg-accent" : "bg-destructive";

  return (
    <MainLayout>
      <SEO
        title="Top Prop Firms"
        description="Verified prop trading firms reviewed and rated. Compare challenges, profit splits, and real trader experiences."
        path="/prop-firms"
      />
      <section className="pt-6 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// PROP FIRMS</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Top Verified <span className="text-accent">Prop Firms</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
            Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search prop firms..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/40" />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-colors ${filter === f ? "bg-accent text-accent-foreground border-accent" : "text-muted-foreground border-border hover:border-accent/40"}`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(broker => (
              <div key={broker.id} className="glass-card rounded-xl p-5 hover:border-accent/20 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{broker.name}</h3>
                  {broker.badge === "verified" && <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20"><Shield className="w-3 h-3" /> Verified</span>}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div><div className="text-xs text-muted-foreground">Min Deposit</div><div className="text-sm font-mono font-semibold text-foreground">{broker.min_deposit}</div></div>
                  <div><div className="text-xs text-muted-foreground">Leverage</div><div className="text-sm font-mono font-semibold text-foreground">{broker.leverage}</div></div>
                  <div><div className="text-xs text-muted-foreground">Score</div><div className="text-sm font-mono font-semibold text-foreground">{broker.score}/10</div></div>
                </div>
                <div className="mb-3">
                  <div className="score-bar"><div className={`score-bar-fill ${scoreColor(broker.score)}`} style={{ width: `${broker.score * 10}%` }} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(broker.stars) ? "text-accent fill-accent" : "text-border"}`} />)}
                    <span className="text-xs text-muted-foreground ml-1">({broker.review_count})</span>
                  </div>
                  <a href={`/brokers/${broker.slug}`} className="flex items-center gap-1 text-xs text-accent hover:underline">Full review <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No prop firms found.</p>}
        </div>
      </section>
    </MainLayout>
  );
};

export default PropFirms;
