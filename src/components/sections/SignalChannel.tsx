import { useState } from "react";
import { Check, Zap } from "lucide-react";
import PremiumApplicationModal from "@/components/modals/PremiumApplicationModal";

const SignalChannel = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// OUR SIGNAL CHANNEL</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-3">
          Gold & Forex Signals You Can Actually <span className="text-primary">Trust.</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
          <div>
            <p className="text-[15px] text-muted-foreground leading-[1.8] mb-6">
              We don't talk about signals. We post them.{" "}
              <span className="font-display font-bold text-primary">Entry. Stop. Target. Done.</span>{" "}
              No charity. No hand-holding. No fake screenshots of wins.
              We publish our track record publicly — every trade, every loss, every win.
              If you can't handle a loss, this channel isn't for you.
              If you're built different — you already know what to do.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>→ 78%+ win rate — tracked and published publicly every month</li>
              <li>→ Full transparency — losses posted same as wins</li>
              <li>→ No credit card needed for free tier</li>
              <li>→ Preferred crypto payments. Contact us for better payment methods.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest">FREE TIER</div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">Basic Signal Access</h3>
              <p className="text-sm text-muted-foreground mb-5">Daily market updates and a few signals per week. No strings attached.</p>
              <ul className="space-y-2.5 mb-6">
                {["Market updates daily", "2–3 signals per week", "Gold & EURUSD only"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="text-lg font-display font-extrabold text-foreground mb-3">Free — forever</div>
              <a href="https://t.me/notaplastictrader" target="_blank" rel="noopener noreferrer"
                className="block w-full py-2.5 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-center">
                Join Free Telegram →
              </a>
              <p className="text-[11px] text-muted-foreground mt-2">No credit card. No BS. Just signals.</p>
            </div>

            {/* Premium */}
            <div className="glass-card rounded-xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(210 40% 10%), hsl(215 45% 15%))" }}>
              <span className="absolute top-3 right-3 text-[9px] font-mono text-accent border border-accent/30 px-2 py-0.5 rounded-full tracking-widest">PREMIUM</span>
              <div className="text-[10px] font-mono text-accent mb-2 tracking-widest">PREMIUM TIER</div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">Full Signal Suite</h3>
              <div className="text-5xl font-display font-black text-accent my-4">78%+</div>
              <p className="text-xs font-mono text-accent/70 mb-4">win rate · tracked publicly every month</p>
              <p className="text-sm text-muted-foreground mb-5">Full access. Gold, FX majors, exact entry, SL and TP. Strategy breakdown every trade.</p>
              <ul className="space-y-2.5 mb-6">
                {["10–15 signals/week", "Gold · FX · Crypto · Indices", "Exact entry SL TP", "Strategy breakdown per trade", "VIP Telegram access"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-accent flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="text-sm font-display font-semibold text-foreground mb-3">Premium Access — Serious Traders Only</div>
              <button onClick={() => setModalOpen(true)}
                className="w-full py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Apply for Access →
              </button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Or contact us on <a href="https://t.me/notaplastictrader" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Telegram</a> for faster processing.</p>
            </div>
          </div>
        </div>
      </div>
      <PremiumApplicationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};

export default SignalChannel;
