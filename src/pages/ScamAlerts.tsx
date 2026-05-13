import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import ReportScamModal from "@/components/scam/ReportScamModal";
import AuthModal from "@/components/modals/AuthModal";
import { AlertTriangle, Plus, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";
import SponsoredBanner from "@/components/sponsored/SponsoredBanner";
import BecomeSponsorCard from "@/components/sponsored/BecomeSponsorCard";
import CTABand from "@/components/common/CTABand";

interface ScamAlert {
  id: string; title: string; description: string; severity: string; created_at: string;
  is_repeat_offender?: boolean;
}

const fallbackAlerts: ScamAlert[] = [
  { id: "sa1", title: "TradeWave Markets", description: "Withdrawal refused after profit — $12,400 unresolved.", severity: "high", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "sa2", title: "GoldFX Pro", description: "Fake regulation, platform manipulation — $8,200 under investigation.", severity: "high", created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: "sa3", title: "CryptoEdge BD", description: "Account frozen, no response 30+ days — $3,800 unresolved.", severity: "medium", created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
];

const severityRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

const ScamAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ScamAlert[]>(fallbackAlerts);
  const [reportOpen, setReportOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("scam_alerts").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (data && data.length > 0) setAlerts(data as ScamAlert[]);
    };
    fetch();
  }, []);

  const {
    visibleItems, page, setPage, totalPages, totalFiltered, totalAll,
    rangeStart, rangeEnd, query, setQuery, sort, setSort, sortOptions, reset,
  } = usePaginatedList(alerts, {
    searchKeys: ["title", "description"],
    sortOptions: [
      { value: "newest", label: "Newest first", compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() },
      { value: "severity-desc", label: "Most severe", compare: (a, b) => (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0) },
      { value: "title-asc", label: "Title A–Z", compare: (a, b) => a.title.localeCompare(b.title) },
    ],
    pageSize: 12,
  });

  return (
    <MainLayout>
      <SEO
        title="Forex Scam Alerts — Verified Broker Warnings & Fraud Reports"
        description="Browse verified forex scam alerts, broker warnings, and fraud reports. Updated daily — protect yourself from withdrawal refusals and Ponzi schemes."
        path="/scam-alerts"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Scam Alerts", path: "/scam-alerts" },
      ])} />
      <section className="pt-6 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// SCAM WATCH</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Scam <span className="text-destructive">Alerts</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">All verified scam alerts issued by our team and community. Stay safe.</p>

          <CTABand
            eyebrow="Lost money to a broker?"
            title="Report a scam — we'll investigate within 48 hours"
            description="Submit your case with deposit proof. Our team escalates verified complaints publicly and tries to mediate recovery where possible."
            primaryLabel="Report a Scam"
            onPrimaryClick={() => user ? setReportOpen(true) : setAuthOpen(true)}
            secondaryLabel="How we verify →"
            secondaryTo="/how-we-review"
            icon={ShieldAlert}
            variant="destructive"
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
            itemLabel="alerts"
            searchPlaceholder="Search scam alerts..."
          />

          {totalFiltered === 0 ? (
            <EmptyResults query={query} onReset={reset} />
          ) : (
            <div className="space-y-4">
              {visibleItems.map(alert => {
                const daysAgo = Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 86400000);
                return (
                  <Link to={`/scam-alerts/${alert.id}`} key={alert.id} className="block glass-card rounded-xl p-5 hover:border-destructive/20 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="mt-1"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-foreground">{alert.title}</h3>
                            {alert.is_repeat_offender && (
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/40 flex items-center gap-1">
                                <ShieldAlert className="w-2.5 h-2.5" /> Repeat
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{daysAgo}d ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          alert.severity === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-accent/10 text-accent border-accent/20"
                        }`}>{alert.severity} severity</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <SmartPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />

          <div className="mt-8"><SponsoredBanner placement="scam-alerts-mid" /></div>
          <div className="mt-8 max-w-3xl mx-auto"><BecomeSponsorCard variant="inline" context="Scam Alerts" /></div>
        </div>
      </section>
      <ReportScamModal open={reportOpen} onOpenChange={setReportOpen} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </MainLayout>
  );
};

export default ScamAlerts;
