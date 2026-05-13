import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { regulators, tierLabel } from "@/data/regulators";
import { Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const RegulatorsIndex = () => {
  const tiers = [1, 2, 3] as const;

  return (
    <MainLayout>
      <SEO
        title="Forex Broker Regulators Explained — Tier 1, 2 & Offshore"
        description="Compare every major forex regulator: FCA, ASIC, CySEC, NFA, FINMA, and more. Understand which licences actually protect your money."
        path="/regulators"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Regulators", path: "/regulators" },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: regulators.map((r, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `https://www.notafugazitrader.com/regulators/${r.slug}`,
          name: r.fullName,
        })),
      }} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Regulation Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-3">
            Forex Regulators: Who Actually Protects Your Money
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Not all regulators are equal. A tier-1 licence (FCA, ASIC, NFA) means real deposit protection.
            An offshore licence often means nothing. Here's the unvarnished breakdown.
          </p>
        </header>

        {tiers.map(tier => {
          const list = regulators.filter(r => r.tier === tier);
          if (list.length === 0) return null;
          return (
            <section key={tier} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={`font-mono border ${
                  tier === 1 ? "bg-primary/15 text-primary border-primary/30" :
                  tier === 2 ? "bg-accent/15 text-accent border-accent/30" :
                  "bg-destructive/15 text-destructive border-destructive/30"
                }`}>{tierLabel(tier)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {tier === 1 ? "Bank-grade protection. Best for serious capital." :
                   tier === 2 ? "Solid mid-tier. EU-passportable, capital requirements." :
                   "Light or no protection. High leverage but high risk."}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {list.map(r => (
                  <Link
                    key={r.slug}
                    to={`/regulators/${r.slug}`}
                    className="group p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-display font-bold text-foreground">
                        {r.code} <span className="text-muted-foreground text-xs font-normal">· {r.country}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </MainLayout>
  );
};

export default RegulatorsIndex;
