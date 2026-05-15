import { Check, Sparkles, Shield, Zap, Bot, BarChart3, Bell, Headphones } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useProStatus } from "@/hooks/useProStatus";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    cta: "Current plan",
    features: [
      "Browse all broker reviews",
      "Read scam alerts",
      "Basic comparison (2 brokers)",
      "Community forum access",
    ],
  },
  {
    name: "NAFT Pro",
    price: "$9",
    cadence: "/ month",
    highlighted: true,
    badge: "Most popular",
    cta: "Join waitlist",
    features: [
      "Compare up to 4 brokers side-by-side",
      "Hidden risk alerts on watchlist brokers",
      "Full Broker Health Score™ history",
      "AI-generated Trust Audit PDF",
      "Weekly audio digest (podcast)",
      "Ad-free experience",
      "Priority support",
      "Early access to new features",
    ],
  },
  {
    name: "NAFT Pro Annual",
    price: "$79",
    cadence: "/ year",
    badge: "Save 27%",
    cta: "Join waitlist",
    features: [
      "Everything in NAFT Pro",
      "2 months free",
      "Annual Trust Report PDF",
      "Founder-direct Telegram channel",
    ],
  },
];

const PERKS = [
  { icon: Shield, title: "Hidden Risk Alerts", body: "Get notified the moment your watchlist broker receives a complaint, regulator action, or sentiment drop." },
  { icon: BarChart3, title: "Health Score History", body: "Track every broker's Health Score™ over time. Spot decline before it costs you." },
  { icon: Bot, title: "AI Trust Audit", body: "Personalized PDF report combining your trading style, country, and broker history." },
  { icon: Headphones, title: "Weekly Audio Digest", body: "Listen to the week's most important broker news on your commute." },
  { icon: Zap, title: "Side-by-side x4", body: "Compare up to 4 brokers at once with deep filters." },
  { icon: Bell, title: "Ad-free", body: "No sponsored ribbons, no broker ads. Just the data." },
];

export default function Pro() {
  const { user } = useAuth();
  const { isPro } = useProStatus();

  const handleWaitlist = () => {
    if (!user) {
      toast.info("Sign in to join the waitlist");
      return;
    }
    toast.success("You're on the waitlist! We'll email you when Pro launches.");
  };

  return (
    <MainLayout>
      <SEO
        title="NAFT Pro — Trader-grade tools, hidden risk alerts | NAFT"
        description="Unlock advanced broker comparison, hidden risk alerts, AI trust audits, weekly audio digest and an ad-free experience with NAFT Pro."
        path="/pro"
      />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" /> NAFT Pro · Coming soon
          </div>
          <h1 className="font-condensed text-5xl md:text-6xl uppercase tracking-tight mb-4">
            Trader-grade <span className="text-primary">protection</span>.<br />
            Built for serious capital.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            NAFT is free for everyone. NAFT Pro adds the deep tools and live alerts that protect funded traders, prop firm passers, and full-time retail.
          </p>
          {isPro && (
            <p className="mt-4 text-primary font-mono text-sm">✓ You're already a Pro member.</p>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`glass-card border p-6 flex flex-col ${
                p.highlighted ? "border-primary shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]" : "border-border"
              }`}
            >
              {p.badge && (
                <div className="inline-block self-start mb-3 text-[10px] font-mono uppercase tracking-widest bg-primary/15 text-primary px-2 py-1 rounded">
                  {p.badge}
                </div>
              )}
              <h3 className="font-condensed text-2xl uppercase tracking-wide">{p.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground ml-1">{p.cadence}</span>
              </div>
              <ul className="space-y-2 text-sm flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {p.name === "Free" ? (
                <Button variant="outline" disabled className="w-full">{p.cta}</Button>
              ) : (
                <Button onClick={handleWaitlist} variant={p.highlighted ? "default" : "outline"} className="w-full">
                  {p.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Perks grid */}
        <h2 className="font-condensed text-3xl uppercase tracking-wide mb-6 text-center">What you unlock</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {PERKS.map((p) => (
            <div key={p.title} className="glass-card border border-border p-5">
              <p.icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Trust footer */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
          <p className="mb-2">
            <strong className="text-foreground">No paid score manipulation.</strong> Brokers cannot pay to change their score — that rule is permanent.
          </p>
          <p>
            Questions? <Link to="/contact" className="text-primary underline">Talk to the team</Link>.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
