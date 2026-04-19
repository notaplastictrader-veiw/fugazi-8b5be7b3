import { useState } from "react";
import { Check, Zap } from "lucide-react";
import PremiumApplicationModal from "@/components/modals/PremiumApplicationModal";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SponsoredBy from "@/components/sponsored/SponsoredBy";

const SignalChannel = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const cms = useSiteSettings<Record<string, any>>("signal_channel", {});

  const title = cms.title || "Gold & Forex Signals You Can Actually";
  const accentText = cms.accent_text || "Trust.";
  const description = cms.description || "We don't talk about signals. We post them. Entry. Stop. Target. Done. No charity. No hand-holding. No fake screenshots of wins. We publish our track record publicly — every trade, every loss, every win. If you can't handle a loss, this channel isn't for you. If you're built different — you already know what to do.";
  const featuresList = (cms.features_list as string[]) || [
    "Around 78% win rate — tracked and published publicly every month",
    "Full transparency — losses posted same as wins",
    "No credit card needed for free tier",
    "Multiple payment options available. DM us for details.",
  ];

  const free = cms.free_tier || {};
  const freeBadge = free.badge || "FREE TIER";
  const freeTitle = free.title || "Basic Signal Access";
  const freeDescription = free.description || "Daily market updates and a few signals per week. No strings attached.";
  const freeFeatures = (free.features as string[]) || ["Market updates daily", "2–3 signals per week", "Gold & EURUSD only"];
  const freePrice = free.price || "Free — forever";
  const freeCta = free.cta || cms.cta_primary || "Join Free Telegram →";
  const freeCtaUrl = free.cta_url || "https://t.me/notaplastictrader";
  const freeFooter = free.footer_note || "No credit card. No BS. Just signals.";

  const premium = cms.premium_tier || {};
  const premiumBadge = premium.badge || "PREMIUM";
  const premiumLabel = premium.label || "PREMIUM TIER";
  const premiumTitle = premium.title || "Full Signal Suite";
  const premiumWinRate = premium.win_rate || "~78%";
  const premiumWinRateLabel = premium.win_rate_label || "win rate · tracked publicly every month";
  const premiumDescription = premium.description || "Full access. Gold, FX majors, exact entry, SL and TP. Strategy breakdown every trade.";
  const premiumFeatures = (premium.features as string[]) || ["10–15 signals/week", "Gold · FX · Crypto · Indices", "Exact entry SL TP", "Strategy breakdown per trade", "VIP Telegram access"];
  const premiumTagline = premium.tagline || "Premium Access — Serious Traders Only";
  const premiumCta = premium.cta || cms.cta_secondary || "Apply for Access →";

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <span className="section-tag">// OUR SIGNAL CHANNEL</span>
          <SponsoredBy placement="signal-channel-sponsor" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-3">
          {title} <span className="text-primary">{accentText}</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
          <div>
            <p className="text-[15px] text-muted-foreground leading-[1.8] mb-6">
              {description}
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {featuresList.map((item, i) => (
                <li key={i}>→ {item}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest">{freeBadge}</div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">{freeTitle}</h3>
              <p className="text-sm text-muted-foreground mb-5">{freeDescription}</p>
              <ul className="space-y-2.5 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="text-lg font-display font-extrabold text-foreground mb-3">{freePrice}</div>
              <a href={freeCtaUrl} target="_blank" rel="noopener noreferrer"
                className="block w-full py-2.5 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-center">
                {freeCta}
              </a>
              <p className="text-[11px] text-muted-foreground mt-2">{freeFooter}</p>
            </div>

            {/* Premium */}
            <div className="glass-card rounded-xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(210 40% 10%), hsl(215 45% 15%))" }}>
              <span className="absolute top-3 right-3 text-[9px] font-mono text-accent border border-accent/30 px-2 py-0.5 rounded-full tracking-widest">{premiumBadge}</span>
              <div className="text-[10px] font-mono text-accent mb-2 tracking-widest">{premiumLabel}</div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">{premiumTitle}</h3>
              <div className="text-5xl font-display font-black text-accent my-4">{premiumWinRate}</div>
              <p className="text-xs font-mono text-accent/70 mb-4">{premiumWinRateLabel}</p>
              <p className="text-sm text-muted-foreground mb-5">{premiumDescription}</p>
              <ul className="space-y-2.5 mb-6">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-accent flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="text-sm font-display font-semibold text-foreground mb-3">{premiumTagline}</div>
              <button onClick={() => setModalOpen(true)}
                className="w-full py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                {premiumCta}
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
