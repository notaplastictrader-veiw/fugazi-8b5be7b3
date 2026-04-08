import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
}

const ReviewSubmissionForm = ({ onSuccess }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mt4Id, setMt4Id] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || rating === 0) {
      toast.error("Please fill in name, review, and rating.");
      return;
    }
    if (name.length > 100 || content.length > 2000 || mt4Id.length > 50) {
      toast.error("Input too long.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      author: name.trim(),
      content: content.trim(),
      rating,
      role: mt4Id.trim() ? `MT4/MT5: ${mt4Id.trim()}` : "Trader",
      status: "pending" as const,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit review.");
    } else {
      toast.success("Review submitted! It will appear after admin approval.");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 max-w-lg">
      <h3 className="text-lg font-display font-bold text-foreground mb-4">Submit a Review</h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">MT4/MT5 ID (optional)</label>
          <input type="text" value={mt4Id} onChange={(e) => setMt4Id(e.target.value)} maxLength={50}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setRating(s)}>
                <Star className={`w-6 h-6 transition-colors ${s <= (hoveredStar || rating) ? "text-accent fill-accent" : "text-border"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Your Review *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={2000} rows={4}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 resize-none" />
        </div>

        <button type="submit" disabled={submitting}
          className="px-6 py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        <p className="text-[10px] text-muted-foreground">All reviews require admin approval before publishing.</p>
      </div>
    </form>
  );
};

export default ReviewSubmissionForm;
