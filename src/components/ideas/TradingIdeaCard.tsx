import { useState } from "react";
import { TradingIdea, IdeaComment, ReactionType, REACTION_EMOJI, TIMEFRAME_LABELS, RISK_LABELS, sampleComments } from "@/data/tradingIdeas";
import { MessageSquare, Pin, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const directionConfig = {
  bullish: { icon: TrendingUp, label: "BULLISH 📈", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  bearish: { icon: TrendingDown, label: "BEARISH 📉", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  neutral: { icon: Minus, label: "NEUTRAL ➖", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

const riskColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

interface Props {
  idea: TradingIdea;
}

const TradingIdeaCard = ({ idea }: Props) => {
  const [reactions, setReactions] = useState(idea.reactions);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<IdeaComment[]>(
    sampleComments.filter(c => c.ideaId === idea.id)
  );

  const dir = directionConfig[idea.direction];

  const handleReaction = (type: ReactionType) => {
    setReactions(prev => {
      const updated = { ...prev };
      if (userReaction === type) {
        updated[type] = Math.max(0, updated[type] - 1);
        setUserReaction(null);
      } else {
        if (userReaction) updated[userReaction] = Math.max(0, updated[userReaction] - 1);
        updated[type] = updated[type] + 1;
        setUserReaction(type);
      }
      return updated;
    });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    const newComment: IdeaComment = {
      id: `c-${Date.now()}`, ideaId: idea.id, userId: "me", username: "You",
      body: commentText.trim(), createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    setCommentText("");
    toast.success("Comment posted!");
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div className={`glass-card rounded-xl p-5 transition-all hover:border-primary/20 ${idea.isFeatured ? "border-primary/40 ring-1 ring-primary/20" : ""} ${idea.isPinned ? "border-accent/30" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {idea.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">{idea.username}</span>
            <span className="text-xs text-muted-foreground ml-1.5">@{idea.handle}</span>
            <span className="text-xs text-muted-foreground ml-1.5">· {timeAgo(idea.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {idea.isPinned && <Pin className="w-3.5 h-3.5 text-accent" />}
          {idea.isFeatured && <Sparkles className="w-3.5 h-3.5 text-primary" />}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-foreground">{idea.asset}</span>
        </div>
      </div>

      {/* Direction badge */}
      <div className="mb-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${dir.className}`}>
          <dir.icon className="w-3 h-3" /> {dir.label}
        </span>
      </div>

      {/* Title & Body */}
      <h3 className="text-base font-bold text-foreground mb-1.5">{idea.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{idea.body}</p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-muted-foreground">
        <span className="px-2 py-0.5 rounded bg-muted/50">{TIMEFRAME_LABELS[idea.timeframe]}</span>
        <span className={`px-2 py-0.5 rounded bg-muted/50 ${riskColors[idea.riskLevel]}`}>
          {RISK_LABELS[idea.riskLevel]}
        </span>
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
        {(Object.keys(REACTION_EMOJI) as ReactionType[]).map(type => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
              userReaction === type
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/70 border border-transparent"
            }`}
          >
            <span>{REACTION_EMOJI[type].emoji}</span>
            <span className="font-medium">{REACTION_EMOJI[type].label}</span>
            {reactions[type] > 0 && <span className="font-bold">{reactions[type]}</span>}
          </button>
        ))}

        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-muted/40 text-muted-foreground hover:bg-muted/70 transition-all"
        >
          <MessageSquare className="w-3 h-3" />
          <span className="font-medium">Comment</span>
          <span className="font-bold">{comments.length}</span>
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className={`flex gap-2 ${comment.parentCommentId ? "ml-8" : ""}`}>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                {comment.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{comment.username}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{comment.body}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleComment()}
              className="h-8 text-xs bg-background"
            />
            <Button size="sm" variant="ghost" onClick={handleComment} className="h-8 px-2">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingIdeaCard;
