import { Newspaper, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useForexNews, type ForexNewsArticle } from "@/hooks/useForexNews";
import { useState } from "react";

const timeAgo = (unixSeconds: number) => {
  if (!unixSeconds) return "";
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NewsCard = ({ article }: { article: ForexNewsArticle }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = article.image && !imgError;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-2xl p-4 flex gap-4 hover:border-primary/40 transition-all"
    >
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-[hsl(var(--teal))]/20 flex items-center justify-center">
        {showImage ? (
          <img
            src={article.image}
            alt={article.headline}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Newspaper className="w-7 h-7 text-primary/60" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate max-w-[100px]">
            {article.source || "News"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(article.datetime)}
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.headline}
        </h3>
        {article.summary && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
};

const LatestForexNews = () => {
  const { articles, loading } = useForexNews();
  const display = articles.slice(0, 3);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[hsl(var(--teal))]/10 text-[hsl(var(--teal))] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--teal))] pulse-dot" />
            📡 LIVE FOREX NEWS
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Latest <span className="text-primary">Forex News</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Real-time market headlines, auto-refreshed every 5 minutes.
          </p>
        </div>
        <Link
          to="/news"
          className="flex items-center gap-1.5 text-sm font-mono uppercase text-primary hover:gap-3 transition-all"
        >
          View all news <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading && display.length === 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : display.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground glass-card rounded-2xl">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">News feed temporarily unavailable.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {display.map((article, i) => (
            <NewsCard key={`${article.url}-${i}`} article={article} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestForexNews;
