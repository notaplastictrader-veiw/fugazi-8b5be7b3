import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { Globe, Sparkles } from "lucide-react";
import { countryGuides } from "@/data/countryGuides";
import { useI18n } from "@/contexts/I18nContext";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";
import GlowFilterPills from "@/components/ui/GlowFilterPills";
import CTABand from "@/components/common/CTABand";
import { useBrokerCount } from "@/hooks/useBrokerCount";
import SponsoredBrokerCard from "@/components/sponsored/SponsoredBrokerCard";
import BecomeSponsorCard from "@/components/sponsored/BecomeSponsorCard";
import BrokerCard, { Broker } from "@/components/broker/BrokerCard";
import ListingSkeleton from "@/components/common/ListingSkeleton";

const filters = ["All", "Forex", "Crypto", "Binary", "ECN", "Scam Watch"];
const filterMap: Record<string, string> = { All: "", Forex: "forex", Crypto: "crypto", Binary: "binary", ECN: "ecn", "Scam Watch": "scam-watch" };
const typeToLabel: Record<string, string> = { forex: "Forex", crypto: "Crypto", binary: "Binary", ecn: "ECN", "scam-watch": "Scam Watch", all: "All" };

const Brokers = () => {
  const { rounded: brokerCountRounded } = useBrokerCount();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = typeToLabel[(searchParams.get("type") || "").toLowerCase()] || "All";
  const [filter, setFilter] = useState(initialFilter);
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase.from("brokers").select("*").eq("status", "published").neq("type", "prop-firm").not("long_review", "is", null).order("score", { ascending: false });
        if (cancelled) return;
        if (fetchError) {
          setError("Couldn't load brokers. Please try again.");
        } else if (data) {
          setBrokers((data as Broker[]).filter(b => !b.tags?.includes('upcoming') && !b.tags?.includes('review-coming-soon')));
        }
      } catch {
        if (!cancelled) setError("Couldn't load brokers. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [retryNonce]);


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
      { value: "score-desc", label: "Top rated", compare: (a, b) => {
        const ar = (a.review_count ?? 0) > 0 ? 1 : 0;
        const br = (b.review_count ?? 0) > 0 ? 1 : 0;
        if (ar !== br) return br - ar;
        return (b.score ?? 0) - (a.score ?? 0);
      } },
      { value: "score-asc", label: "Lowest rated", compare: (a, b) => (a.score ?? 0) - (b.score ?? 0) },
      { value: "name-asc", label: "Name A–Z", compare: (a, b) => a.name.localeCompare(b.name) },
      { value: "reviews-desc", label: "Most reviewed", compare: (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0) },
    ],
    pageSize: 12,
  });

  

  return (
    <MainLayout>
      <SEO
        title={`Broker Reviews — ${brokerCountRounded} Forex Brokers Rated by Real Traders`}
        description={`Compare ${brokerCountRounded} forex & CFD brokers with verified trust scores, spreads, regulation, and real trader reviews. Updated daily — find the safest broker now.`}
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

          {error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
              <p className="text-sm text-foreground mb-3">{error}</p>
              <button onClick={() => setRetryNonce(n => n + 1)} className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90">Retry</button>
            </div>
          ) : loading && brokers.length === 0 ? (
            <ListingSkeleton count={9} />
          ) : totalFiltered === 0 ? (
            <EmptyResults query={query} onReset={reset} message={query ? undefined : "No brokers in this category yet."} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {page === 1 && <SponsoredBrokerCard />}
              {visibleItems.map(broker => (
                <BrokerCard key={broker.id} broker={broker} />
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
