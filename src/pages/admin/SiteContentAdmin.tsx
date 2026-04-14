import { Link } from "react-router-dom";
import {
  Megaphone, Navigation, Sparkles, Building2, ShieldAlert, Radio,
  Signal, TrendingUp, HelpCircle, MessageSquare, Handshake, Layout,
  ChevronRight, Pencil
} from "lucide-react";

const sections = [
  {
    key: "promo-ticker",
    title: "Promo Ticker",
    description: "Scrolling promotional messages at the top of the page",
    icon: Megaphone,
    fields: ["Ticker messages (add/remove/reorder)"],
    settingsKey: "promo_ticker",
  },
  {
    key: "hero",
    title: "Hero Section",
    description: "Main headline, eyebrow texts, search bar placeholders, chip groups, stats",
    icon: Sparkles,
    fields: ["Headline", "Eyebrow items", "Chip groups", "Stats counters"],
    settingsKey: "hero_section",
  },
  {
    key: "broker-trust-hub",
    title: "Broker Trust Hub",
    description: "Top rated brokers grid and prop firms showcase",
    icon: Building2,
    fields: ["Section title", "Broker highlight count", "Prop firm categories"],
    settingsKey: "broker_trust_hub",
  },
  {
    key: "scam-alerts",
    title: "Scam Watch",
    description: "Latest scam alerts and warnings section",
    icon: ShieldAlert,
    fields: ["Section title", "Display count", "CTA text"],
    settingsKey: "scam_alert_section",
  },
  {
    key: "signal-channel",
    title: "Signal Channel",
    description: "NAFT broadcast signal channel promotion",
    icon: Signal,
    fields: ["Title", "Description", "CTA buttons", "Stats"],
    settingsKey: "signal_channel",
  },
  {
    key: "signal-hub",
    title: "Signal Hub",
    description: "Signal groups listing section",
    icon: Radio,
    fields: ["Section title", "Display count", "CTA text"],
    settingsKey: "signal_hub",
  },
  {
    key: "forecasts",
    title: "Forecast Section",
    description: "Market forecasts for Forex, Crypto, and Commodities",
    icon: TrendingUp,
    fields: ["Section title", "Categories", "Assets per category"],
    settingsKey: "forecast_section",
  },
  {
    key: "how-it-works",
    title: "How It Works",
    description: "Step-by-step guide for new users",
    icon: HelpCircle,
    fields: ["Steps (title, description, icon)", "CTA button"],
    settingsKey: "how_it_works",
  },
  {
    key: "community-reviews",
    title: "Community Reviews",
    description: "Scrolling community review testimonials",
    icon: MessageSquare,
    fields: ["Section title", "Display count", "Auto-scroll speed"],
    settingsKey: "community_reviews",
  },
  {
    key: "broker-join",
    title: "For Brokers (CTA)",
    description: "Broker partnership call-to-action section",
    icon: Handshake,
    fields: ["Title", "Description", "Benefits list", "CTA button"],
    settingsKey: "broker_join_section",
  },
  {
    key: "navbar",
    title: "Navigation Bar",
    description: "Main navigation menu items and ordering",
    icon: Navigation,
    fields: ["Menu items", "CTA button text", "Logo"],
    settingsKey: "navbar",
  },
  {
    key: "footer",
    title: "Footer",
    description: "Footer links, social media, disclaimer text",
    icon: Layout,
    fields: ["Link columns", "Social links", "Disclaimer text"],
    settingsKey: "footer",
  },
];

const SiteContentAdmin = () => {
  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">CMS</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          Site Content Editor
        </h2>
      </div>
      <p className="text-sm text-muted-foreground font-mono mb-8">
        MANAGE ALL HOMEPAGE SECTIONS — EDIT TEXT, IMAGES, AND CONTENT FOR EACH SECTION
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.key}
            to={`/admin/site-content/${section.key}`}
            className="hud-card p-1 group hover:scale-[1.02] transition-all duration-200"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1 font-['Barlow_Condensed'] uppercase tracking-wide">
                {section.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{section.description}</p>
              <div className="flex flex-wrap gap-1">
                {section.fields.map((field) => (
                  <span key={field} className="text-[9px] px-2 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono border border-border/50">
                    {field}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1 text-primary text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="w-3 h-3" /> EDIT SECTION
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SiteContentAdmin;
