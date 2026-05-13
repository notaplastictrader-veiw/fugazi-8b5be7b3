import { useState, useEffect } from "react";
import { Check, Crown, Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const WAITLIST_KEY = "naft_premium_signals_waitlist_v1";

const freeFeatures = [
  "3–5 verified setups / week",
  "Forex majors + Gold",
  "Public Telegram channel",
  "Community access",
];

const premiumFeatures = [
  "20+ verified setups / week",
  "Forex, Gold, Crypto & Indices",
  "Private Telegram + entry alerts",
  "Trade journal & performance reports",
  "1-on-1 analyst Q&A (monthly)",
  "Early access to new features",
];

const PremiumSignalsTier = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    setJoined(!!localStorage.getItem(WAITLIST_KEY));
  }, []);

  const joinWaitlist = () => {
    if (!user) {
      toast({ title: "Create a free account first", description: "We'll notify you the moment Premium goes live." });
      navigate("/signup?next=/signals");
      return;
    }
    localStorage.setItem(WAITLIST_KEY, new Date().toISOString());
    setJoined(true);
    toast({ title: "You're on the list ✓", description: "We'll email you the second Premium launches." });
  };

  return (
    <section id="premium-signals" className="mt-16 mb-4">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30 mb-3">
          <Sparkles className="w-3 h-3" /> LAUNCHING SOON
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-2">
          NAFT Signals — Free vs <span className="text-accent">Premium</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Free will always be free. Premium adds higher frequency, deeper coverage and analyst access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Free */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Free Forever</span>
              <h3 className="text-xl font-display font-bold text-foreground mt-1">Public Channel</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-extrabold text-foreground">$0</div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>
          <ul className="space-y-2 mb-6 flex-1">
            {freeFeatures.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" asChild className="w-full">
            <a href="https://t.me/naftbroadcast" target="_blank" rel="noopener noreferrer">Join Free Channel →</a>
          </Button>
        </div>

        {/* Premium */}
        <div className="rounded-2xl p-6 flex flex-col relative border-2 border-accent/40 bg-gradient-to-br from-accent/10 via-background to-primary/5 shadow-lg">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-accent text-accent-foreground text-[10px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" /> COMING Q1 2026
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent">Premium</span>
              <h3 className="text-xl font-display font-bold text-foreground mt-1">NAFT Pro Signals</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-extrabold text-foreground">$29<span className="text-base text-muted-foreground">+</span></div>
              <div className="text-xs text-muted-foreground">/month (est.)</div>
            </div>
          </div>
          <ul className="space-y-2 mb-6 flex-1">
            {premiumFeatures.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button onClick={joinWaitlist} disabled={joined} className="w-full">
            {joined ? (
              <>✓ You're on the waitlist</>
            ) : (
              <><Bell className="w-4 h-4 mr-1.5" /> Join Premium Waitlist</>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-3 font-mono">
            Founder pricing for the first 500 traders. No card required to join the list.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PremiumSignalsTier;
