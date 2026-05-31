import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Shield, ExternalLink } from "lucide-react";
import StarRating from "@/components/reviews/StarRating";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";
import NeonCard from "@/components/ui/NeonCard";
import GlowFilterPills from "@/components/ui/GlowFilterPills";
import TopFirmsRail from "@/components/sections/TopFirmsRail";
import TrustLight from "@/components/broker/TrustLight";
import { formatLeverageNumber } from "@/lib/brokerFormat";
import ListingSkeleton from "@/components/common/ListingSkeleton";

interface Broker {
  id: string; name: string; slug: string; type: string; tags: string[];
  regulation: string[]; score: number; avg_spread: string; leverage: string;
  min_deposit: string; stars: number; review_count: number; complaints: number; badge: string;
}

const filters = ["All Prop Firms", "Instant Funding", "1-Step Challenge", "2-Step Challenge", "No Time Limit", "Discount Offers"];
const filterMap: Record<string, string> = { "All Prop Firms": "", "Instant Funding": "instant-funding", "1-Step Challenge": "1-step", "2-Step Challenge": "2-step", "No Time Limit": "no-time-limit", "Discount Offers": "discount" };

const PropFirms = () => {
  const [firms, setFirms] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Prop Firms");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.from("brokers").select("*").eq("status", "published").eq("type", "prop-firm").not("long_review", "is", null).order("score", { ascending: false });
        if (data) setFirms((data as Broker[]).filter(b => !b.tags?.includes('upcoming') && !b.tags?.includes('review-coming-soon') && !b.tags?.includes('nfft-testing')));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);


  const categoryFiltered = firms.filter(b => filter === "All Prop Firms" || b.tags?.includes(filterMap[filter]));

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
      { value: "reviews-desc", label: "Most reviewed", compare: (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0) },
      { value: "name-asc", label: "Name A–Z", compare: (a, b) => a.name.localeCompare(b.name) },
    ],
    pageSize: 12,
  });

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
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.
          </p>

          <GlowFilterPills options={filters} value={filter} onChange={setFilter} accent="accent" className="mb-4" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div>
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
                itemLabel="prop firms"
                searchPlaceholder="Search prop firms by name..."
              />

              {loading && firms.length === 0 ? (
                <ListingSkeleton count={6} gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4" cardHeight="h-64" />
              ) : totalFiltered === 0 ? (
                <EmptyResults query={query} onReset={reset} message={query ? undefined : "No prop firms in this category yet."} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleItems.map(broker => (
                    <NeonCard key={broker.id} accent="accent" className="p-5">
                      {broker.tags?.includes('nfft-testing') && (
                        <div className="mb-3 px-2 py-1 text-[10px] font-mono font-bold tracking-wider text-center rounded border border-accent/40 bg-accent/10 text-accent uppercase animate-pulse">
                          NFFT Testing in Progress
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{broker.name}</h3>
                          <TrustLight score={broker.score} complaints={broker.complaints} className="mt-1" />
                        </div>
                        {broker.badge === "verified" && <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20"><Shield className="w-3 h-3" /> Verified</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div><div className="text-xs text-muted-foreground">Challenge Fee</div><div className="text-sm font-mono font-semibold text-foreground">{broker.min_deposit || "—"}</div></div>
                        <div><div className="text-xs text-muted-foreground">Leverage</div><div className="text-sm font-mono font-semibold text-foreground">{formatLeverageNumber(broker.leverage)}</div></div>
                        <div><div className="text-xs text-muted-foreground">Score</div><div className="text-sm font-mono font-semibold text-foreground">{broker.score}/10</div></div>
                      </div>
                      <div className="mb-3">
                        <div className="score-bar"><div className={`score-bar-fill ${scoreColor(broker.score)}`} style={{ width: `${broker.score * 10}%` }} /></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <StarRating value={broker.stars} size={14} />
                          <span className="text-xs text-muted-foreground ml-1">({broker.review_count})</span>
                        </div>
                        <Link to={`/brokers/${broker.slug}`} className="flex items-center gap-1 text-xs text-accent hover:underline">Full review <ExternalLink className="w-3 h-3" /></Link>
                      </div>
                      <Link to={`/brokers/${broker.slug}`} className="mt-3 block w-full py-2 text-sm font-semibold text-center border border-accent/30 text-accent rounded-lg hover:bg-accent/10 transition-colors">View Profile →</Link>
                    </NeonCard>
                  ))}
                </div>
              )}

              <SmartPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <TopFirmsRail variant="prop-firm" limit={7} title="Top Prop Firms" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default PropFirms;
