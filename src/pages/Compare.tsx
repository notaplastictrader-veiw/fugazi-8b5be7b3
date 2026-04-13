import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X, Star, Shield, AlertTriangle } from "lucide-react";

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
  const [searchParams] = useSearchParams();
  const [allBrokers, setAllBrokers] = useState<BrokerRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const selectKeyRef = useRef(0);

  useEffect(() => {
    supabase.from("brokers").select("*").eq("status", "published").then(({ data }) => {
      if (data) setAllBrokers(data as BrokerRow[]);
    });
  }, []);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !allBrokers.length) return;
    const slugs = searchParams.getAll("b");
    if (slugs.length) {
      const ids = allBrokers.filter(b => slugs.includes(b.slug)).map(b => b.id);
      setSelected(ids);
    }
    initializedRef.current = true;
  }, [allBrokers]);

  const updateUrl = (ids: string[]) => {
    const slugs = ids.map(id => allBrokers.find(b => b.id === id)?.slug).filter(Boolean);
    const params = new URLSearchParams();
    slugs.forEach(s => params.append("b", s!));
    const newUrl = slugs.length ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  };

  useEffect(() => {
    if (!initializedRef.current || !allBrokers.length) return;
    updateUrl(selected);
  }, [selected, allBrokers]);

  const addBroker = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id) || prev.length >= 4) return prev;
      return [...prev, id];
    });
    selectKeyRef.current += 1;
  };

  const removeBroker = (id: string) => {
    setSelected(prev => prev.filter(s => s !== id));
  };

  const compared = selected.map(id => allBrokers.find(b => b.id === id)).filter(Boolean) as BrokerRow[];

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
        title="Compare Brokers"
        description="Compare forex brokers side-by-side. Regulation, spreads, leverage, deposits, scores — see how they stack up."
        path="/compare"
      />
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
          {selected.length < 4 && (
            <Select key={`broker-select-${selectKeyRef.current}`} onValueChange={addBroker}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="+ Add broker" />
              </SelectTrigger>
              <SelectContent>
                {allBrokers.filter(b => !selected.includes(b.id)).map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Table */}
        {compared.length >= 2 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm text-muted-foreground font-mono uppercase tracking-wider w-[160px]">Feature</th>
                  {compared.map(b => (
                    <th key={b.id} className="p-4 text-center">
                      <div className="font-display font-bold text-foreground">{b.name}</div>
                      <a href={`/brokers/${b.slug}`} className="text-xs text-primary hover:underline">Full Review →</a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((f, i) => (
                  <tr key={f.key} className={i % 2 === 0 ? "bg-card/50" : ""}>
                    <td className="p-4 text-sm font-medium text-muted-foreground">{f.label}</td>
                    {compared.map(b => (
                      <td key={b.id} className="p-4 text-sm text-center text-foreground">
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
      </section>
    </MainLayout>
  );
};

export default Compare;
