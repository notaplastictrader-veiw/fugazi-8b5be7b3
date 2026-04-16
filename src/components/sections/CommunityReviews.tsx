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

  const fallbackReviews: Review[] = [
    { id: "r1", author: "Tyler Mather", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", rating: 5, content: "Fast withdrawals, excellent spreads. Been using for 2 years without any issues. Best broker I've tried.", role: "Exness · London, UK" },
    { id: "r2", author: "Wei Wen Chin", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", rating: 5, content: "Raw spreads are incredible for scalping. Execution speed is top-tier. Highly recommended.", role: "IC Markets · Singapore" },
    { id: "r3", author: "Claudio Pensa", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", rating: 5, content: "Passed the challenge on my second attempt. Payout was smooth via Deel. Legit prop firm.", role: "FTMO · Thailand" },
    { id: "r4", author: "Omar Shazad", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", rating: 1, content: "SCAM! Deposited $500, made profit to $1,200. They blocked my withdrawal and froze my account. Stay away!", role: "Quotex · Lahore, Pakistan" },
    { id: "r5", author: "Erin Shafiqa", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", rating: 4, content: "Good for beginners. Low deposit requirement. Spreads could be better though.", role: "XM Global · Kuala Lumpur" },
    { id: "r6", author: "Cian Casey", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face", rating: 5, content: "Switched from IC Markets. Razor account spreads are comparable. Great MT5 integration.", role: "Pepperstone · Adelaide, AU" },
    { id: "r7", author: "Rashid Al-Fayed", avatar: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=80&h=80&fit=crop&crop=face", rating: 1, content: "Fake regulation claims. They manipulated my trades and refused $8,000 withdrawal. Reported to authorities.", role: "TradeWave · Dubai, UAE" },
    { id: "r8", author: "Priya Mehta", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face", rating: 5, content: "Best ECN broker for Indian traders. cTrader platform is amazing. Zero issues in 3 years.", role: "IC Markets · Mumbai, India" },
  ];

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("reviews").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(displayCount);
      if (data && data.length > 0) setReviews(data as Review[]);
      else setReviews(fallbackReviews);
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
