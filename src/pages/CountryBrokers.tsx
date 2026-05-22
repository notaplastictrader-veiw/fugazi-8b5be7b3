import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema, faqSchema } from "@/components/seo/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { countryGuideBySlug, countryGuides } from "@/data/countryGuides";
import { Globe, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CTABand from "@/components/common/CTABand";
import NotFound from "./NotFound";

interface BrokerRow {
  id: string; name: string; slug: string; regulation: string[] | null;
  score: number | null; stars: number | null; review_count: number | null; logo_url: string | null;
}

const statusBadge = (s: "legal" | "restricted" | "grey") =>
  s === "legal" ? { color: "bg-primary/15 text-primary border-primary/30", label: "Legal" } :
  s === "restricted" ? { color: "bg-destructive/15 text-destructive border-destructive/30", label: "Restricted" } :
  { color: "bg-accent/15 text-accent border-accent/30", label: "Grey area" };

const CountryBrokers = () => {
  const { slug } = useParams<{ slug: string }>();
  const country = slug ? countryGuideBySlug(slug) : undefined;
  const [brokers, setBrokers] = useState<BrokerRow[]>([]);

  useEffect(() => {
    if (!country) return;
    supabase
      .from("brokers")
      .select("id,name,slug,regulation,score,stars,review_count,logo_url,tags")
      .eq("status", "published")
      .overlaps("regulation", country.preferredRegulators)
      .order("score", { ascending: false })
      .limit(15)
      .then(({ data }) => setBrokers(((data as BrokerRow[]) || []).filter(b => !(b as any).tags?.includes('upcoming'))));
  }, [country]);

  if (!country) return <NotFound />;

  const sb = statusBadge(country.legalStatus);
  const faq = [
    {
      question: `Is forex trading legal in ${country.name}?`,
      answer: `${country.notes}`,
    },
    {
      question: `Which brokers are best for traders in ${country.name}?`,
      answer: `Stick to brokers regulated by ${country.preferredRegulators.join(", ")}. These tier-1 and tier-2 licences offer real consumer protection.`,
    },
    {
      question: `How do I deposit and withdraw from ${country.name}?`,
      answer: `Common methods include ${country.popularPaymentMethods.join(", ")}. Crypto (USDT) is widely used to avoid currency-control delays.`,
    },
  ];

  return (
    <MainLayout>
      <SEO
        title={`Best Forex Brokers in ${country.name} ${new Date().getFullYear()}`}
        description={`Top regulated forex brokers for traders in ${country.name}. Legal status, payment methods, and ${country.preferredRegulators.join(", ")}-licensed broker shortlist.`}
        path={`/brokers/country/${country.slug}`}
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Brokers", path: "/brokers" },
        { name: country.name, path: `/brokers/country/${country.slug}` },
      ])} />
      <JsonLd data={faqSchema(faq)} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{country.flag}</span>
            <Badge className={`border font-mono ${sb.color}`}>{sb.label}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-3">
            Best Forex Brokers in {country.name} ({new Date().getFullYear()})
          </h1>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">{country.notes}</p>
        </header>

        <section className="grid md:grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl border border-border bg-secondary/40">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Recommended Regulators</div>
            <div className="flex flex-wrap gap-1">
              {country.preferredRegulators.map(r => (
                <Link
                  key={r}
                  to={`/regulators/${r.toLowerCase()}`}
                  className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition"
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-secondary/40">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Payment Methods</div>
            <div className="text-xs text-foreground">{country.popularPaymentMethods.join(" · ")}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-secondary/40">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Local Regulator</div>
            <div className="text-xs text-foreground">
              {country.localRegulator ? `${country.localRegulator.code} — ${country.localRegulator.name}` : "No local forex regulator"}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-display font-extrabold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Top brokers for {country.name} traders
          </h2>
          {brokers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No matching brokers published yet — explore the full directory.</p>
          ) : (
            <div className="space-y-2">
              {brokers.map((b, i) => (
                <Link
                  key={b.id}
                  to={`/brokers/${b.slug}`}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                    {b.logo_url && <img src={b.logo_url} alt={b.name} loading="lazy" className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                        <span>{b.score?.toFixed(1) || "—"}/10</span>
                        <span>·</span>
                        <span>{(b.regulation || []).slice(0, 3).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {country.legalStatus !== "legal" && (
          <div className="mb-8 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <strong className="font-bold">Legal note:</strong> Forex regulation in {country.name} is {country.legalStatus === "grey" ? "in a grey area" : "restricted"}. Trade only with funds you can afford to lose and consult a local advisor for tax/compliance.
            </div>
          </div>
        )}

        <CTABand
          eyebrow="Need a personalised match"
          title={`Find your ideal broker for ${country.name}`}
          description="Answer 6 quick questions and get a shortlist tuned to your country, deposit method, and trading style."
          primaryLabel="Start broker matcher"
          primaryTo="/match"
        />

        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="text-lg font-display font-bold mb-3">Brokers by country</h2>
          <div className="flex flex-wrap gap-2">
            {countryGuides.filter(c => c.slug !== country.slug).map(c => (
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
      </div>
    </MainLayout>
  );
};

export default CountryBrokers;
