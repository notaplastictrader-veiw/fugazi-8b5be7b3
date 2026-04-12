import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Copy, Check, MousePointerClick, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

const Referrals = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCodes = async () => {
      const { data } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setCodes(data);
      setLoading(false);
    };
    fetchCodes();
  }, [user]);

  const generateCode = async () => {
    if (!user) return;
    const code = `NAFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({ user_id: user.id, code })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    if (data) setCodes([data, ...codes]);
    toast.success("Referral code created!");
  };

  const copyLink = (code: string, id: string) => {
    const link = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalClicks = codes.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConversions = codes.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalEarnings = codes.reduce((s, c) => s + Number(c.earnings || 0), 0);

  const statCards = [
    { label: t("referral.clicks", "Clicks"), value: totalClicks, icon: MousePointerClick },
    { label: t("referral.conversions", "Conversions"), value: totalConversions, icon: TrendingUp },
    { label: t("referral.earnings", "Earnings"), value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("referral.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("referral.subtitle", "Share your unique link and earn rewards for every referral.")}</p>
        </div>
        <Button onClick={generateCode} size="sm">
          <Link2 className="w-4 h-4 mr-1" /> {t("referral.createCode", "Generate Code")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <s.icon className="w-4 h-4 text-primary" />{s.label}
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4">{t("referral.yourCode", "Your Referral Codes")}</h3>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : codes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No referral codes yet. Generate one to start earning!</p>
      ) : (
        <div className="space-y-3">
          {codes.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">{c.code}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>{c.clicks || 0} clicks</span>
                  <span>{c.conversions || 0} conversions</span>
                  <span>${Number(c.earnings || 0).toFixed(2)} earned</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(c.code, c.id)}
                className="shrink-0"
              >
                {copiedId === c.id ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copiedId === c.id ? t("referral.copied", "Copied!") : t("referral.copyLink", "Copy Link")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Referrals;
