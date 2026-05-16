import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Linkedin, Youtube, Send, Facebook, Instagram } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/hooks/useTheme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import NewsletterSignup from "@/components/NewsletterSignup";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" />
  </svg>
);

const socialIconMap: Record<string, { Icon: any; color: string }> = {
  X: { Icon: XIcon, color: "hover:text-foreground" },
  Twitter: { Icon: XIcon, color: "hover:text-foreground" },
  LinkedIn: { Icon: Linkedin, color: "hover:text-[#0A66C2]" },
  YouTube: { Icon: Youtube, color: "hover:text-[#FF0000]" },
  Telegram: { Icon: Send, color: "hover:text-[#26A5E4]" },
  Facebook: { Icon: Facebook, color: "hover:text-[#1877F2]" },
  Instagram: { Icon: Instagram, color: "hover:text-[#E4405F]" },
  TikTok: { Icon: TikTokIcon, color: "hover:text-foreground" },
};

const defaultColumns = [
  {
    title: "Brokers",
    links: [
      { label: "Forex Brokers", href: "/brokers" },
      { label: "Crypto Exchanges", href: "/brokers?type=crypto" },
      { label: "Binary Options", href: "/brokers?type=binary" },
      { label: "Broker Comparison", href: "/compare" },
      { label: "Claim Your Profile", href: "/brokers" },
      { label: "Scam Alerts", href: "/scam-alerts" },
    ],
  },
  {
    title: "Prop Firms",
    links: [
      { label: "Best Prop Firms", href: "/prop-firms" },
      // Top 3 are injected dynamically from DB at runtime (see useEffect below)
    ],
  },
  {
    title: "Signals & More",
    links: [
      { label: "Signal Groups", href: "/signals" },
      { label: "Our Signal Channel", href: "/signals" },
      { label: "Forex Forecasts", href: "/forecasts?tab=forex" },
      { label: "Crypto Forecasts", href: "/forecasts?tab=crypto" },
      { label: "Affiliate Program", href: "/partnership?tab=affiliate" },
      { label: "Become an IB", href: "/partnership?tab=ib" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Trading Calculators", href: "/calculators" },
      { label: "Trading Glossary", href: "/glossary" },
      { label: "Regulators Explained", href: "/regulators" },
      { label: "Brokers in Bangladesh", href: "/brokers/country/bangladesh" },
      { label: "Brokers in India", href: "/brokers/country/india" },
      { label: "Brokers in Pakistan", href: "/brokers/country/pakistan" },
      { label: "Brokers in UAE", href: "/brokers/country/uae" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Partnership", href: "/partnership" },
      { label: "How We Review", href: "/how-we-review" },
      { label: "Advertise", href: "/advertise" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

const defaultSocial = [
  { platform: "X", url: "" },
  { platform: "LinkedIn", url: "" },
  { platform: "YouTube", url: "" },
  { platform: "Telegram", url: "" },
  { platform: "Facebook", url: "" },
  { platform: "Instagram", url: "" },
  { platform: "TikTok", url: "" },
];

const Footer = () => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const cms = useSiteSettings<Record<string, any>>("footer", {});
  const [topProps, setTopProps] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("brokers")
        .select("name, slug")
        .eq("status", "published")
        .eq("type", "prop-firm")
        .order("score", { ascending: false })
        .limit(3);
      if (!cancelled && data) setTopProps(data as { name: string; slug: string }[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const logoSrc = theme === "light" ? "/images/naft-candlestick-light-green.svg" : theme === "sentinel" ? "/images/naft-candlestick-dark-red.svg" : "/images/naft-candlestick-dark-lime.svg";

  const brandName = cms.brand_name || "Not A Fugazi";
  const brandAccent = cms.brand_accent || "Trader";
  const brandDescription = cms.brand_description || "The world's most transparent broker review platform. Real reviews, real complaints, verified withdrawal proof.";
  const baseColumns = (Array.isArray(cms.columns) && cms.columns.length > 0 ? cms.columns : defaultColumns) as typeof defaultColumns;

  // Inject top-3 prop firms dynamically into the "Prop Firms" column
  const columns = useMemo(() => baseColumns.map((col: any) => {
    if (col.title !== "Prop Firms") return col;
    const dynamicLinks = topProps.map(p => ({ label: `${p.name} Review`, href: `/brokers/${p.slug}` }));
    const baseLinks = (col.links || []).filter((l: any) => l?.href === "/prop-firms");
    return { ...col, links: [...baseLinks, ...dynamicLinks] };
  }), [baseColumns, topProps]);

  const socialLinks = (Array.isArray(cms.social_links) && cms.social_links.length > 0 ? cms.social_links : defaultSocial) as typeof defaultSocial;
  const aboutLabel = cms.about_label || "About Us";
  const contactLabel = cms.contact_label || "Contact Us";
  const riskWarningLabel = cms.risk_warning_label || "⚠ Risk & Liability Disclaimer:";
  const riskWarning = cms.risk_warning || "Not A Fugazi Trader (NAFT) is an independent information and review platform — not a broker, advisor, signal provider, or bookmaker. All content (broker listings, signals, forecasts, sports predictions, news) is for informational and educational purposes only and is not financial, legal, or betting advice. Trading and gambling carry substantial risk of loss; you are solely responsible for verifying that any third-party service is lawful and regulated in your jurisdiction. NAFT accepts no liability for any losses arising from use of this site or third-party services.";
  const copyrightSuffix = cms.copyright_suffix || t("footer.rights", "All rights reserved.");

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <img loading="lazy" decoding="async" src={logoSrc} alt="NAFT Logo" className="w-9 h-9" />
              <span className="text-xl font-bold text-foreground">
                {brandName} <span className="text-primary">{brandAccent}</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {brandDescription}
            </p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {socialLinks.map((s: any) => {
                const meta = socialIconMap[s.platform];
                if (!meta) return null;
                const Icon = meta.Icon;
                const url = s.url || "#";
                return (
                  <a
                    key={s.platform}
                    href={url}
                    target={url !== "#" ? "_blank" : undefined}
                    rel={url !== "#" ? "noopener noreferrer" : undefined}
                    title={s.platform}
                    className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground ${meta.color} transition-colors`}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">{aboutLabel}</Link>
              <span className="text-border">|</span>
              <Link to="/contact" className="text-primary font-semibold hover:text-primary/80 transition-colors">{contactLabel}</Link>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col: any) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {(col.links || []).map((link: any) => (
                  <li key={link.label}>
                    <Link
                      to={link.href || "#"}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="mt-12 pt-8 border-t border-border grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h4 className="text-base font-display font-extrabold text-foreground mb-1">
              Get the weekly NAFT brief
            </h4>
            <p className="text-xs text-muted-foreground">
              New scam alerts, broker score changes, and signal recaps — every Friday. No spam, unsubscribe anytime.
            </p>
          </div>
          <NewsletterSignup source="footer" />
        </div>

        {/* Risk Warning */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
            <span className="text-destructive font-semibold">{riskWarningLabel}</span>{" "}
            {riskWarning}{" "}
            <Link to="/disclaimer" className="text-primary font-semibold hover:underline underline-offset-4">
              Read full disclaimer →
            </Link>
          </p>
          <p className="text-xs text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} Not A Fugazi Trader. {copyrightSuffix}</span>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
              className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Cookie Settings
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
