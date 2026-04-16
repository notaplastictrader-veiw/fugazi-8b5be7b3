import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface SettingDef {
  key: string;
  label: string;
  description: string;
  group: string;
  default: any;
}

const settingsDefs: SettingDef[] = [
  // 📊 Tickers
  {
    key: "promo_ticker",
    label: "Promo Ticker",
    description: "Top scrolling promo bar on homepage. Array of text strings — each string is one promo message.",
    group: "📊 Tickers",
    default: [
      "🔥 Exness 100% Deposit Bonus",
      "🚀 FTMO 20% Off Challenge",
      "💰 Bullwaves — Start with $10",
      "⚡ IC Markets Raw Spread 0.0",
      "🏆 Maven Trading 90% Profit Split",
      "🎁 XM $30 No-Deposit Bonus",
    ],
  },
  {
    key: "ticker_pairs",
    label: "Ticker Pairs (Price Bar)",
    description: "Top & bottom ticker bars showing currency pair prices. Each item needs: pair, price, change, up (true/false).",
    group: "📊 Tickers",
    default: [
      { pair: "XAU/USD", price: "2,341.50", change: "+0.82%", up: true },
      { pair: "EUR/USD", price: "1.0847", change: "-0.12%", up: false },
      { pair: "GBP/USD", price: "1.2634", change: "+0.25%", up: true },
      { pair: "USD/JPY", price: "157.42", change: "+0.45%", up: true },
      { pair: "BTC/USD", price: "67,842", change: "+2.14%", up: true },
      { pair: "NASDAQ", price: "18,524", change: "-0.33%", up: false },
      { pair: "OIL", price: "78.32", change: "+0.67%", up: true },
      { pair: "ETH/USD", price: "3,521", change: "+1.82%", up: true },
    ],
  },
  // 🏠 Homepage Sections
  {
    key: "hero_section",
    label: "Hero Section",
    description: "Main hero banner — headline, subheadline, search placeholders, rotating eyebrow messages with colors, and bottom stats.",
    group: "🏠 Homepage Sections",
    default: {
      headline: "Broker Reviews",
      subheadline: "That Actually Matter.",
      search_placeholders: [
        "Search Brokers, Signals, News...",
        "Search Prop Firms, Sports, Alerts...",
        "Search Crypto, Forecasts, Reviews...",
      ],
      eyebrow_items: [
        { text: "Built for real traders, not ", highlight: "Fugazi Ones", suffix: "", color: "hsl(var(--primary))" },
        { text: "The world's ", highlight: "Most Transparent", suffix: " broker platform", color: "hsl(var(--accent))" },
        { text: "Where ", highlight: "Scams Get Exposed", suffix: " every single day", color: "hsl(var(--destructive))" },
        { text: "", highlight: "Real Proof", suffix: ". Real complaints. Real data.", color: "hsl(var(--teal))" },
        { text: "The platform ", highlight: "Brokers Fear", suffix: " and traders love", color: "hsl(var(--purple))" },
      ],
      stats: [
        { value: "4.8K+", label: "Verified reviews" },
        { value: "280+", label: "Brokers listed" },
        { value: "61+", label: "Scam alerts issued" },
        { value: "120K+", label: "Active traders" },
      ],
    },
  },
  {
    key: "broker_trust_hub",
    label: "Broker Trust Hub",
    description: "Broker listing section — section title, how many brokers to display, and prop firm category list.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Top Verified",
      broker_subtitle: "Every broker scored by real user data — complaints, withdrawal speed, regulation strength.",
      broker_count: 50,
      broker_filters: ["All", "Forex", "Crypto", "Binary", "ECN", "Prop Firms", "Scam Watch"],
      prop_section_title: "Top Verified",
      prop_subtitle: "Funded trading accounts reviewed by real traders. Challenge fees, payouts, and rules — all verified.",
      prop_firm_count: 6,
      prop_firm_categories: ["All Prop Firms", "Instant Funding", "1-Step Clg", "2-Step Clg", "Dis% Offers", "No Time Limit"],
    },
  },
  {
    key: "scam_alert_section",
    label: "Scam Watch Section",
    description: "Scam alerts section — title, how many alerts to show, and CTA button text.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Active Scam",
      display_count: 10,
      cta_text: "View All Scam Alerts →",
    },
  },
  {
    key: "signal_channel",
    label: "Signal Channel CTA",
    description: "Signal channel promotion section — title, description, primary & secondary CTA text.",
    group: "🏠 Homepage Sections",
    default: {
      title: "Gold & Forex Signals You Can Actually",
      description: "We don't talk about signals. We post them. Entry. Stop. Target. Done. No charity. No hand-holding. No fake screenshots of wins. We publish our track record publicly — every trade, every loss, every win. If you can't handle a loss, this channel isn't for you. If you're built different — you already know what to do.",
      cta_primary: "Join Free Telegram →",
      cta_secondary: "Apply for Access →",
    },
  },
  {
    key: "signal_hub",
    label: "Signal Hub",
    description: "Signal groups listing section — title, how many groups to show, and 'View All' button text.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Verified Signal",
      display_count: 50,
      cta_text: "View All Groups →",
    },
  },
  {
    key: "forecast_section",
    label: "Forecast Section",
    description: "Market forecast section — title. Tabs are hardcoded (Forex, Metal, Crypto).",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Market",
    },
  },
  {
    key: "how_it_works",
    label: "How It Works",
    description: "Step-by-step guide section — title, CTA button text, and steps array (each with icon, number, title & description). Icons: Search, BookOpen, MessageSquare, Award.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Built Different. Built For",
      cta_text: "",
      steps: [
        { icon: "Search", number: "01", title: "Search any broker", description: "Find any broker, prop firm, or signal provider in our database." },
        { icon: "BookOpen", number: "02", title: "Read verified reviews", description: "Real reviews from real traders. No paid or fake testimonials." },
        { icon: "MessageSquare", number: "03", title: "File a complaint", description: "Had a bad experience? File a complaint with evidence." },
        { icon: "Award", number: "04", title: "Join & earn trust", description: "Become part of the community. Your voice helps others trade safely." },
      ],
    },
  },
  {
    key: "community_reviews",
    label: "Community Reviews",
    description: "Reviews carousel section — title and how many reviews to display.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "What Traders",
      display_count: 50,
    },
  },
  {
    key: "broker_join_section",
    label: "For Brokers (CTA)",
    description: "Broker sign-up CTA section — title, description, benefits list, and CTA button text.",
    group: "🏠 Homepage Sections",
    default: {
      title: "For Brokers & Signal Providers —",
      description: "Join 280+ brokers on the fastest-growing global trading review platform. Build trust with verified reviews and transparent ratings.",
      benefits: [
        "Verified badge on your profile",
        "Reply to user reviews publicly",
        "Featured placement in search",
        "Promotion & analytics dashboard",
      ],
      cta_text: "Promote Your Broker →",
    },
  },
  // ⚙️ Legacy
  {
    key: "hero_stats",
    label: "Hero Stats (Legacy)",
    description: "Old hero stats key — now hero_section.stats is used instead. Kept for backward compatibility.",
    group: "⚙️ Legacy",
    default: { brokers_reviewed: "200+", complaints_resolved: "15K+", active_traders: "50K+", countries: "180+" },
  },
  {
    key: "scam_alert_banner",
    label: "Scam Alert Banner (Legacy)",
    description: "Old single-line scam banner text. Now scam_alert_section is used instead.",
    group: "⚙️ Legacy",
    default: "⚠️ Warning: TradeWave Markets — Withdrawal issues reported",
  },
];

const SiteSettingsAdmin = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      if (data) {
        data.forEach((s: { key: string; value: any }) => {
          map[s.key] = JSON.stringify(s.value, null, 2);
        });
      }
      settingsDefs.forEach(def => {
        if (!map[def.key]) map[def.key] = JSON.stringify(def.default, null, 2);
      });
      setSettings(map);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    try {
      const value = JSON.parse(settings[key]);
      setSavingKey(key);
      const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
      if (existing) {
        await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
      } else {
        await supabase.from("site_settings").insert({ key, value });
      }
      toast.success(`${key} saved`);
    } catch {
      toast.error("Invalid JSON — please enter valid JSON format");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const groups = [...new Set(settingsDefs.map(d => d.group))];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2 font-['Barlow_Condensed'] uppercase tracking-wide">Site Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">Control every homepage section's content from here. Edit the JSON data and hit Save.</p>

      {groups.map(group => (
        <div key={group} className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 font-['Barlow_Condensed'] uppercase tracking-wide border-b border-border pb-2">
            {group}
          </h3>
          <div className="space-y-4">
            {settingsDefs.filter(d => d.group === group).map(def => (
              <Card key={def.key} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-primary">{def.key}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">{def.label}</span> — {def.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Textarea
                    className="font-mono text-xs min-h-[120px]"
                    value={settings[def.key] || ""}
                    onChange={e => setSettings({ ...settings, [def.key]: e.target.value })}
                  />
                  <Button size="sm" onClick={() => handleSave(def.key)} disabled={savingKey === def.key}>
                    {savingKey === def.key ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                    Save
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SiteSettingsAdmin;
