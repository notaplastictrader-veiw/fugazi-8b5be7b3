import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { ArrowRight, Shield, AlertTriangle } from "lucide-react";

interface PropFirm {
  id: string;
  name: string;
  slug: string;
  score: number;
  min_deposit: string;
  badge: string;
  long_review: any;
}

const PropFirmsComparison = () => {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("brokers")
          .select("id, name, slug, score, min_deposit, badge, long_review")
          .eq("status", "published")
          .eq("type", "prop-firm")
          .order("score", { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setFirms((data as PropFirm[] || []).filter(f => f.long_review));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  const comparisonRows = useMemo(() => {
    return firms.slice(0, 12).map((firm) => {
      const review = firm.long_review || {};
      const atAGlance = review.at_a_glance || {};
      const challenges = review.challenges || [];
      const firstChallenge = challenges[0] || {};
      const firstSize = (firstChallenge.sizes || [])[0] || {};
      const payout = review.payout_verification || {};
      return {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        score: firm.score,
        badge: firm.badge,
        challengeFee: firstSize.fee || firm.min_deposit || "—",
        accountSize: firstSize.size ? `$${firstSize.size}` : "—",
        profitSplit: atAGlance.profit_split_short || "—",
        maxDrawdown: atAGlance.max_overall_drawdown_short || "—",
        dailyDrawdown: atAGlance.max_daily_drawdown_short || "—",
        profitTarget: atAGlance.profit_target_short || "—",
        withdrawal: payout.average_processing_days || "—",
        challengeType: firstChallenge.type || "—",
      };
    });
  }, [firms]);

  return (
    <MainLayout>
      <SEO
        title="Prop Firm Comparison — Challenge Fees, Payouts & Profit Splits"
        description="Side-by-side prop firm comparison. Compare challenge fees, profit splits, withdrawal rules, drawdowns, and account sizes for top funded trading accounts."
        path="/prop-firms/comparison"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Prop Firms", path: "/prop-firms" },
          { name: "Comparison", path: "/prop-firms/comparison" },
        ])}
      />

      <section className="pt-6 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// PROP FIRM COMPARISON</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Compare <span className="text-accent">Prop Firms</span> Side-by-Side
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Find the right funded account by comparing challenge fees, profit splits, withdrawal rules, and drawdown limits in one place.
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : comparisonRows.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No prop firms available for comparison yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border bg-card mb-8">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-foreground font-display uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-secondary/50 min-w-[160px]">Firm</th>
                      <th className="px-4 py-3">Challenge Fee</th>
                      <th className="px-4 py-3">Account Size</th>
                      <th className="px-4 py-3">Profit Split</th>
                      <th className="px-4 py-3">Withdrawal</th>
                      <th className="px-4 py-3">Max Drawdown</th>
                      <th className="px-4 py-3">Daily DD</th>
                      <th className="px-4 py-3">Profit Target</th>
                      <th className="px-4 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row) => (
                      <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 sticky left-0 bg-card">
                          <div className="flex items-center gap-2">
                            <Link to={`/brokers/${row.slug}`} className="font-display font-bold text-foreground hover:text-accent transition-colors">
                              {row.name}
                            </Link>
                            {row.badge === "verified" && <Shield className="w-3.5 h-3.5 text-primary" />}
                            {row.badge === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">{row.challengeFee}</td>
                        <td className="px-4 py-3 font-mono">{row.accountSize}</td>
                        <td className="px-4 py-3 font-mono">{row.profitSplit}</td>
                        <td className="px-4 py-3 font-mono">{row.withdrawal}</td>
                        <td className="px-4 py-3 font-mono">{row.maxDrawdown}</td>
                        <td className="px-4 py-3 font-mono">{row.dailyDrawdown}</td>
                        <td className="px-4 py-3 font-mono">{row.profitTarget}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${row.score >= 8 ? "text-primary" : row.score >= 5 ? "text-accent" : "text-destructive"}`}>
                            {row.score}/10
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">Challenge Fee</h3>
                  <p className="text-sm text-muted-foreground">
                    The one-time evaluation cost to start a funded challenge. Lower fees reduce risk if you don't pass on the first try.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">Profit Split</h3>
                  <p className="text-sm text-muted-foreground">
                    The percentage of simulated profits you keep once funded. 80/20 or 90/10 splits are common in the industry.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">Withdrawal Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    How quickly you can request payouts and how long processing takes. Faster, fee-free withdrawals are preferred by most traders.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Want the full prop firm list?</h3>
              <p className="text-sm text-muted-foreground">Browse every verified prop firm with detailed reviews and filters.</p>
            </div>
            <Link
              to="/prop-firms"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              View All Prop Firms
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default PropFirmsComparison;
