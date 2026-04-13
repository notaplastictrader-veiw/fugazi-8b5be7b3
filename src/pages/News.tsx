import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  source_url: string;
  image_url: string;
  author: string;
  created_at: string;
}

const fallbackArticles: Article[] = [
  { id: "1", title: "Fed Signals Potential Rate Cut in Q3 2026", slug: "fed-rate-cut-q3", excerpt: "Federal Reserve officials hint at possible interest rate reductions, boosting risk assets and weakening the dollar.", category: "macro", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-12T10:00:00Z" },
  { id: "2", title: "Gold Breaks $2,500 for First Time in History", slug: "gold-breaks-2500", excerpt: "Gold spot price surges past the $2,500 mark as central banks continue aggressive buying.", category: "commodities", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-11T14:00:00Z" },
  { id: "3", title: "Binance Launches New Copy Trading Feature", slug: "binance-copy-trading", excerpt: "The world's largest crypto exchange introduces social trading to compete with eToro.", category: "crypto", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-10T09:00:00Z" },
  { id: "4", title: "FTMO Increases Maximum Account Size to $400K", slug: "ftmo-400k", excerpt: "Leading prop firm FTMO raises the ceiling for funded accounts, attracting experienced traders.", category: "prop-firms", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-09T11:00:00Z" },
  { id: "5", title: "Bangladesh SEC Approves 3 New Forex Brokers", slug: "bd-sec-approves-brokers", excerpt: "Securities and Exchange Commission of Bangladesh grants licenses to three international brokers for local operations.", category: "regulation", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-08T08:00:00Z" },
  { id: "6", title: "EUR/USD Drops Below 1.0700 on ECB Dovish Stance", slug: "eurusd-1070", excerpt: "European Central Bank maintains dovish outlook, pushing the euro lower against the dollar.", category: "forex", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-07T16:00:00Z" },
];

const catColors: Record<string, string> = {
  macro: "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  commodities: "bg-accent/20 text-accent",
  crypto: "bg-[hsl(var(--purple))]/20 text-[hsl(var(--purple))]",
  "prop-firms": "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  regulation: "bg-primary/20 text-primary",
  forex: "bg-primary/20 text-primary",
  market: "bg-muted-foreground/20 text-muted-foreground",
};

const News = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setArticles(data && data.length > 0 ? data : fallbackArticles);
      setLoading(false);
    };
    load();
  }, []);

  const categories = ["all", ...Array.from(new Set(articles.map((a) => a.category)))];
  const filtered = filter === "all" ? articles : articles.filter((a) => a.category === filter);

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <MainLayout>
      <SEO
        title="Market News"
        description="Latest forex, crypto, and market news. Analysis, regulation updates, and editorial insights from the NAFT team."
        path="/news"
      />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            📰 NEWS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">News & Updates</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest from forex, crypto, prop firms, and regulation.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all ${filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <article key={a.id} className="glass-card rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <Badge className={`text-[10px] font-mono uppercase ${catColors[a.category] || "bg-muted text-muted-foreground"}`}>
                    {a.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</span>
                </div>
                <h3 className="text-base font-bold text-foreground leading-snug">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{a.excerpt}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground">By {a.author}</span>
                  {a.source_url && a.source_url !== "#" && (
                    <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No articles in this category yet.</p>
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default News;
