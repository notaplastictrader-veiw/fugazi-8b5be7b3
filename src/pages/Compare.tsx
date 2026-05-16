import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Star, Shield, AlertTriangle, GitCompare, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CostCalculator from "@/components/calculators/CostCalculator";
import { countryGuides } from "@/data/countryGuides";

interface BrokerRow {
  id: string; name: string; slug: string; regulation: string[] | null; score: number | null;
  avg_spread: string | null; leverage: string | null; min_deposit: string | null;
  stars: number | null; review_count: number | null; complaints: number | null; badge: string | null;
}

const fields: { key: keyof BrokerRow; label: string }[] = [
  { key: "regulation", label: "Regulation" },
  { key: "score", label: "Trust Score" },
  { key: "stars", label: "User Rating" },
  { key: "avg_spread", label: "Avg Spread" },
  { key: "leverage", label: "Leverage" },
  { key: "min_deposit", label: "Min Deposit" },
  { key: "review_count", label: "Reviews" },
  { key: "complaints", label: "Complaints" },
  { key: "badge", label: "Status" },
];

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allBrokers, setAllBrokers] = useState<BrokerRow[]>([]);
  const [selectKey, setSelectKey] = useState(0);

  // Fetch brokers once
  useEffect(() => {
    supabase.from("brokers").select("*").eq("status", "published").then(({ data }) => {
      if (data) setAllBrokers(data as BrokerRow[]);
    });
  }, []);

  // Derive selected from URL — single source of truth
  const selectedSlugs = searchParams.getAll("b");
  const compared = selectedSlugs
    .map(slug => allBrokers.find(b => b.slug === slug))
    .filter(Boolean) as BrokerRow[];

  const addBroker = (id: string) => {
    const broker = allBrokers.find(b => b.id === id);
    if (!broker) return;
    if (selectedSlugs.includes(broker.slug) || selectedSlugs.length >= 4) return;

    const next = new URLSearchParams(searchParams);
    next.append("b", broker.slug);
    setSearchParams(next, { replace: true });
    setSelectKey(k => k + 1);
  };

  const removeBroker = (id: string) => {
    const broker = allBrokers.find(b => b.id === id);
    if (!broker) return;

    const next = new URLSearchParams();
    // Preserve all non-"b" params
    searchParams.forEach((v, k) => {
      if (k !== "b") next.append(k, v);
    });
    // Re-add all "b" params except the removed one
    selectedSlugs.filter(s => s !== broker.slug).forEach(s => next.append("b", s));
    setSearchParams(next, { replace: true });
  };

  const renderCell = (broker: BrokerRow, key: keyof BrokerRow) => {
    const val = broker[key];
    if (key === "regulation") return (val as string[] | null)?.join(", ") || "—";
    if (key === "score") return (
      <span className={`font-bold ${(val as number) >= 8 ? "text-primary" : (val as number) >= 5 ? "text-accent" : "text-destructive"}`}>
        {val ?? "—"}/10
      </span>
    );
    if (key === "stars") return (
      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /> {val ?? "—"}</span>
    );
    if (key === "complaints") return (
      <span className={`flex items-center gap-1 ${(val as number) > 10 ? "text-destructive" : "text-muted-foreground"}`}>
        {(val as number) > 10 && <AlertTriangle className="w-3.5 h-3.5" />} {val ?? 0}
      </span>
    );
    if (key === "badge") return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${val === "verified" ? "bg-primary/10 text-primary" : val === "featured" ? "bg-accent/10 text-accent" : val === "warning" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
        {val === "none" ? "Standard" : (val as string) ?? "Standard"}
      </span>
    );
    return String(val ?? "—");
  };

  return (
    <MainLayout>
      <SEO
        title="Compare Brokers — Side-by-Side Forex Broker Comparison"
        description="Compare up to 4 forex brokers side-by-side: regulation, spreads, leverage, deposits, and trust scores. Share the link to save your comparison."
        path="/compare"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Compare", path: "/compare" },
      ])} />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            COMPARE
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Broker Comparison
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Select up to 4 brokers to compare side-by-side. Share the link to save your comparison.
          </p>
        </div>

        {/* Selector */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {compared.map(b => (
            <div key={b.id} className="glass-card rounded-lg px-4 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{b.name}</span>
              <button onClick={() => removeBroker(b.id)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {selectedSlugs.length < 4 && (
            <Select key={`broker-select-${selectKey}`} onValueChange={addBroker}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="+ Add broker" />
              </SelectTrigger>
              <SelectContent>
                {allBrokers.filter(b => !selectedSlugs.includes(b.slug)).map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Cost Calculator */}
        {compared.length >= 2 && <CostCalculator brokers={compared} />}

        {/* Table */}
        {compared.length >= 2 ? (
          <div className="overflow-x-auto rounded-xl border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.10)] bg-card/40 backdrop-blur-sm">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md">
                <tr className="border-b-2 border-primary/30">
                  <th className="text-left p-4 text-sm text-muted-foreground font-mono uppercase tracking-wider w-[160px] sticky left-0 bg-card/95 backdrop-blur-md z-20 border-r border-primary/20">Feature</th>
                  {compared.map((b, idx) => (
                    <th key={b.id} className={`p-4 text-center min-w-[160px] ${idx > 0 ? "border-l border-primary/20" : ""}`}>
                      <div className="font-display font-bold text-foreground">{b.name}</div>
                      <a href={`/brokers/${b.slug}`} className="text-xs text-primary hover:underline">Full Review →</a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((f, i) => (
                  <tr key={f.key} className={i % 2 === 0 ? "bg-card/50" : ""}>
                    <td className={`p-4 text-sm font-medium text-muted-foreground sticky left-0 z-10 border-r border-primary/20 ${i % 2 === 0 ? "bg-card/95" : "bg-background/95"} backdrop-blur-md`}>{f.label}</td>
                    {compared.map((b, idx) => (
                      <td key={b.id} className={`p-4 text-sm text-center text-foreground transition-colors hover:bg-primary/5 ${idx > 0 ? "border-l border-primary/15" : ""}`}>
                        {renderCell(b, f.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Select at least 2 brokers above to start comparing.</p>
          </div>
        )}

        {/* Programmatic SEO: Popular head-to-head comparisons */}
        {allBrokers.length >= 2 && (
          <section className="mt-16">
            <div className="flex items-center gap-2 mb-4">
              <GitCompare className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display font-extrabold text-foreground">Popular comparisons</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
              Side-by-side reviews of the most-searched broker matchups — regulation, spreads, leverage, and verified user reviews.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(() => {
                const top = [...allBrokers]
                  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                  .slice(0, 8);
                const pairs: { a: BrokerRow; b: BrokerRow }[] = [];
                for (let i = 0; i < top.length && pairs.length < 12; i++) {
                  for (let j = i + 1; j < top.length && pairs.length < 12; j++) {
                    pairs.push({ a: top[i], b: top[j] });
                  }
                }
                return pairs.map(({ a, b }) => (
                  <Link
                    key={`${a.slug}-${b.slug}`}
                    to={`/compare/${a.slug}-vs-${b.slug}`}
                    className="group p-4 rounded-xl border border-border hover:border-primary/50 bg-card transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">Head-to-head</div>
                      <div className="font-display font-bold text-foreground group-hover:text-primary transition truncate">
                        {a.name} <span className="text-muted-foreground">vs</span> {b.name}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {(a.score ?? 0).toFixed(1)} / {(b.score ?? 0).toFixed(1)}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition shrink-0" />
                  </Link>
                ));
              })()}
            </div>
          </section>
        )}

        {/* Programmatic SEO: Country shortlists */}
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-extrabold text-foreground">Best brokers by country</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
            Country-specific shortlists with legal status, recommended regulators, and local payment methods.
          </p>
          <div className="flex flex-wrap gap-2">
            {countryGuides.map(c => (
              <Link
                key={c.slug}
                to={`/brokers/country/${c.slug}`}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:text-primary transition-colors"
              >
                {c.flag} {c.name}
              </Link>
            ))}
          </div>
        </section>
      </section>
    </MainLayout>
  );
};

export default Compare;
