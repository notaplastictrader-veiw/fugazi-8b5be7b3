import { Link } from "react-router-dom";
import { Twitter, Linkedin, Youtube, Send, Facebook, Instagram, Music } from "lucide-react";

const footerLinks = {
  Brokers: [
    { label: "Forex Brokers", href: "/brokers" },
    { label: "Crypto Exchanges", href: "/brokers?type=crypto" },
    { label: "Binary Options", href: "/brokers?type=binary" },
    { label: "Broker Comparison", href: "/compare" },
    { label: "Scam Alerts", href: "/scam-alerts" },
  ],
  "Prop Firms": [
    { label: "Best Prop Firms", href: "/prop-firms" },
    { label: "FTMO Review", href: "/brokers/ftmo" },
    { label: "Maven Trading", href: "/brokers/maven" },
    { label: "The5%ers", href: "/brokers/the5ers" },
  ],
  "Signals & More": [
    { label: "Signal Groups", href: "/signals" },
    { label: "Our Signal Channel", href: "/signals/ours" },
    { label: "Forex Forecasts", href: "/forecasts?tab=forex" },
    { label: "Crypto Forecasts", href: "/forecasts?tab=crypto" },
    { label: "Sports Forecasts", href: "/forecasts?tab=sports" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact", highlight: true },
    { label: "Partnership", href: "/partnership" },
    { label: "Advertise", href: "/advertise" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", title: "Twitter/X", color: "hover:text-foreground" },
  { icon: Linkedin, href: "#", title: "LinkedIn", color: "hover:text-[#0A66C2]" },
  { icon: Youtube, href: "#", title: "YouTube", color: "hover:text-[#FF0000]" },
  { icon: Send, href: "#", title: "Telegram", color: "hover:text-[#26A5E4]" },
  { icon: Facebook, href: "#", title: "Facebook", color: "hover:text-[#1877F2]" },
  { icon: Instagram, href: "#", title: "Instagram", color: "hover:text-[#E4405F]" },
  { icon: Music, href: "#", title: "TikTok", color: "hover:text-foreground" },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-foreground">
                Not A Plastic <span className="text-primary">Trader</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              The world's most transparent broker review platform. Real reviews, real complaints,
              verified withdrawal proof.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.title}
                    href={s.href}
                    title={s.title}
                    className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground ${s.color} transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`text-sm transition-colors ${
                        "highlight" in link && link.highlight
                          ? "text-primary font-semibold hover:text-primary/80"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Risk Warning */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
            <span className="text-destructive font-semibold">⚠ Risk Warning:</span>{" "}
            Trading foreign exchange, CFDs, and cryptocurrencies carries a high level of risk and may not be suitable
            for all investors. The high degree of leverage can work against you as well as for you. Before deciding to
            trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
            The possibility exists that you could sustain a loss of some or all of your initial investment.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Not A Plastic Trader. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
