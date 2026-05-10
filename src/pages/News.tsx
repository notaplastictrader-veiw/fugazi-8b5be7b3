import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { Newspaper, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForexNews, type ForexNewsArticle } from "@/hooks/useForexNews";

interface UnifiedArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  source: string;
  url: string;
  image: string;
  timestamp: number;
}

const catColors: Record<string, string> = {
  "live-forex": "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
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
});

const ArticleCard = ({ article }: { article: UnifiedArticle }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = article.image && !imgError;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
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
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-[10px] font-mono uppercase text-[hsl(var(--teal))]">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--teal))] pulse-dot" />
          Live
        </div>
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
          <span className="flex items-center gap-1 text-xs text-primary">
            Read <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};

import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";

const News = () => {
  const { articles: liveArticles, loading } = useForexNews();
  const allArticles: UnifiedArticle[] = liveArticles.map(liveToUnified);

  const {
    visibleItems, page, setPage, totalPages, totalFiltered, totalAll,
    rangeStart, rangeEnd, query, setQuery, sort, setSort, sortOptions, reset,
  } = usePaginatedList(allArticles, {
    searchKeys: ["title", "excerpt", "source"],
    sortOptions: [
      { value: "newest", label: "Newest first", compare: (a, b) => b.timestamp - a.timestamp },
      { value: "oldest", label: "Oldest first", compare: (a, b) => a.timestamp - b.timestamp },
      { value: "source-asc", label: "Source A–Z", compare: (a, b) => a.source.localeCompare(b.source) },
    ],
    pageSize: 12,
  });

  return (
    <MainLayout>
      <SEO
        title="Market News"
        description="Live forex market news from trusted sources, auto-refreshed every 5 minutes."
        path="/news"
      />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--teal))] pulse-dot" />
            📰 LIVE NEWS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">News & Updates</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time forex headlines from trusted sources, auto-refreshed every 5 minutes.
          </p>
        </div>

        {loading && allArticles.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : allArticles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No live news available right now. Check back in a few minutes.</p>
          </div>
        ) : (
          <>
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
              itemLabel="articles"
              searchPlaceholder="Search headlines, sources..."
            />
            {totalFiltered === 0 ? (
              <EmptyResults query={query} onReset={reset} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleItems.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            )}
            <SmartPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />
          </>
        )}
      </section>
    </MainLayout>
  );
};

export default News;
