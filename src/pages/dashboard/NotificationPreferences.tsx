import { useEffect, useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PREFS = [
  { key: "weekly_digest", label: "Weekly digest", desc: "Summary of top brokers, scam alerts and forecasts every Monday." },
  { key: "new_match_alerts", label: "New match alerts", desc: "Notify me when a new broker matches a saved match." },
  { key: "scam_alerts", label: "Scam alerts", desc: "Real-time alerts when a broker you watch gets flagged." },
  { key: "forum_replies", label: "Forum replies", desc: "Notify when someone replies to your thread." },
];

const CHANNELS = [
  { key: "inapp_enabled", label: "In-app", desc: "Receive notifications inside NAFT." },
  { key: "email_enabled", label: "Email", desc: "Send a copy to your registered email (rolling out)." },
];

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    setPrefs(data || {
      user_id: user!.id,
      weekly_digest: true, new_match_alerts: true,
      scam_alerts: true, forum_replies: true,
      email_enabled: false, inapp_enabled: true,
    });
    setLoading(false);
  }

  async function save() {
    if (!prefs) return;
    setSaving(true);
    const { error } = await supabase.from("notification_preferences")
      .upsert({ ...prefs, user_id: user!.id }, { onConflict: "user_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Preferences saved");
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2 mb-1">
        <Bell className="w-5 h-5 text-primary" /> Notification Preferences
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Choose what NAFT can ping you about, and how.</p>

      <div className="space-y-3 mb-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Topics</h2>
        {PREFS.map((p) => (
          <div key={p.key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div>
              <div className="font-semibold text-foreground">{p.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
            </div>
            <Switch checked={!!prefs[p.key]} onCheckedChange={(v) => setPrefs({ ...prefs, [p.key]: v })} />
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Channels</h2>
        {CHANNELS.map((c) => (
          <div key={c.key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div>
              <div className="font-semibold text-foreground">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
            </div>
            <Switch checked={!!prefs[c.key]} onCheckedChange={(v) => setPrefs({ ...prefs, [c.key]: v })} />
          </div>
        ))}
      </div>

      <Button onClick={save} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save preferences
      </Button>
    </div>
  );
}
