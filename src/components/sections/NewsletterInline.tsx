import { Shield } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

const NewsletterInline = () => {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card border border-border rounded-2xl p-6 md:p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, hsl(var(--primary)) 0%, transparent 50%)",
            }}
          />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-[10px] font-mono uppercase tracking-widest mb-3">
                <Shield className="w-3 h-3" />
                Free · Weekly · No spam
              </div>
              <h2 className="font-condensed text-2xl md:text-4xl uppercase tracking-tight mb-2">
                Get scam alerts <span className="text-primary">before they cost you money.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                Join 12,000+ traders who get our weekly broker watchlist, regulator actions and
                payout-speed leaderboard — straight to inbox.
              </p>
            </div>
            <div className="md:min-w-[320px]">
              <NewsletterSignup source="homepage_inline" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterInline;
