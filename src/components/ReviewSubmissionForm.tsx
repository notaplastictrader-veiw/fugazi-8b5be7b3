import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, ImagePlus, X, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Props {
  onSuccess: () => void;
  /** When provided, broker is locked to this id and the dropdown is hidden */
  defaultBrokerId?: string;
}

interface BrokerOption {
  id: string;
  name: string;
}

const ReviewSubmissionForm = ({ onSuccess, defaultBrokerId }: Props) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mt4Id, setMt4Id] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [brokerId, setBrokerId] = useState(defaultBrokerId ?? "");
  const [brokers, setBrokers] = useState<BrokerOption[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (defaultBrokerId) return; // No need to fetch list if locked
    const fetchBrokers = async () => {
      const { data } = await supabase.from("brokers").select("id, name").eq("status", "published").order("name");
      if (data) setBrokers(data);
    };
    fetchBrokers();
  }, [defaultBrokerId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 4 - photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => { if (reader.result) setPhotos((p) => [...p, reader.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a review.");
      return;
    }
    if (!name.trim() || !content.trim() || rating === 0) {
      toast.error("Please fill in name, review, and rating.");
      return;
    }
    if (!brokerId) {
      toast.error("Please select a broker.");
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
      broker_id: brokerId || null,
      user_id: user.id,
      status: "pending" as const,
    });

    setSubmitting(false);
    if (error) {
      console.error("Review submit error:", error);
      toast.error(error.message || "Failed to submit review.");
    } else {
      toast.success("Review submitted! It will appear after admin approval.");
      onSuccess();
    }
  };

  if (!user) {
    return (
      <div className="glass-card rounded-xl p-6 max-w-lg text-center">
        <LogIn className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-foreground mb-2">Sign in to leave a review</h3>
        <p className="text-sm text-muted-foreground mb-4">Create a free account or log in to share your trading experience.</p>
        <div className="flex items-center justify-center gap-2">
          <Link to="/login" className="px-5 py-2 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Log In</Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-display font-bold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 max-w-lg">
      <h3 className="text-lg font-display font-bold text-foreground mb-4">Submit a Review</h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Choose Broker</label>
          <select value={brokerId} onChange={(e) => setBrokerId(e.target.value)}
            className="w-full bg-card text-foreground border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/40">
            <option value="" className="bg-card text-foreground">— Select a broker (optional) —</option>
            {brokers.map((b) => (
              <option key={b.id} value={b.id} className="bg-card text-foreground">{b.name}</option>
            ))}
          </select>
        </div>
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

        {/* Photo Upload */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            Photos <span className="text-[10px] text-muted-foreground/60 italic">— Optional</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {photos.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5">
                  <X className="w-3 h-3 text-foreground" />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
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
