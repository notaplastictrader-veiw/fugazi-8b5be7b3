import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { regulatorBySlug, regulators, tierLabel } from "@/data/regulators";
import { Shield, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CTABand from "@/components/common/CTABand";
import NotFound from "./NotFound";

interface BrokerRow {
  id: string; name: string; slug: string; regulation: string[] | null;
  score: number | null; stars: number | null; review_count: number | null; logo_url: string | null;
  complaints?: number;
}

const RegulatorDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const reg = slug ? regulatorBySlug(slug) : undefined;
  const [brokers, setBrokers] = useState<BrokerRow[]>([]);
  const [totalComplaints, setTotalComplaints] = useState(0);

  useEffect(() => {
    if (!reg) return;
    (async () => {
      const { data } = await supabase
        .from("brokers")
        .select("id,name,slug,regulation,score,stars,review_count,logo_url,complaints")
        .eq("status", "published")
        .contains("regulation", [reg.code])
        .order("score", { ascending: false })
        .limit(20);
      const list = (data as BrokerRow[]) || [];
      setBrokers(list);
      setTotalComplaints(list.reduce((acc, b) => acc + (b.complaints || 0), 0));
    })();
  }, [reg]);

  if (!reg) return <NotFound />;

  const tierColor =
    reg.tier === 1 ? "bg-primary/15 text-primary border-primary/30" :
    reg.tier === 2 ? "bg-accent/15 text-accent border-accent/30" :
    "bg-destructive/15 text-destructive border-destructive/30";

  return (
    <MainLayout>
      <SEO
        title={`${reg.fullName} (${reg.code}) — Regulated Brokers & What It Means`}
        description={`${reg.summary.slice(0, 155)}`}
        path={`/regulators/${reg.slug}`}
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Regulators", path: "/regulators" },
        { name: reg.code, path: `/regulators/${reg.slug}` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "GovernmentOrganization",
        name: reg.fullName,
        alternateName: reg.code,
        url: reg.website,
        areaServed: reg.country,
        foundingDate: reg.established.toString(),
      }} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-7 h-7 text-primary" />
            <Badge className={`border ${tierColor} font-mono`}>{tierLabel(reg.tier)}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-2">
            {reg.fullName} <span className="text-muted-foreground font-mono text-2xl">({reg.code})</span>
          </h1>
          <p className="text-muted-foreground">
            {reg.country} · Established {reg.established} ·{" "}
            <a href={reg.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              Official site <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </header>

        <section className="mb-8 p-5 rounded-xl border border-border bg-secondary/40">
          <p className="text-foreground leading-relaxed">{reg.summary}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-display font-bold mb-3">What it means for traders</h2>
          <p className="text-muted-foreground leading-relaxed">{reg.whatItMeans}</p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <section className="p-5 rounded-xl border border-primary/30 bg-primary/5">
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Protections
            </h3>
            <ul className="space-y-2">
              {reg.protections.map((p, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <span className="text-primary mt-0.5">✓</span> {p}
                </li>
              ))}
            </ul>
          </section>
          <section className="p-5 rounded-xl border border-destructive/30 bg-destructive/5">
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Limits & Trade-offs
            </h3>
            <ul className="space-y-2">
              {reg.limits.map((p, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <span className="text-destructive mt-0.5">!</span> {p}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-display font-extrabold">
              Brokers regulated by {reg.code}
              {brokers.length > 0 && <span className="text-muted-foreground text-base ml-2">({brokers.length})</span>}
            </h2>
            {brokers.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="w-3 h-3" />
                {totalComplaints} total complaint{totalComplaints === 1 ? "" : "s"}
              </div>
            )}
          </div>
          {brokers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No published brokers tagged with {reg.code} yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {brokers.map(b => (
                <Link
                  key={b.id}
                  to={`/brokers/${b.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {b.logo_url && <img src={b.logo_url} alt={b.name} loading="lazy" className="w-9 h-9 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {b.score?.toFixed(1) || "—"}/10 · {b.review_count || 0} reviews · {b.complaints || 0} complaints
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
                <Link
                  key={b.id}
                  to={`/brokers/${b.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {b.logo_url && <img src={b.logo_url} alt={b.name} loading="lazy" className="w-9 h-9 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {b.score?.toFixed(1) || "—"}/10 · {b.review_count || 0} reviews
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <CTABand
          eyebrow="Not sure which regulator fits you"
          title="Find your perfect broker in 60 seconds"
          description="Answer 6 questions, get matched with brokers regulated by jurisdictions that suit your country and risk profile."
          primaryLabel="Start broker matcher"
          primaryTo="/match"
        />

        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="text-lg font-display font-bold mb-3">Other regulators</h2>
          <div className="flex flex-wrap gap-2">
            {regulators.filter(r => r.slug !== reg.slug).slice(0, 12).map(r => (
              <Link
                key={r.slug}
                to={`/regulators/${r.slug}`}
                className="text-xs font-mono px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:text-primary transition-colors"
              >
                {r.code}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default RegulatorDetail;
