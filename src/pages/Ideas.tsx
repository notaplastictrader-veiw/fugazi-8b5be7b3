import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus } from "lucide-react";
import { sampleIdeas, TradingIdea } from "@/data/tradingIdeas";
import TradingIdeaCard from "@/components/ideas/TradingIdeaCard";
import PostIdeaModal from "@/components/ideas/PostIdeaModal";
import IdeasSidebar from "@/components/ideas/IdeasSidebar";

const SORT_OPTIONS = ["trending", "latest", "reactions", "discussed"] as const;
type SortOption = typeof SORT_OPTIONS[number];
const SORT_LABELS: Record<SortOption, string> = {
  trending: "Trending", latest: "Latest", reactions: "Most Reactions", discussed: "Most Discussed",
};

const ASSET_FILTERS = ["All", "XAU/USD", "EUR/USD", "GBP/USD", "BTC/USD", "USD/JPY", "Other"];

const Ideas = () => {
  const [postOpen, setPostOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("trending");
  const [assetFilter, setAssetFilter] = useState("All");

  const sortedIdeas = useMemo(() => {
    let filtered = [...sampleIdeas];

    if (assetFilter !== "All") {
      if (assetFilter === "Other") {
        const known = ASSET_FILTERS.filter(a => a !== "All" && a !== "Other");
        filtered = filtered.filter(i => !known.includes(i.asset));
      } else {
        filtered = filtered.filter(i => i.asset === assetFilter);
      }
    }

    switch (sort) {
      case "latest":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "reactions":
        return filtered.sort((a, b) => {
          const ra = Object.values(b.reactions).reduce((x, y) => x + y, 0);
          const rb = Object.values(a.reactions).reduce((x, y) => x + y, 0);
          return ra - rb;
        });
      case "discussed":
        return filtered.sort((a, b) => b.commentCount - a.commentCount);
      case "trending":
      default:
        // Pinned first, then by total reactions + recency
        return filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const ra = Object.values(a.reactions).reduce((x, y) => x + y, 0);
          const rb = Object.values(b.reactions).reduce((x, y) => x + y, 0);
          const recencyA = new Date(a.createdAt).getTime();
          const recencyB = new Date(b.createdAt).getTime();
          return (rb + recencyB / 1e10) - (ra + recencyA / 1e10);
        });
    }
  }, [sort, assetFilter]);

  return (
    <MainLayout>
      <SEO title="Trading Ideas" description="Share your market analysis and trade setups with the NAFT community. Vote, react, and discuss trading ideas." path="/ideas" />

      <section className="max-w-7xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-3">
              <Sparkles className="w-3 h-3 inline mr-1" /> COMMUNITY
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
              Trading <span className="text-primary">Ideas</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Share your market analysis and trade setups with the community.
            </p>
          </div>
          <Button onClick={() => setPostOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Post a Trading Idea
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed — Left */}
          <div className="lg:col-span-2">
            {/* Sort tabs */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sort === s ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Asset filters */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {ASSET_FILTERS.map(a => (
                <button
                  key={a}
                  onClick={() => setAssetFilter(a)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                    assetFilter === a ? "bg-accent/20 text-accent border border-accent/30" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Scrollable Feed */}
            <ScrollArea className="h-[650px] pr-2">
              <div className="space-y-4">
                {sortedIdeas.length > 0 ? (
                  sortedIdeas.map(idea => (
                    <TradingIdeaCard key={idea.id} idea={idea} />
                  ))
                ) : (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <p className="text-muted-foreground text-sm">No ideas found for this filter.</p>
                    <Button variant="outline" className="mt-3" onClick={() => setAssetFilter("All")}>
                      View all ideas
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar — Right */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <IdeasSidebar onPostClick={() => setPostOpen(true)} />
            </div>
          </div>
        </div>
      </section>

      <PostIdeaModal open={postOpen} onClose={() => setPostOpen(false)} />
    </MainLayout>
  );
};

export default Ideas;
