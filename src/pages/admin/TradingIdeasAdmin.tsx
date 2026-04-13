import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sampleIdeas } from "@/data/tradingIdeas";
import { Eye, EyeOff, Pin, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TradingIdeasAdmin = () => {
  const [ideas, setIdeas] = useState(sampleIdeas.map(i => ({ ...i, isHidden: false })));

  const togglePin = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, isPinned: !i.isPinned } : i));
    toast.success("Pin status updated");
  };
  const toggleFeature = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, isFeatured: !i.isFeatured } : i));
    toast.success("Feature status updated");
  };
  const toggleHide = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, isHidden: !i.isHidden } : i));
    toast.success("Visibility updated");
  };
  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    toast.success("Idea deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Trading Ideas</h1>
          <p className="text-sm text-muted-foreground">Moderate community trading ideas</p>
        </div>
        <Badge variant="secondary">{ideas.length} ideas</Badge>
      </div>

      <div className="space-y-3">
        {ideas.map(idea => {
          const totalReactions = Object.values(idea.reactions).reduce((a, b) => a + b, 0);
          return (
            <Card key={idea.id} className={`${idea.isHidden ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-primary">{idea.asset}</span>
                      <Badge variant={idea.direction === "bullish" ? "default" : idea.direction === "bearish" ? "destructive" : "secondary"} className="text-[10px]">
                        {idea.direction.toUpperCase()}
                      </Badge>
                      {idea.isPinned && <Pin className="w-3 h-3 text-accent" />}
                      {idea.isFeatured && <Sparkles className="w-3 h-3 text-primary" />}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{idea.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {idea.username} · {totalReactions} reactions · {idea.commentCount} comments
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => togglePin(idea.id)} title="Pin">
                      <Pin className={`w-3.5 h-3.5 ${idea.isPinned ? "text-accent" : ""}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleFeature(idea.id)} title="Feature">
                      <Sparkles className={`w-3.5 h-3.5 ${idea.isFeatured ? "text-primary" : ""}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleHide(idea.id)} title="Hide/Show">
                      {idea.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteIdea(idea.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TradingIdeasAdmin;
