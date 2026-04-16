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
    default: ["🔥 Exness 100% Deposit Bonus", "🚀 FTMO 20% Off Challenge", "💰 Bullwaves — Start with $10"],
  },
  {
    key: "ticker_pairs",
    label: "Ticker Pairs (Price Bar)",
    description: "Top & bottom ticker bars showing currency pair prices. Each item needs: pair, price, change, up (true/false).",
    group: "📊 Tickers",
    default: [
      { pair: "XAU/USD", price: "2,341.50", change: "+0.82%", up: true },
      { pair: "EUR/USD", price: "1.0847", change: "-0.12%", up: false },
      { pair: "BTC/USD", price: "67,450", change: "+2.15%", up: true },
      { pair: "GBP/USD", price: "1.2715", change: "+0.05%", up: true },
    ],
  },
  // 🏠 Homepage Sections
  {
    key: "hero_section",
    label: "Hero Section",
    description: "Main hero banner — headline, subheadline, search placeholders, rotating eyebrow messages, and bottom stats. eyebrow_items use text/highlight/suffix for animated text.",
    group: "🏠 Homepage Sections",
    default: {
      headline: "Not A Fugazi Trader",
      subheadline: "Most trusted broker review platform. Real reviews, real complaints, real withdrawal proof.",
      search_placeholders: ["Search brokers...", "Find signals...", "Compare prop firms..."],
      eyebrow_items: [
        { text: "Trusted by", highlight: "50,000+", suffix: "traders worldwide" },
        { text: "Over", highlight: "200+", suffix: "brokers reviewed" },
      ],
      stats: [
        { value: "200+", label: "Brokers Reviewed" },
        { value: "15K+", label: "Complaints Resolved" },
        { value: "50K+", label: "Active Traders" },
        { value: "180+", label: "Countries" },
      ],
    },
  },
  {
    key: "broker_trust_hub",
    label: "Broker Trust Hub",
    description: "Broker listing section — section title, how many brokers to display, and prop firm category list.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Broker Trust Hub",
      broker_count: 6,
      prop_firm_categories: ["Funded Accounts", "Challenge-Based", "Instant Funding"],
    },
  },
  {
    key: "scam_alert_section",
    label: "Scam Watch Section",
    description: "Scam alerts section — title, how many alerts to show, and CTA button text.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Scam Watch",
      display_count: 4,
      cta_text: "View All Scam Alerts",
    },
  },
  {
    key: "signal_channel",
    label: "Signal Channel CTA",
    description: "Signal channel promotion section — title, description, primary & secondary CTA text, and stats.",
    group: "🏠 Homepage Sections",
    default: {
      title: "Join Our Signal Channel",
      description: "Get real-time trading signals with verified track records.",
      cta_primary: "Join Free Channel",
      cta_secondary: "Apply for Premium",
      stats: [
        { value: "~78%", label: "Win Rate" },
        { value: "1:3", label: "Avg R:R" },
        { value: "50+", label: "Monthly Signals" },
      ],
    },
  },
  {
    key: "signal_hub",
    label: "Signal Hub",
    description: "Signal groups listing section — title, how many groups to show, and 'View All' button text.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Signal Hub",
      display_count: 6,
      cta_text: "View All Signal Groups",
    },
  },
  {
    key: "forecast_section",
    label: "Forecast Section",
    description: "Market forecast section — title and category tab list.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Market Forecasts",
      categories: ["Forex", "Crypto", "Commodities"],
    },
  },
  {
    key: "how_it_works",
    label: "How It Works",
    description: "Step-by-step guide section — title, CTA button text, and steps array (each with title & description).",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "How It Works",
      cta_text: "Get Started",
      steps: [
        { title: "Search & Compare", description: "Browse 200+ broker reviews with real user ratings" },
        { title: "Read Real Reviews", description: "Check verified complaints and withdrawal proofs" },
        { title: "Trade with Confidence", description: "Choose a trusted broker and start trading" },
      ],
    },
  },
  {
    key: "community_reviews",
    label: "Community Reviews",
    description: "Reviews carousel section — title and how many reviews to display.",
    group: "🏠 Homepage Sections",
    default: {
      section_title: "Community Reviews",
      display_count: 6,
    },
  },
  {
    key: "broker_join_section",
    label: "For Brokers (CTA)",
    description: "Broker sign-up CTA section — title, description, benefits list, and CTA button text.",
    group: "🏠 Homepage Sections",
    default: {
      title: "Are You a Broker?",
      description: "Claim your profile, respond to reviews, and reach 50K+ traders.",
      benefits: ["Claim & verify your profile", "Respond to user complaints", "Get featured placement", "Access analytics dashboard"],
      cta_text: "Claim Your Profile",
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
      toast.error("Invalid JSON — সঠিক JSON format দিন");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const groups = [...new Set(settingsDefs.map(d => d.group))];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2 font-['Barlow_Condensed'] uppercase tracking-wide">Site Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">Homepage এর প্রতিটা section এর content এখান থেকে control করুন। JSON format এ data edit করে Save করুন।</p>

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
