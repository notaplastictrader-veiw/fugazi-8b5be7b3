import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, BarChart3, Send, Mail, Megaphone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Campaign {
  id: string;
  sponsor_name: string;
  placement_slug: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const RevenueAdmin = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [enquiries, setEnquiries] = useState(0);
  const [referrals, setReferrals] = useState({ codes: 0, clicks: 0, conversions: 0 });
  const [optedIn, setOptedIn] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, e, r, p] = await Promise.all([
        supabase.from("ad_campaigns").select("id, sponsor_name, placement_slug, is_active, start_date, end_date"),
        supabase.from("ad_enquiries").select("id", { count: "exact", head: true }),
        supabase.from("referral_codes").select("clicks, conversions"),
        supabase.from("notification_preferences").select("user_id", { count: "exact", head: true })
          .eq("weekly_digest", true).eq("inapp_enabled", true),
      ]);
      setCampaigns((c.data as Campaign[]) || []);
      setEnquiries(e.count || 0);
      const codes = (r.data as { clicks: number; conversions: number }[]) || [];
      setReferrals({
        codes: codes.length,
        clicks: codes.reduce((s, x) => s + (x.clicks || 0), 0),
        conversions: codes.reduce((s, x) => s + (x.conversions || 0), 0),
      });
      setOptedIn(p.count || 0);
      setLoading(false);
    })();
  }, []);

  const sendDigest = async () => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke("weekly-digest");
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success(`Digest sent to ${data?.sent ?? 0} subscribers`);
  };

  const isLive = (c: Campaign) => {
    const now = new Date();
    return c.is_active && new Date(c.start_date) <= now && new Date(c.end_date) >= now;
  };
  const liveCount = campaigns.filter(isLive).length;
  const conversionRate = referrals.clicks > 0
    ? ((referrals.conversions / referrals.clicks) * 100).toFixed(1) + "%"
    : "0%";

  const stats = [
    { label: "Live Sponsor Campaigns", value: String(liveCount), icon: Megaphone, sub: `${campaigns.length} total` },
    { label: "Advertise Enquiries", value: String(enquiries), icon: DollarSign, sub: "All-time leads" },
    { label: "Referral Conversions", value: String(referrals.conversions), icon: TrendingUp, sub: `${conversionRate} of ${referrals.clicks} clicks` },
    { label: "Digest Subscribers", value: String(optedIn), icon: Mail, sub: "Opted-in users" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue & Growth</h2>
          <p className="text-sm text-muted-foreground mt-1">Sponsor placements, referral funnel, and lifecycle email triggers.</p>
        </div>
        <Button onClick={sendDigest} disabled={sending || optedIn === 0}>
          {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
          Send Weekly Digest Now
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(p => (
          <Card key={p.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-wider">
                <p.icon className="w-4 h-4 text-primary" />{p.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{loading ? "—" : p.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{p.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Active Sponsor Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns yet. Create one in <a href="/admin/advertise/campaigns" className="text-primary underline">Live Campaigns</a>.</p>
          ) : (
            <div className="divide-y divide-border">
              {campaigns.map(c => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.sponsor_name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{c.placement_slug}</p>
                  </div>
                  {isLive(c) ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">● LIVE</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">Inactive</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground mt-6">
        Detailed impression/click counts flow into Google Analytics 4 (events: <code className="font-mono">sponsor_impression</code>, <code className="font-mono">sponsor_click</code>, <code className="font-mono">broker_visit_click</code>, <code className="font-mono">matcher_result_click</code>, <code className="font-mono">matcher_completed</code>).
      </p>
    </div>
  );
};

export default RevenueAdmin;
