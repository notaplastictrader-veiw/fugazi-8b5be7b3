import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { CheckCircle, Users, BarChart3, TrendingUp } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";
import NeonCard from "@/components/ui/NeonCard";
import CTABand from "@/components/common/CTABand";
import { Radio } from "lucide-react";
import PremiumSignalsTier from "@/components/sections/PremiumSignalsTier";
import SponsoredBanner from "@/components/sponsored/SponsoredBanner";
import BecomeSponsorCard from "@/components/sponsored/BecomeSponsorCard";
import ListingSkeleton from "@/components/common/ListingSkeleton";

interface SignalGroup {
  id: string; name: string; win_rate: number; monthly_signals: string;
  avg_rr: string; track_record: string; members: string; verified: boolean;
  categories?: string[];
}

// Wave 0: removed fake "Gold Pulse / Asia FX Scalpers / Prop Killer" fallback
// signal groups. Only real published groups from DB are shown now.

const parseMembers = (m: string) => parseInt((m || "0").replace(/[^\d]/g, ""), 10) || 0;

const Signals = () => {
  const [groups, setGroups] = useState<SignalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase.from("signal_groups").select("*").eq("status", "published").order("win_rate", { ascending: false });
        if (cancelled) return;
        if (fetchError) {
          setError("Couldn't load signal groups. Please try again.");
        } else {
          setGroups((data as SignalGroup[]) || []);
        }
      } catch {
        if (!cancelled) setError("Couldn't load signal groups. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [retryNonce]);

  const {
    visibleItems, page, setPage, totalPages, totalFiltered, totalAll,
    rangeStart, rangeEnd, query, setQuery, sort, setSort, sortOptions, reset,
  } = usePaginatedList(groups, {
    searchKeys: ["name"],
    sortOptions: [
      { value: "winrate-desc", label: "Highest win rate", compare: (a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0) },
      { value: "members-desc", label: "Most members", compare: (a, b) => parseMembers(b.members) - parseMembers(a.members) },
      { value: "name-asc", label: "Name A–Z", compare: (a, b) => a.name.localeCompare(b.name) },
    ],
    pageSize: 12,
  });

  return (
    <MainLayout>
      <SEO
        title="Verified Signal Groups — Forex & Crypto Telegram Signals"
        description="Browse every verified forex and crypto signal group. Real win rates, audited track records, transparent performance — no fake screenshots."
        path="/signals"
        image="https://www.notafugazitrader.com/og-signals.jpg"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Signals", path: "/signals" },
      ])} />
      <section className="pt-6 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// SIGNAL HUB</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Verified Signal <span className="text-primary">Groups</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">Every Telegram group listed, reviewed and rated by real traders.</p>

          <CTABand
            eyebrow="Free for everyone"
            title="Join the NAFT broadcast — verified signals, zero spam"
            description="Daily verified setups across Forex, Gold, and Crypto — straight from our analyst desk to your Telegram."
            primaryLabel="Join Free Channel"
            primaryTo="/signals/naft-broadcast"
            secondaryLabel="Browse all groups ↓"
            secondaryTo="#all-groups"
            icon={Radio}
          />

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
            itemLabel="groups"
            searchPlaceholder="Search signal groups..."
          />

          {loading && groups.length === 0 ? (
            <ListingSkeleton count={6} />
          ) : totalFiltered === 0 ? (
            <EmptyResults query={query} onReset={reset} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleItems.map(group => (
                <NeonCard key={group.id} accent={group.win_rate >= 80 ? "primary" : "accent"} glow={group.win_rate >= 80 ? "lg" : "md"} className="p-6">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
                    {group.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                    {group.categories?.includes('upcoming') && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-dashed border-muted-foreground/40 text-muted-foreground">Upcoming</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /><div><div className="text-xs text-muted-foreground">Win Rate</div><div className="text-sm font-mono font-bold text-foreground">{group.win_rate}%</div></div></div>
                    <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent" /><div><div className="text-xs text-muted-foreground">Monthly</div><div className="text-sm font-mono font-bold text-foreground">{group.monthly_signals}</div></div></div>
                    <div><div className="text-xs text-muted-foreground">Avg R:R</div><div className="text-sm font-mono font-bold text-foreground">{group.avg_rr}</div></div>
                    <div><div className="text-xs text-muted-foreground">Track Record</div><div className="text-sm font-mono font-bold text-foreground">{group.track_record}</div></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="w-4 h-4" />{group.members} members</div>
                    <Link to={`/signals/${group.id}`}>
                      <button className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">View Group</button>
                    </Link>
                  </div>
                </NeonCard>
              ))}
            </div>
          )}

          <SmartPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />

          <div className="mt-8"><SponsoredBanner placement="signals-mid" /></div>

          <PremiumSignalsTier />

          <div className="mt-12 max-w-4xl mx-auto">
            <BecomeSponsorCard context="the Signals hub" />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Signals;
