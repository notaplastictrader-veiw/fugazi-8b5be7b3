import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";

interface Forecast {
  id: string;
  pair: string;
  direction: string;
  potential: string;
  reasoning: string;
  updated_label: string;
  category: string;
  created_at?: string;
}

const tabs = [
  { key: "forex", label: "Forex" },
  { key: "gold", label: "Metal (GOLD)" },
  { key: "crypto", label: "Crypto" },
];

const potentialRank: Record<string, number> = { HIGH: 3, MED: 2, LOW: 1 };

const Forecasts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "forex";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && tabs.some(tab => tab.key === t)) setActiveTab(t);
  }, [searchParams]);

  useEffect(() => {
    const fetchForecasts = async () => {
      setLoading(true);
      const { data } = await supabase.from("forecasts").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (data) setForecasts(data as Forecast[]);
      setLoading(false);
    };
    fetchForecasts();
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const categoryFiltered = forecasts.filter((f) => f.category === activeTab);

  const {
    visibleItems, page, setPage, totalPages, totalFiltered, totalAll,
    rangeStart, rangeEnd, query, setQuery, sort, setSort, sortOptions, reset,
  } = usePaginatedList(categoryFiltered, {
    searchKeys: ["pair", "reasoning"],
    sortOptions: [
      { value: "newest", label: "Newest first", compare: (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime() },
      { value: "potential-desc", label: "Highest potential", compare: (a, b) => (potentialRank[b.potential] ?? 0) - (potentialRank[a.potential] ?? 0) },
      { value: "pair-asc", label: "Pair A–Z", compare: (a, b) => a.pair.localeCompare(b.pair) },
    ],
    pageSize: 12,
  });

  return (
    <MainLayout>
      <SEO title="Market Forecasts" description="Daily forex, gold, and crypto market forecasts. No paid promotions, no broker bias — just honest analysis." path="/forecasts" />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            <BarChart3 className="w-3 h-3 inline mr-1" /> FORECAST ENGINE
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">Forecasts</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Daily analysis. No paid promotions. No broker bias.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-2 text-sm font-mono rounded-full border transition-colors ${
                activeTab === tab.key ? "bg-accent text-accent-foreground border-accent" : "text-muted-foreground border-border hover:border-accent/40"
              }`}>{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ListingToolbar
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
              sortOptions={sortOptions}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalFiltered={totalFiltered}
              totalAll={totalAll}
              itemLabel="forecasts"
              searchPlaceholder="Search by pair or reasoning..."
            />
            {totalFiltered === 0 ? (
              <EmptyResults query={query} onReset={reset} message={query ? undefined : "No forecasts available for this category yet."} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleItems.map((f) => {
                  const isBull = f.direction === "bullish";
                  return (
                    <div key={f.id} className="glass-card rounded-xl p-6 hover:border-accent/20 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground font-mono">{f.pair}</h3>
                        <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${
                          isBull ? "text-primary bg-primary/10 border-primary/20" : "text-destructive bg-destructive/10 border-destructive/20"
                        }`}>
                          {isBull ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {f.direction.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{f.reasoning}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                          f.potential === "HIGH" ? "text-primary bg-primary/10" : f.potential === "MED" ? "text-accent bg-accent/10" : "text-muted-foreground bg-muted"
                        }`}>{f.potential} POTENTIAL</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {f.updated_label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <SmartPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />
          </>
        )}
      </section>
    </MainLayout>
  );
};

export default Forecasts;
