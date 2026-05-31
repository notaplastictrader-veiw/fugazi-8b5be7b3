import { useState } from "react";
import { Shield, MessageSquare, Award, BarChart3, Check, User, Radio, Building2, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import AuthModal from "@/components/modals/AuthModal";

type SignupRole = "user" | "signal_provider" | "broker" | "betting_site";

const joinCards: { role: SignupRole; title: string; desc: string; icon: typeof User }[] = [
  { role: "user", title: "Join as Trader", desc: "Review brokers, share experience.", icon: User },
  { role: "signal_provider", title: "Join as Signal Provider", desc: "List your channel, reach traders.", icon: Radio },
  { role: "broker", title: "List Your Brokerage", desc: "Claim or list your firm.", icon: Building2 },
  { role: "betting_site", title: "List Your Sportsbook", desc: "List your betting site.", icon: Trophy },
];

const defaultPerks = [
  { icon: "Shield", text: "Verified badge on your profile" },
  { icon: "MessageSquare", text: "Reply to user reviews publicly" },
  { icon: "Award", text: "Featured placement in search" },
  { icon: "BarChart3", text: "Promotion & analytics dashboard" },
];

const iconMap: Record<string, any> = { Shield, MessageSquare, Award, BarChart3 };

const defaultTiers = [
  {
    name: "Featured + Verified",
    features: ["Everything in Verified", "Featured in search results", "Homepage placement", "Dedicated account manager"],
    cta: "Contact Us →",
    style: "highlight",
    note: "Best for high-volume brokers",
    link: "/advertise",
  },
  {
    name: "Verified Partner",
    features: ["Verified badge", "Reply to reviews", "Priority support", "Enhanced profile"],
    cta: "Contact Us →",
    style: "secondary",
    note: "Most popular choice",
    link: "/advertise",
  },
  {
    name: "Basic Listing",
    features: ["Company profile", "User reviews", "Basic analytics"],
    cta: "Get Listed →",
    style: "ghost",
    note: "",
    link: "/broker-claim",
  },
];

const BrokerJoinSection = () => {
  const cms = useSiteSettings<Record<string, any>>("broker_join_section", {});
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<SignupRole | undefined>(undefined);

  const openJoin = (role: SignupRole) => {
    setAuthRole(role);
    setAuthOpen(true);
  };

  const title = cms.title || "Be part of the network —";
  const accentText = cms.accent_text || "Built on Trust.";
  const description = cms.description || "Join 900+ brokers on the fastest-growing global trading review platform. Build trust with verified reviews and transparent ratings.";
  const benefits = (cms.benefits?.length ? cms.benefits : defaultPerks.map(p => p.text)) as string[];
  const ctaText = cms.cta_text || "Promote Your Broker →";
  const ctaLink = cms.cta_link || "/advertise";
  const subtitle = cms.subtitle || "Traders, signal providers, brokers, and sportsbooks — find your place on the fastest-growing global trading platform.";
  const claimText = cms.claim_text || "Already listed? Claim your profile →";
  const claimLink = cms.claim_link || "/brokers";
  const footerNote = cms.footer_note || "All listings are reviewed before going live. We do not list brokers with active unresolved scam reports.";

  const tiers = (Array.isArray(cms.tiers) && cms.tiers.length > 0 ? cms.tiers : defaultTiers) as typeof defaultTiers;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// JOIN NAFT</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          {title} <span className="text-accent">{accentText}</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-10 max-w-2xl">{subtitle}</p>

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
              <a href={ctaLink} className="inline-flex items-center px-6 py-3 text-sm font-display font-bold bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity">
                {ctaText}
              </a>
              <div>
                <a href={claimLink} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                  {claimText}
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tiers.map((tier: any, idx: number) => {
              const features: string[] = Array.isArray(tier.features) ? tier.features : (typeof tier.features === "string" ? tier.features.split("\n").filter(Boolean) : []);
              const style = tier.style || "ghost";
              return (
                <div key={tier.name || idx} className={`glass-card rounded-xl p-5 flex flex-col ${style === "highlight" ? "border-accent/30 ring-1 ring-accent/20" : style === "secondary" ? "border-primary/20 ring-1 ring-primary/10" : ""}`}>
                  <div className="text-xs font-mono text-muted-foreground mb-4">{tier.name}</div>
                  <ul className="space-y-2 mt-4 mb-6 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.link || "/advertise"} className={`block w-full py-2.5 text-xs font-semibold rounded-lg transition-all text-center ${
                    style === "highlight" ? "bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg shadow-accent/20" : "border border-border text-foreground hover:border-primary/40"
                  }`}>{tier.cta}</Link>
                  {tier.note && <p className="text-[10px] text-muted-foreground mt-2 text-center">{tier.note}</p>}
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-6">{footerNote}</p>

        {/* Role-based Join CTAs */}
        <div className="mt-12 pt-10 border-t border-border">
          <div className="mb-6">
            <span className="section-tag">// JOIN THE NETWORK</span>
            <h3 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mt-2">
              Pick your role. <span className="text-primary">Get started in 60 seconds.</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {joinCards.map(({ role, title: jt, desc, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => openJoin(role)}
                className="glass-card rounded-xl p-5 text-left transition-all hover:border-primary/40 hover:-translate-y-0.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-display font-bold text-base text-foreground mb-1">{jt}</div>
                <p className="text-xs text-muted-foreground mb-3">{desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Join <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab="signup"
        defaultRole={authRole}
      />
    </section>
  );
};

export default BrokerJoinSection;
