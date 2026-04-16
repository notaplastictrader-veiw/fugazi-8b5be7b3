import { Shield, MessageSquare, Award, BarChart3, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const defaultPerks = [
  { icon: "Shield", text: "Verified badge on your profile" },
  { icon: "MessageSquare", text: "Reply to user reviews publicly" },
  { icon: "Award", text: "Featured placement in search" },
  { icon: "BarChart3", text: "Promotion & analytics dashboard" },
];

const iconMap: Record<string, any> = { Shield, MessageSquare, Award, BarChart3 };

const tiers = [
  {
    name: "Featured + Verified",
    features: ["Everything in Verified", "Featured in search results", "Homepage placement", "Dedicated account manager"],
    cta: "Contact Us →",
    ctaStyle: "highlight" as const,
    note: "Best for high-volume brokers",
    link: "/advertise",
  },
  {
    name: "Verified Partner",
    features: ["Verified badge", "Reply to reviews", "Priority support", "Enhanced profile"],
    cta: "Contact Us →",
    ctaStyle: "secondary" as const,
    note: "Most popular choice",
    link: "/advertise",
  },
  {
    name: "Basic Listing",
    features: ["Company profile", "User reviews", "Basic analytics"],
    cta: "Get Listed →",
    ctaStyle: "ghost" as const,
    link: "/broker-claim",
  },
];

const BrokerJoinSection = () => {
  const cms = useSiteSettings<Record<string, any>>("broker_join_section", {});

  const title = cms.title || "For Brokers & Signal Providers —";
  const description = cms.description || "Join 280+ brokers on the fastest-growing global trading review platform. Build trust with verified reviews and transparent ratings.";
  const benefits = (cms.benefits?.length ? cms.benefits : defaultPerks.map(p => p.text)) as string[];
  const ctaText = cms.cta_text || "Promote Your Broker →";

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// FOR BROKERS</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          {title} <span className="text-accent">List With Us.</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-10 max-w-2xl">Reach 120,000+ real traders worldwide. Promote your broker on the fastest-growing global review platform.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
            <div className="space-y-4">
              {benefits.map((text, i) => {
                const perk = defaultPerks[i];
                const Icon = perk ? iconMap[perk.icon] || Shield : Shield;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Icon className="w-4 h-4 text-accent" /></div>
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 space-y-3">
              <a href="/partnership" className="inline-flex items-center px-6 py-3 text-sm font-display font-bold bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity">
                {ctaText}
              </a>
              <div>
                <a href="/brokers" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                  Already listed? Claim your profile →
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tiers.map((tier) => (
              <div key={tier.name} className={`glass-card rounded-xl p-5 flex flex-col ${tier.ctaStyle === "highlight" ? "border-accent/30 ring-1 ring-accent/20" : tier.ctaStyle === "secondary" ? "border-primary/20 ring-1 ring-primary/10" : ""}`}>
                <div className="text-xs font-mono text-muted-foreground mb-4">{tier.name}</div>
                <ul className="space-y-2 mt-4 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  tier.ctaStyle === "highlight" ? "bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg shadow-accent/20" : "border border-border text-foreground hover:border-primary/40"
                }`}>{tier.cta}</button>
                {"note" in tier && tier.note && <p className="text-[10px] text-muted-foreground mt-2 text-center">{tier.note}</p>}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-6">All listings are reviewed before going live. We do not list brokers with active unresolved scam reports.</p>
      </div>
    </section>
  );
};

export default BrokerJoinSection;
