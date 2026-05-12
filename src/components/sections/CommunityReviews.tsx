import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, X } from "lucide-react";
import PlatformReviewForm from "@/components/PlatformReviewForm";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VerifiedDepositorBadge from "@/components/reviews/VerifiedDepositorBadge";

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  content: string;
  role: string;
  photo_urls?: string[];
  verified_account?: boolean;
  account_proof_url?: string;
  account_id_masked?: string;
}

const CommunityReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cms = useSiteSettings<Record<string, any>>("community_reviews", {});
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    paused: false,
    dragging: false,
    startX: 0,
    startScroll: 0,
    resumeAt: 0,
  });

  const sectionTitle = cms.section_title || "What Traders Say";
  const accentText = cms.accent_text || "About Us";
  const displayCount = cms.display_count || 50;
  const ctaText = cms.cta_text || "Write a review →";
  const cancelText = cms.cancel_text || "Cancel";

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

  // Auto-scroll loop with pause-on-hover and drag support
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reviews.length === 0) return;

    let rafId = 0;
    const SPEED = 0.6; // px per frame ≈ 36px/s

    const tick = () => {
      const s = stateRef.current;
      if (!s.paused && !s.dragging && (s.resumeAt === 0 || performance.now() >= s.resumeAt)) {
        const half = el.scrollWidth / 2;
        let next = el.scrollLeft + SPEED;
        if (next >= half) next -= half;
        el.scrollLeft = next;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reviews]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    stateRef.current.dragging = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startScroll = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const s = stateRef.current;
    if (!el || !s.dragging) return;
    const dx = e.clientX - s.startX;
    el.scrollLeft = s.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (stateRef.current.dragging) {
      stateRef.current.dragging = false;
      stateRef.current.resumeAt = performance.now() + 800;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      el.classList.remove("dragging");
    }
  };

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
          {sectionTitle} <span className="text-primary">{accentText}</span>
        </h2>
      </div>

      <div
        ref={scrollerRef}
        className="reviews-scroller px-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => { stateRef.current.paused = true; }}
        onMouseLeave={() => { stateRef.current.paused = false; }}
      >
        {items.map((review, i) => {
          const isComplaint = review.rating <= 2;
          const initials = review.author?.split(" ").map(w => w[0]).join("").slice(0, 2) || "??";
          const isAnonymous = !review.author || review.author.toLowerCase() === "anonymous";
          return (
            <div key={i} className="w-[340px] glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                {review.avatar ? (
                  <img src={review.avatar} alt={review.author} draggable={false} className="w-10 h-10 rounded-full object-cover pointer-events-none" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    isComplaint ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                  }`}>
                    {isAnonymous ? "?" : initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{isAnonymous ? "Anonymous Trader" : review.author}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{review.role}</div>
                </div>
              </div>
              {(review.verified_account || review.account_proof_url || review.account_id_masked) && (
                <div className="mb-2">
                  <VerifiedDepositorBadge
                    verified={review.verified_account}
                    hasProof={!!review.account_proof_url}
                    hasAccountId={!!review.account_id_masked}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 whitespace-normal">{review.content}</p>
              {review.photo_urls && review.photo_urls.length > 0 && (
                <div className="flex gap-1.5 mb-3">
                  {review.photo_urls.slice(0, 4).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLightbox(url); }}
                      className="w-12 h-12 rounded-md overflow-hidden border border-border hover:border-primary transition-colors flex-shrink-0"
                    >
                      <img src={url} alt={`Review photo ${idx + 1}`} draggable={false} className="w-full h-full object-cover pointer-events-none" />
                    </button>
                  ))}
                  {review.photo_urls.length > 4 && (
                    <div className="w-12 h-12 rounded-md border border-border bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                      +{review.photo_urls.length - 4}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
            </div>
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors">
          {showForm ? cancelText : ctaText}
        </button>
      </div>

      {showForm && (
        <div className="max-w-7xl mx-auto mt-6">
          <PlatformReviewForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0 shadow-none">
          {lightbox && (
            <img src={lightbox} alt="Review photo" className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CommunityReviews;
