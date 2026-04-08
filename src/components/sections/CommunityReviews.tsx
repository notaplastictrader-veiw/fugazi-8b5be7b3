import { communityReviews } from "@/data/reviews";
import { Star } from "lucide-react";

const CommunityReviews = () => {
  const items = [...communityReviews, ...communityReviews];

  return (
    <section className="py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8">
        <span className="section-tag">// COMMUNITY REVIEWS</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3">
          What Traders <span className="text-primary">Say</span>
        </h2>
      </div>

      {/* Scrolling Ticker */}
      <div className="overflow-hidden">
        <div className="ticker-track-slow">
          {items.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[340px] glass-card rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  review.isComplaint ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                }`}>
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{review.name}</div>
                  <div className="text-[10px] text-muted-foreground">{review.location}</div>
                </div>
                <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {review.broker}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{review.text}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-3.5 h-3.5 ${j < review.stars ? "text-accent fill-accent" : "text-border"}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <a href="#" className="text-sm text-primary hover:underline">
          Write a review →
        </a>
      </div>
    </section>
  );
};

export default CommunityReviews;
