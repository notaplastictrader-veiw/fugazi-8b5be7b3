import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  content: string;
  role: string;
}

const CommunityReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const cms = useSiteSettings<Record<string, any>>("community_reviews", {});

  const sectionTitle = cms.section_title || "What Traders";
  const displayCount = cms.display_count || 50;

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("reviews").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(displayCount);
      if (data) setReviews(data as Review[]);
    };
    fetch();
  }, [displayCount]);

  const items = [...reviews, ...reviews];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, j) => {
      const filled = j < Math.floor(rating);
      const half = !filled && j < rating;
      return (
        <Star key={j} className={`w-3.5 h-3.5 ${filled ? "text-accent fill-accent" : half ? "text-accent fill-accent/50" : "text-border"}`} />
      );
    });
  };

  return (
    <section className="py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8">
        <span className="section-tag">// COMMUNITY REVIEWS</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3">
          {sectionTitle} <span className="text-primary">Say</span>
        </h2>
      </div>

      <div className="overflow-hidden">
        <div className="ticker-track-slow">
          {items.map((review, i) => {
            const isComplaint = review.rating <= 2;
            const initials = review.author?.split(" ").map(w => w[0]).join("").slice(0, 2) || "??";
            const isAnonymous = !review.author || review.author.toLowerCase() === "anonymous";
            return (
              <div key={i} className="flex-shrink-0 w-[340px] glass-card rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      isComplaint ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                    }`}>
                      {isAnonymous ? "?" : initials}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-foreground">{isAnonymous ? "Anonymous Trader" : review.author}</div>
                    <div className="text-[10px] text-muted-foreground">{review.role}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{review.content}</p>
                <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-primary hover:underline">
          {showForm ? "Cancel" : "Write a review →"}
        </button>
      </div>

      {showForm && (
        <div className="max-w-7xl mx-auto mt-6">
          <ReviewSubmissionForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
    </section>
  );
};

export default CommunityReviews;
