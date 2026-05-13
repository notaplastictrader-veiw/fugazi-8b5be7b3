import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { glossary, glossaryCategories } from "@/data/glossary";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GlossaryIndex = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "All">("All");

  const filtered = useMemo(() => {
    return glossary.filter(g =>
      (cat === "All" || g.category === cat) &&
      (q === "" || g.term.toLowerCase().includes(q.toLowerCase()) || g.short.toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, cat]);

  return (
    <MainLayout>
      <SEO
        title="Forex & Trading Glossary — Plain-English Definitions"
        description={`${glossary.length} forex, CFD, broker, and risk terms explained in plain English. Pip, leverage, ECN, drawdown, prop firm — everything decoded.`}
        path="/glossary"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Glossary", path: "/glossary" },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        name: "NAFT Trading Glossary",
        url: "https://www.notafugazitrader.com/glossary",
        hasDefinedTerm: glossary.map(g => ({
          "@type": "DefinedTerm",
          name: g.term,
          description: g.short,
          url: `https://www.notafugazitrader.com/glossary/${g.slug}`,
          inDefinedTermSet: "NAFT Trading Glossary",
        })),
      }} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Trader Glossary</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-3">
            Trading Glossary — Plain-English Definitions
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {glossary.length} forex, CFD, broker, and risk terms explained without jargon. Search or browse by category.
          </p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search terms..." className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["All", ...glossaryCategories] as const).map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-xs font-mono px-3 py-1.5 rounded-md border transition ${
                  cat === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(g => (
            <Link
              key={g.slug}
              to={`/glossary/${g.slug}`}
              className="group p-4 rounded-xl border border-border hover:border-primary/50 bg-card transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{g.term}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">{g.category}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{g.short}</p>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No terms match "{q}".</p>
        )}
      </div>
    </MainLayout>
  );
};

export default GlossaryIndex;
