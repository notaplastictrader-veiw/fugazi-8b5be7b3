import { Link, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { glossary, glossaryBySlug } from "@/data/glossary";
import { ArrowLeft, BookOpen } from "lucide-react";
import CTABand from "@/components/common/CTABand";
import NotFound from "./NotFound";

const GlossaryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const term = slug ? glossaryBySlug(slug) : undefined;
  if (!term) return <NotFound />;

  const related = (term.related || [])
    .map(s => glossaryBySlug(s))
    .filter(Boolean) as typeof glossary;

  return (
    <MainLayout>
      <SEO
        title={`${term.term} — Definition & Example`}
        description={term.short.slice(0, 155)}
        path={`/glossary/${term.slug}`}
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Glossary", path: "/glossary" },
        { name: term.term, path: `/glossary/${term.slug}` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: term.term,
        description: term.long,
        url: `https://www.notafugazitrader.com/glossary/${term.slug}`,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "NAFT Trading Glossary",
          url: "https://www.notafugazitrader.com/glossary",
        },
      }} />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/glossary" className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to glossary
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{term.category}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-4">{term.term}</h1>

        <p className="text-lg text-foreground/90 leading-relaxed mb-6 font-medium">{term.short}</p>

        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-muted-foreground leading-relaxed">{term.long}</p>
        </div>

        {term.example && (
          <div className="mb-8 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <div className="text-[10px] font-mono uppercase text-primary mb-1">Example</div>
            <p className="text-sm text-foreground">{term.example}</p>
          </div>
        )}

        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3">Related terms</h2>
            <div className="flex flex-wrap gap-2">
              {related.map(r => (
                <Link
                  key={r.slug}
                  to={`/glossary/${r.slug}`}
                  className="text-xs font-mono px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {r.term}
                </Link>
              ))}
            </div>
          </section>
        )}

        <CTABand
          eyebrow="Ready to apply this knowledge"
          title="Find a broker that fits your strategy"
          description="Answer 6 questions and get matched with regulated brokers tuned to your trading style."
          primaryLabel="Start broker matcher"
          primaryTo="/match"
        />
      </div>
    </MainLayout>
  );
};

export default GlossaryDetail;
