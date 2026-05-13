import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, ImagePlus, X, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { notifyAdmins } from "@/lib/notifyAdmins";

interface Props {
  onSuccess: () => void;
}

const PlatformReviewForm = ({ onSuccess }: Props) => {
  const { user } = useAuth();
  const [author, setAuthor] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("Trader");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<{ url: string; uploading?: boolean }[]>([]);

  // Prefill from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, experience_level, trading_style")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setAuthor(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        const r = data.experience_level || data.trading_style;
        if (r) setRole(r.charAt(0).toUpperCase() + r.slice(1) + " Trader");
      }
    })();
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    const remaining = 4 - photos.length;
    const list = Array.from(files).slice(0, remaining);

    for (const file of list) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is over 2MB`);
        continue;
      }
      const placeholder = { url: URL.createObjectURL(file), uploading: true };
      setPhotos((p) => [...p, placeholder]);
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `reviews/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        setPhotos((p) => p.map((ph) => (ph.url === placeholder.url ? { url: data.publicUrl } : ph)));
      } catch (err: any) {
        toast.error(err.message || "Photo upload failed");
        setPhotos((p) => p.filter((ph) => ph.url !== placeholder.url));
      }
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a review.");
      return;
    }
    if (!author.trim() || !content.trim() || rating === 0) {
      toast.error("Please fill in your name, review and rating.");
      return;
    }
    if (photos.some((p) => p.uploading)) {
      toast.error("Please wait for photos to finish uploading.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      author: author.trim(),
      content: content.trim(),
      rating,
      role: role.trim() || "Trader",
      avatar: avatarUrl || "",
      broker_id: null,
      user_id: user.id,
      status: "pending" as const,
      photo_urls: photos.map((p) => p.url),
    });

    setSubmitting(false);
    if (error) {
      console.error("Platform review submit error:", error);
      toast.error(error.message || "Failed to submit review.");
      return;
    }

    notifyAdmins(
      "New platform review",
      `${author.trim()} submitted a ${rating}★ review about NAFT.`,
      "/admin/reviews"
    );

    toast.success("Thanks for your review!");
    onSuccess();
  };

  if (!user) {
    return (
      <div className="glass-card rounded-xl p-6 max-w-lg text-center">
        <LogIn className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-foreground mb-2">Sign in to leave a review</h3>
        <p className="text-sm text-muted-foreground mb-4">Create a free account or log in to share your experience with NAFT.</p>
        <div className="flex items-center justify-center gap-2">
          <Link to="/login" className="px-5 py-2 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Log In</Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-display font-bold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 max-w-lg">
      <h3 className="text-lg font-display font-bold text-foreground mb-1">Review NAFT</h3>
      <p className="text-xs text-muted-foreground mb-4">Share your experience with the platform.</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Display Name *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={100}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">You are a... *</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} maxLength={60}
            placeholder="e.g. Day Trader, Scalper, Swing Trader"
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
            placeholder="Tell other traders what you think about NAFT..."
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 resize-none" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            Photos <span className="text-[10px] text-muted-foreground/60 italic">— Optional</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img loading="lazy" decoding="async" src={p.url} alt="" className={`w-full h-full object-cover ${p.uploading ? "opacity-50" : ""}`} />
                {p.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground bg-background/40">…</div>
                )}
                <button type="button" onClick={() => setPhotos((ph) => ph.filter((_, idx) => idx !== i))}
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
      </div>
    </form>
  );
};

export default PlatformReviewForm;
