import { sampleContributors, sampleIdeas } from "@/data/tradingIdeas";
import { Trophy, TrendingUp, MessageSquare } from "lucide-react";

const IdeasSidebar = ({ onPostClick }: { onPostClick: () => void }) => {
  // Compute trending assets from sample data
  const assetCounts: Record<string, number> = {};
  sampleIdeas.forEach(i => { assetCounts[i.asset] = (assetCounts[i.asset] || 0) + 1; });
  const trendingAssets = Object.entries(assetCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = trendingAssets[0]?.[1] || 1;

  return (
    <div className="space-y-5">
      {/* Quick Post */}
      <div className="glass-card rounded-xl p-4">
        <button
          onClick={onPostClick}
          className="w-full flex items-center gap-3 text-left"
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            ?
          </div>
          <span className="text-sm text-muted-foreground">What's your trade idea today?</span>
        </button>
      </div>

      {/* Top Contributors */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-accent" /> Top Contributors
        </h3>
        <div className="space-y-2.5">
          {sampleContributors.map((c, i) => (
            <div key={c.handle} className="flex items-center gap-2.5">
              <span className={`text-xs font-bold w-4 text-center ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>
                {i + 1}
              </span>
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                {c.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{c.username}</p>
                <p className="text-[10px] text-muted-foreground">{c.ideas} ideas · {c.totalReactions} reactions</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Assets */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" /> Trending Assets
        </h3>
        <div className="space-y-2">
          {trendingAssets.map(([asset, count]) => (
            <div key={asset} className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-foreground w-16">{asset}</span>
              <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-5 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Private Submissions Note */}
      <div className="glass-card rounded-xl p-4 border-border/50">
        <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" /> Report an Issue
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Bug reports, feature requests, and content suggestions go directly to our team privately.
        </p>
        <button
          onClick={onPostClick}
          className="text-xs text-primary hover:underline font-medium"
        >
          Submit a private report →
        </button>
      </div>
    </div>
  );
};

export default IdeasSidebar;
