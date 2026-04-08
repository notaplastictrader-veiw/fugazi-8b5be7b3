import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Setting {
  id: string;
  key: string;
  value: any;
}

const defaultSettings: Record<string, any> = {
  promo_ticker: ["🔥 Exness 100% Deposit Bonus", "🚀 FTMO 20% Off Challenge", "💰 Bullwaves — Start with $10"],
  ticker_pairs: [
    { pair: "XAU/USD", price: "2,341.50", change: "+0.82%", up: true },
    { pair: "EUR/USD", price: "1.0847", change: "-0.12%", up: false },
  ],
  hero_stats: { brokers_reviewed: "200+", complaints_resolved: "15K+", active_traders: "50K+", countries: "180+" },
  scam_alert_banner: "⚠️ Warning: TradeWave Markets — Withdrawal issues reported",
};

const SiteSettingsAdmin = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      if (data) {
        data.forEach((s: Setting) => {
          map[s.key] = JSON.stringify(s.value, null, 2);
        });
      }
      // Fill defaults for missing keys
      Object.keys(defaultSettings).forEach(key => {
        if (!map[key]) map[key] = JSON.stringify(defaultSettings[key], null, 2);
      });
      setSettings(map);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    try {
      const value = JSON.parse(settings[key]);
      const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
      if (existing) {
        await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
      } else {
        await supabase.from("site_settings").insert({ key, value });
      }
      toast.success(`${key} saved`);
    } catch {
      toast.error("Invalid JSON");
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Site Settings</h2>
      <div className="space-y-4">
        {Object.keys(settings).map(key => (
          <Card key={key} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-primary">{key}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                className="font-mono text-xs min-h-[120px]"
                value={settings[key]}
                onChange={e => setSettings({ ...settings, [key]: e.target.value })}
              />
              <Button size="sm" onClick={() => handleSave(key)}>Save</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SiteSettingsAdmin;
