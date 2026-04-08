import { Check, Zap } from "lucide-react";

const SignalChannel = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// OUR SIGNAL CHANNEL</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-3">
          Gold & Forex Signals You Can Actually <span className="text-primary">Trust</span>
        </h2>
        <p className="text-muted-foreground mb-10 max-w-lg">
          Join our in-house signal channel. Transparent track record, no fake screenshots.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {/* Free Tier */}
          <div className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all">
            <div className="text-xs font-mono text-primary mb-3">FREE</div>
            <h3 className="text-2xl font-bold text-foreground mb-1">Free Forever</h3>
            <p className="text-sm text-muted-foreground mb-6">Basic market access</p>
            <ul className="space-y-3 mb-8">
              {["Market updates & analysis", "2-3 signals per week", "Gold & EURUSD coverage"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
              Join Free Channel
            </button>
          </div>

          {/* Premium Tier */}
          <div className="glass-card rounded-xl p-6 border-primary/30 relative overflow-hidden hover:border-primary/40 transition-all">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="text-xs font-mono text-accent mb-3">PREMIUM</div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              ৳499<span className="text-sm font-normal text-muted-foreground">/month</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Full signal access</p>
            <ul className="space-y-3 mb-8">
              {[
                "80%+ verified win rate",
                "15-20 signals per week",
                "All pairs + Gold + Crypto",
                "bKash / Nagad / Stripe",
                "Cancel anytime",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Get Premium Access
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          No long-term commitment. Cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default SignalChannel;
