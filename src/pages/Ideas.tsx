import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, ThumbsUp, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";

const categories = ["Feature Request", "Broker Suggestion", "UI Improvement", "Content Idea", "Other"];

const sampleIdeas = [
  { id: 1, title: "Add broker withdrawal speed tracker", category: "Feature Request", votes: 42, comments: 8, author: "TraderMike", time: "2 days ago" },
  { id: 2, title: "Dark mode for mobile app", category: "UI Improvement", votes: 38, comments: 5, author: "FXQueen", time: "3 days ago" },
  { id: 3, title: "Weekly market recap newsletter", category: "Content Idea", votes: 27, comments: 12, author: "CryptoKhan", time: "5 days ago" },
  { id: 4, title: "Add IC Markets review", category: "Broker Suggestion", votes: 24, comments: 3, author: "ScalpMaster", time: "1 week ago" },
  { id: 5, title: "Copy trading leaderboard", category: "Feature Request", votes: 19, comments: 6, author: "PipHunter", time: "1 week ago" },
  { id: 6, title: "Video tutorials for beginners", category: "Content Idea", votes: 15, comments: 4, author: "NewbieTrader", time: "2 weeks ago" },
];

const Ideas = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Idea submitted! Our team will review it.");
      setTitle(""); setCategory(""); setDescription("");
      setSubmitting(false);
    }, 800);
  };

  return (
    <MainLayout>
      <SEO title="Share Ideas" description="Share your ideas to improve Not A Fugazi Trader. Vote on community suggestions and help shape the platform." path="/ideas" />
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            <Sparkles className="w-3 h-3 inline mr-1" /> COMMUNITY IDEAS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Share Your <span className="text-primary">Ideas</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Help us build the platform you want. Submit ideas, vote on suggestions, and shape NAFT's future.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card rounded-2xl p-8 space-y-5 h-fit">
            <h2 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" /> Submit an Idea
            </h2>
            <Input placeholder="Idea title" value={title} onChange={e => setTitle(e.target.value)} className="bg-background" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Describe your idea..." value={description} onChange={e => setDescription(e.target.value)} className="bg-background min-h-[120px]" />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Idea"}
            </Button>
          </form>

          {/* Ideas List */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Community Ideas</h2>
            {sampleIdeas.map((idea) => (
              <div key={idea.id} className="glass-card rounded-xl p-5 flex gap-4 hover:border-primary/20 transition-all">
                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                  <button className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-foreground">{idea.votes}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{idea.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">{idea.category}</span>
                    <span>by {idea.author}</span>
                    <span>• {idea.time}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {idea.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Ideas;
