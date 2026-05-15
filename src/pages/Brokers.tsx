import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { Shield, Award, AlertTriangle, ExternalLink, Globe } from "lucide-react";
import { countryGuides } from "@/data/countryGuides";
import { useI18n } from "@/contexts/I18nContext";
import StarRating from "@/components/reviews/StarRating";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";
import NeonCard from "@/components/ui/NeonCard";
import GlowFilterPills from "@/components/ui/GlowFilterPills";
import CTABand from "@/components/common/CTABand";
import { Sparkles } from "lucide-react";
import SponsoredBrokerCard from "@/components/sponsored/SponsoredBrokerCard";
import WatchlistButton from "@/components/broker/WatchlistButton";
import BecomeSponsorCard from "@/components/sponsored/BecomeSponsorCard";

interface Broker {
  id: string; name: string; slug: string; type: string; tags: string[];
  regulation: string[]; score: number; avg_spread: string; leverage: string;
  min_deposit: string; stars: number; review_count: number; complaints: number; badge: string;
}

const filters = ["All", "Forex", "Crypto", "Binary", "ECN", "Scam Watch"];
const filterMap: Record<string, string> = { All: "", Forex: "forex", Crypto: "crypto", Binary: "binary", ECN: "ecn", "Scam Watch": "scam-watch" };
const typeToLabel: Record<string, string> = { forex: "Forex", crypto: "Crypto", binary: "Binary", ecn: "ECN", "scam-watch": "Scam Watch", all: "All" };

const Brokers = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = typeToLabel[(searchParams.get("type") || "").toLowerCase()] || "All";
  const [filter, setFilter] = useState(initialFilter);
  const { t } = useI18n();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("brokers").select("*").eq("status", "published").neq("type", "prop-firm").order("score", { ascending: false });
      if (data) setBrokers(data as Broker[]);
    };
    fetch();
  }, []);

  useEffect(() => {
    const t = (searchParams.get("type") || "").toLowerCase();
    if (t && typeToLabel[t]) setFilter(typeToLabel[t]);
    if (!t) setFilter("All");
  }, [searchParams]);

  const handleFilterClick = (f: string) => {
    setFilter(f);
    const next = new URLSearchParams(searchParams);
    if (f === "All") next.delete("type");
    else next.set("type", filterMap[f]);
    next.delete("page"); // reset pagination when category changes
    setSearchParams(next, { replace: true });
  };

  const matchesFilter = (b: Broker) => {
    if (filter === "All") return true;
    const key = filterMap[filter];
    return (b.tags?.includes(key)) || (b.type?.toLowerCase() === key);
  };

  const categoryFiltered = brokers.filter(matchesFilter);

  const {
    visibleItems, page, setPage, totalPages, totalFiltered, totalAll,
    rangeStart, rangeEnd, query, setQuery, sort, setSort, sortOptions, reset,
  } = usePaginatedList(categoryFiltered, {
    searchKeys: ["name"],
    sortOptions: [
      { value: "score-desc", label: "Top rated", compare: (a, b) => (b.score ?? 0) - (a.score ?? 0) },
      { value: "score-asc", label: "Lowest rated", compare: (a, b) => (a.score ?? 0) - (b.score ?? 0) },
      { value: "name-asc", label: "Name A–Z", compare: (a, b) => a.name.localeCompare(b.name) },
      { value: "reviews-desc", label: "Most reviewed", compare: (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0) },
    ],
    pageSize: 12,
  });

  const scoreColor = (s: number) => s >= 8 ? "bg-primary" : s >= 6 ? "bg-accent" : "bg-destructive";

  return (
    <MainLayout>
      <SEO
        title="Broker Reviews — 280+ Forex Brokers Rated by Real Traders"
        description="Compare 280+ forex & CFD brokers with verified trust scores, spreads, regulation, and real trader reviews. Updated daily — find the safest broker now."
        path="/brokers"
        image="https://www.notafugazitrader.com/og-brokers.jpg"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Brokers", path: "/brokers" },
      ])} />
      <section className="pt-6 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// ALL BROKERS</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Broker <span className="text-primary">Reviews</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Complete list of all verified brokers with trust scores, regulation info, and real user reviews.
          </p>

          <CTABand
            eyebrow="Not sure where to start?"
            title="Match me with the safest broker for my style"
            description="Answer 6 quick questions — get a personalised shortlist of regulated, low-cost brokers in 60 seconds."
            primaryLabel="Find My Broker"
            primaryTo="/match"
            secondaryLabel="Compare manually →"
            secondaryTo="/compare"
            icon={Sparkles}
          />

          <GlowFilterPills options={filters} value={filter} onChange={handleFilterClick} className="mb-4" />


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
            itemLabel="brokers"
            searchPlaceholder="Search brokers by name..."
          />

          {totalFiltered === 0 ? (
            <EmptyResults query={query} onReset={reset} message={query ? undefined : "No brokers in this category yet."} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {page === 1 && <SponsoredBrokerCard />}
              {visibleItems.map(broker => (
                <NeonCard key={broker.id} accent={broker.score >= 8 ? "primary" : broker.score >= 6 ? "accent" : "destructive"} className="p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{broker.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        {broker.regulation?.map(r => <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{r}</span>)}
                      </div>
                    </div>
                    {broker.badge === "verified" && <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20"><Shield className="w-3 h-3" /> Verified</span>}
                    {broker.badge === "featured" && <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/20"><Award className="w-3 h-3" /> Featured</span>}
                    <WatchlistButton brokerId={broker.id} brokerName={broker.name} variant="icon" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div><div className="text-xs text-muted-foreground">Avg Spread</div><div className="text-sm font-mono font-semibold text-foreground">{broker.avg_spread}</div></div>
                    <div><div className="text-xs text-muted-foreground">Leverage</div><div className="text-sm font-mono font-semibold text-foreground">{broker.leverage}</div></div>
                    <div><div className="text-xs text-muted-foreground">Min Deposit</div><div className="text-sm font-mono font-semibold text-foreground">{broker.min_deposit}</div></div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Trust Score</span>
                      <span className="text-sm font-mono font-bold text-foreground">{broker.score}/10</span>
                    </div>
                    <div className="score-bar"><div className={`score-bar-fill ${scoreColor(broker.score)}`} style={{ width: `${broker.score * 10}%` }} /></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StarRating value={broker.stars} size={14} />
                      <span className="text-xs text-muted-foreground ml-1">({broker.review_count})</span>
                    </div>
                    <Link to={`/brokers/${broker.slug}`} className="flex items-center gap-1 text-xs text-primary hover:underline">Full review <ExternalLink className="w-3 h-3" /></Link>
                  </div>
                  <Link to={`/brokers/${broker.slug}`} className="mt-3 block w-full py-2 text-sm font-semibold text-center border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors">View Profile →</Link>
                  {(broker.complaints || 0) > 20 && <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive"><AlertTriangle className="w-3.5 h-3.5" /> {broker.complaints} complaints</div>}
                </NeonCard>
              ))}
            </div>
          )}

          <SmartPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />

          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-extrabold text-foreground">Browse brokers by country</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
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

          <div className="mt-10 max-w-3xl mx-auto">
            <BecomeSponsorCard context="the broker directory" />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Brokers;
