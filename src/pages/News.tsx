import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForexNews, type ForexNewsArticle } from "@/hooks/useForexNews";

interface EditorialArticle {
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

interface UnifiedArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  source: string; // "Reuters" / "NAFT Editorial"
  url: string;
  image: string;
  timestamp: number; // ms
  isLive: boolean;
}

const fallbackEditorial: EditorialArticle[] = [
  { id: "1", title: "Fed Signals Potential Rate Cut in Q3 2026", slug: "fed-rate-cut-q3", excerpt: "Federal Reserve officials hint at possible interest rate reductions, boosting risk assets and weakening the dollar.", category: "macro", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-12T10:00:00Z" },
  { id: "2", title: "Gold Breaks $2,500 for First Time in History", slug: "gold-breaks-2500", excerpt: "Gold spot price surges past the $2,500 mark as central banks continue aggressive buying.", category: "commodities", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-11T14:00:00Z" },
  { id: "3", title: "Binance Launches New Copy Trading Feature", slug: "binance-copy-trading", excerpt: "The world's largest crypto exchange introduces social trading to compete with eToro.", category: "crypto", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-10T09:00:00Z" },
  { id: "4", title: "FTMO Increases Maximum Account Size to $400K", slug: "ftmo-400k", excerpt: "Leading prop firm FTMO raises the ceiling for funded accounts, attracting experienced traders.", category: "prop-firms", source_url: "#", image_url: "", author: "NAFT Editorial", created_at: "2026-04-09T11:00:00Z" },
];

const catColors: Record<string, string> = {
  "live-forex": "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  macro: "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  commodities: "bg-accent/20 text-accent",
  crypto: "bg-[hsl(var(--purple))]/20 text-[hsl(var(--purple))]",
  "prop-firms": "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  regulation: "bg-primary/20 text-primary",
  forex: "bg-primary/20 text-primary",
  market: "bg-muted-foreground/20 text-muted-foreground",
};

const timeAgo = (ms: number) => {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const liveToUnified = (a: ForexNewsArticle, i: number): UnifiedArticle => ({
  id: `live-${i}-${a.url}`,
  title: a.headline,
  excerpt: a.summary,
  category: "live-forex",
  source: a.source || "News",
  url: a.url,
  image: a.image,
  timestamp: a.datetime * 1000,
  isLive: true,
});

const editorialToUnified = (a: EditorialArticle): UnifiedArticle => ({
  id: a.id,
  title: a.title,
  excerpt: a.excerpt,
  category: a.category,
  source: a.author || "NAFT Editorial",
  url: a.source_url && a.source_url !== "#" ? a.source_url : "",
  image: a.image_url,
  timestamp: new Date(a.created_at).getTime(),
  isLive: false,
});

const ArticleCard = ({ article }: { article: UnifiedArticle }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = article.image && !imgError;
  const Wrapper: any = article.url ? "a" : "div";
  const wrapperProps = article.url
    ? { href: article.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group glass-card rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 transition-all"
    >
      <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-[hsl(var(--teal))]/20 flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Newspaper className="w-10 h-10 text-primary/50" />
        )}
        {article.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-[10px] font-mono uppercase text-[hsl(var(--teal))]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--teal))] pulse-dot" />
            Live
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <Badge className={`text-[10px] font-mono uppercase ${catColors[article.category] || "bg-muted text-muted-foreground"}`}>
            {article.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{timeAgo(article.timestamp)}</span>
        </div>
        <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
          <span className="text-[10px] text-muted-foreground truncate">{article.source}</span>
          {article.url && (
            <span className="flex items-center gap-1 text-xs text-primary">
              Read <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

const News = () => {
  const { articles: liveArticles, loading: liveLoading } = useForexNews();
  const [editorial, setEditorial] = useState<EditorialArticle[]>([]);
  const [editorialLoading, setEditorialLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setEditorial(data && data.length > 0 ? (data as EditorialArticle[]) : fallbackEditorial);
      setEditorialLoading(false);
    };
    load();
  }, []);

  const allArticles: UnifiedArticle[] = [
    ...liveArticles.map(liveToUnified),
    ...editorial.map(editorialToUnified),
  ];

  const categories = ["all", "live-forex", ...Array.from(new Set(editorial.map((a) => a.category)))];
  const filtered = filter === "all" ? allArticles : allArticles.filter((a) => a.category === filter);
  const loading = liveLoading && editorialLoading;

  return (
    <MainLayout>
      <SEO
        title="Market News"
        description="Live forex market news from trusted sources, plus editorial insights from the NAFT team. Updated every 5 minutes."
        path="/news"
      />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--teal))] pulse-dot" />
            📰 LIVE NEWS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">News & Updates</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time forex headlines auto-refreshed every 5 minutes, plus original editorial coverage.
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
              {cat === "live-forex" ? "🔴 Live Forex" : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <ArticleCard key={a.id} article={a} />
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
