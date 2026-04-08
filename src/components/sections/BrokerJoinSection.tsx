import { Shield, MessageSquare, Award, BarChart3, Check } from "lucide-react";

const perks = [
  { icon: Shield, text: "Verified badge on your profile" },
  { icon: MessageSquare, text: "Reply to user reviews publicly" },
  { icon: Award, text: "Featured placement in search" },
  { icon: BarChart3, text: "Promotion & analytics panel" },
];

const tiers = [
  {
    name: "Basic Listing",
    price: "Free",
    priceLabel: null,
    features: ["Company profile", "User reviews", "Basic analytics"],
    cta: "Get Listed →",
    primary: false,
  },
  {
    name: "Verified Partner",
    price: null,
    priceLabel: "Pricing on request",
    features: ["Verified badge", "Reply to reviews", "Priority support", "Enhanced profile"],
    cta: "Contact Us →",
    primary: true,
    note: "Most popular with mid-size brokers",
  },
  {
    name: "Featured + Verified",
    price: null,
    priceLabel: "Pricing on request",
    features: ["Everything in Verified", "Featured in search results", "Homepage placement", "Dedicated account manager"],
    cta: "Contact Us →",
    primary: false,
    note: "Recommended for high-volume brokers",
  },
];

const BrokerJoinSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// FOR BROKERS</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          For Brokers & Signal Providers — <span className="text-accent">List With Us.</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-10 max-w-2xl">Reach 120,000+ real traders across Bangladesh, India, Pakistan, UAE and beyond.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left CTA */}
          <div>
            <p className="text-muted-foreground mb-8 max-w-md">
              Join 280+ brokers on South Asia's fastest-growing review platform. 
              Build trust with verified reviews and transparent ratings.
            </p>
            <div className="space-y-4">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{perk.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card rounded-xl p-5 flex flex-col ${
                  tier.primary ? "border-accent/30" : ""
                }`}
              >
                <div className="text-xs font-mono text-muted-foreground mb-2">{tier.name}</div>
                {tier.price ? (
                  <div className="text-2xl font-display font-black text-foreground mb-1">{tier.price}</div>
                ) : (
                  <div className="text-sm font-mono text-muted-foreground mb-1">{tier.priceLabel}</div>
                )}
                <ul className="space-y-2 mt-4 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                    tier.primary
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrokerJoinSection;
