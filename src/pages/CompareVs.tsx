import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Shield, GitCompare, Trophy, Zap, ScrollText, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CTABand from "@/components/common/CTABand";
import NotFound from "./NotFound";

interface BrokerRow {
  id: string; name: string; slug: string; regulation: string[] | null;
  score: number | null; avg_spread: string | null; leverage: string | null;
  min_deposit: string | null; stars: number | null; review_count: number | null;
  complaints: number | null; badge: string | null; logo_url: string | null;
}

// Compare rows config
const ROWS: { key: keyof BrokerRow; label: string; format?: (v: any) => string }[] = [
  { key: "score", label: "Trust Score", format: v => v != null ? `${Number(v).toFixed(1)}/10` : "—" },
  { key: "stars", label: "User Rating", format: v => v != null ? `${Number(v).toFixed(1)} ★` : "—" },
  { key: "regulation", label: "Regulation", format: v => Array.isArray(v) && v.length ? v.join(", ") : "—" },
  { key: "avg_spread", label: "Avg Spread" },
  { key: "leverage", label: "Max Leverage" },
  { key: "min_deposit", label: "Min Deposit" },
  { key: "review_count", label: "Reviews", format: v => v?.toLocaleString() || "0" },
  { key: "complaints", label: "Complaints", format: v => v?.toLocaleString() || "0" },
];

const fmt = (b: BrokerRow, row: typeof ROWS[number]) => {
  const v = b[row.key];
  return row.format ? row.format(v) : (v as any) ?? "—";
};

const CompareVs = () => {
  const { vsSlug } = useParams<{ vsSlug: string }>();
  const [a, setA] = useState<BrokerRow | null>(null);
  const [b, setB] = useState<BrokerRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse "exness-vs-ic-markets" → ["exness", "ic-markets"]
  const slugs = (vsSlug || "").split(/-vs-/);

  useEffect(() => {
    if (slugs.length !== 2) { setLoading(false); return; }
    const [slugA, slugB] = slugs;
    Promise.all([
      supabase.from("brokers").select("*").eq("slug", slugA).eq("status", "published").maybeSingle(),
      supabase.from("brokers").select("*").eq("slug", slugB).eq("status", "published").maybeSingle(),
    ]).then(([ra, rb]) => {
      setA((ra.data as BrokerRow) || null);
      setB((rb.data as BrokerRow) || null);
      setLoading(false);
    });
  }, [vsSlug]);

  if (slugs.length !== 2) return <NotFound />;
  if (loading) return <MainLayout><div className="container mx-auto py-20 text-center text-muted-foreground">Loading comparison…</div></MainLayout>;
  if (!a || !b) return <NotFound />;

  const winner = (a.score || 0) > (b.score || 0) ? a : (b.score || 0) > (a.score || 0) ? b : null;
  const titleStr = `${a.name} vs ${b.name} — Side-by-Side Broker Comparison`;
  const descStr = `Compare ${a.name} (${(a.score || 0).toFixed(1)}/10) vs ${b.name} (${(b.score || 0).toFixed(1)}/10): regulation, spreads, leverage, min deposit, and verified reviews.`;

  // Per-category winners
  const parseSpread = (s: string | null) => {
    if (!s) return Infinity;
    const m = s.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : Infinity;
  };
  const cats = [
    { key: "trust", label: "Trust Score", icon: Trophy, winner: (a.score || 0) >= (b.score || 0) ? a : b, value: (br: BrokerRow) => `${(br.score || 0).toFixed(1)}/10` },
    { key: "spread", label: "Tighter Spreads", icon: Zap, winner: parseSpread(a.avg_spread) <= parseSpread(b.avg_spread) ? a : b, value: (br: BrokerRow) => br.avg_spread || "—" },
    { key: "reg", label: "More Regulators", icon: ScrollText, winner: (a.regulation?.length || 0) >= (b.regulation?.length || 0) ? a : b, value: (br: BrokerRow) => `${br.regulation?.length || 0} licences` },
    { key: "complaints", label: "Fewer Complaints", icon: AlertOctagon, winner: (a.complaints || 0) <= (b.complaints || 0) ? a : b, value: (br: BrokerRow) => `${br.complaints || 0} complaints` },
  ];

  const faqs = [
    { q: `Is ${a.name} regulated?`, a: a.regulation?.length ? `Yes — ${a.name} is regulated by ${a.regulation.join(", ")}.` : `${a.name} has no verified regulator listed in our database. Trade with caution.` },
    { q: `Which has lower spreads, ${a.name} or ${b.name}?`, a: `${parseSpread(a.avg_spread) <= parseSpread(b.avg_spread) ? a.name : b.name} offers tighter spreads on average (${a.name}: ${a.avg_spread || "n/a"} · ${b.name}: ${b.avg_spread || "n/a"}).` },
    { q: `Which broker has the higher trust score?`, a: `${(a.score || 0) >= (b.score || 0) ? a.name : b.name} scores higher overall (${a.name}: ${(a.score || 0).toFixed(1)}/10 · ${b.name}: ${(b.score || 0).toFixed(1)}/10) based on regulation, reviews, and complaints.` },
    { q: `Should I open an account with ${a.name} or ${b.name}?`, a: `It depends on your priorities. ${winner?.name || a.name} wins on overall trust, but compare deposit minimums, available platforms, and your country's regulator before depositing.` },
  ];

  return (
    <MainLayout>
      <SEO
        title={titleStr}
        description={descStr}
        path={`/compare/${vsSlug}`}
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Compare", path: "/compare" },
        { name: `${a.name} vs ${b.name}`, path: `/compare/${vsSlug}` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: titleStr,
        itemListElement: [a, b].map((br, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "FinancialService",
            name: br.name,
            url: `https://www.notafugazitrader.com/brokers/${br.slug}`,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: ((br.stars || (br.score || 0) / 2) || 0).toFixed(1),
              ratingCount: Math.max(br.review_count || 0, 1),
              bestRating: "5",
              worstRating: "1",
            },
          },
        })),
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <GitCompare className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Broker Comparison</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-2">
          {a.name} <span className="text-muted-foreground">vs</span> {b.name}
        </h1>
        <p className="text-muted-foreground mb-8">
          Side-by-side comparison of regulation, spreads, leverage, fees, and verified user reviews.
        </p>

        {winner && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <div className="text-sm">
              <strong className="font-display font-bold text-foreground">Verdict: {winner.name}</strong>
              <span className="text-muted-foreground"> wins on overall trust score ({(winner.score || 0).toFixed(1)}/10).</span>
            </div>
          </div>
        )}

        {/* Winner-by-category */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {cats.map(c => {
            const Icon = c.icon;
            const isA = c.winner.id === a.id;
            return (
              <div key={c.key} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">{c.label}</span>
                </div>
                <div className="font-display font-extrabold text-foreground truncate">{c.winner.name}</div>
                <div className="text-[11px] font-mono text-primary mt-1">
                  {c.value(c.winner)} <span className="text-muted-foreground">vs {c.value(isA ? b : a)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left p-3 font-mono text-[10px] uppercase text-muted-foreground">Metric</th>
                {[a, b].map(br => (
                  <th key={br.id} className="text-left p-3">
                    <Link to={`/brokers/${br.slug}`} className="flex items-center gap-2 group">
                      {br.logo_url && <img src={br.logo_url} alt={br.name} loading="lazy" className="w-8 h-8 rounded-lg object-cover" />}
                      <span className="font-display font-bold group-hover:text-primary transition">{br.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-secondary/20" : ""}>
                  <td className="p-3 font-mono text-[11px] uppercase text-muted-foreground">{row.label}</td>
                  <td className="p-3 font-medium text-foreground">{fmt(a, row)}</td>
                  <td className="p-3 font-medium text-foreground">{fmt(b, row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {[a, b].map(br => (
            <Link
              key={br.id}
              to={`/brokers/${br.slug}`}
              className="group p-4 rounded-xl border border-border hover:border-primary/50 bg-card transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Read full review</div>
                <div className="font-display font-bold text-foreground group-hover:text-primary transition">{br.name}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <CTABand
            eyebrow="Want a custom shortlist"
            title="Get matched in 60 seconds"
            description="Answer 6 questions and get the right broker for your country, deposit method, and trading style."
            primaryLabel="Start matcher"
            primaryTo="/match"
            secondaryLabel="Compare more brokers"
            secondaryTo="/compare"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CompareVs;
