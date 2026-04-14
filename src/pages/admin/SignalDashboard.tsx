import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Radio, TrendingUp, Users, CheckCircle, Pencil, ArrowUpCircle, Lock, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";

const HudGauge = ({ value, label, icon: Icon }: { value: string | number; label: string; icon: any }) => (
  <div className="hud-stat p-4 flex flex-col items-center gap-2 hud-scanline">
    <div className="relative w-20 h-20 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-1 rounded-full border border-primary/10" />
      <div className="flex flex-col items-center">
        <Icon className="w-4 h-4 text-primary mb-1" />
        <span className="text-lg font-bold text-foreground font-mono">{value}</span>
      </div>
    </div>
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
  </div>
);

const SignalDashboard = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [form, setForm] = useState({ name: "", members: "", monthly_signals: "", avg_rr: "", track_record: "" });
  const [upgradeContact, setUpgradeContact] = useState({ email: "", phone: "" });

  const tier = profile?.tier || "basic";
  const isVerified = tier === "verified" || tier === "featured";
  const isFeatured = tier === "featured";

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: sp } = await supabase.from("signal_profiles").select("*").eq("claimed_by", user.id).limit(1).maybeSingle();
      if (sp) {
        setProfile(sp);
        const { data } = await supabase.from("signal_groups").select("*").eq("id", sp.signal_group_id).maybeSingle();
        if (data) {
          setGroup(data);
          setForm({ name: data.name, members: data.members || "0", monthly_signals: data.monthly_signals || "0", avg_rr: data.avg_rr || "1:1", track_record: data.track_record || "" });
        }
      } else {
        const { data } = await supabase.from("signal_groups").select("*").eq("created_by", user.id).limit(1).maybeSingle();
        if (data) {
          setGroup(data);
          setForm({ name: data.name, members: data.members || "0", monthly_signals: data.monthly_signals || "0", avg_rr: data.avg_rr || "1:1", track_record: data.track_record || "" });
        }
      }
    };
    fetchData();
  }, [user]);

  const handleEdit = async () => {
    if (!group || !user) return;
    const { error } = await supabase.from("signal_groups").update({ ...form, status: "pending" as const }).eq("id", group.id);
    if (error) { toast.error(error.message); return; }
    await submitToApprovalQueue("signal_group", group.id, user.id);
    await logAuditAction(user.id, "update", "signal_groups", group.id, group, form);
    toast.success("Changes submitted for review");
    setEditOpen(false);
    setGroup({ ...group, ...form, status: "pending" });
  };

  const handleUpgradeRequest = async () => {
    if (!user || !profile) return;
    const nextTier = tier === "basic" ? "verified" : "featured";
    const { error } = await supabase.from("tier_upgrades").insert({
      profile_type: "signal",
      profile_id: profile.signal_group_id,
      requested_by: user.id,
      current_tier: tier,
      requested_tier: nextTier,
      contact_info: upgradeContact,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Upgrade request submitted!");
    setUpgradeOpen(false);
  };

  if (!group) return (
    <div className="text-center py-16 text-muted-foreground hud-scanline">
      <Radio className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="font-mono text-sm">NO SIGNAL GROUP LINKED TO YOUR ACCOUNT</p>
    </div>
  );

  const cards = [
    { label: "Win Rate", value: `${group.win_rate || 0}%`, icon: TrendingUp },
    { label: "Members", value: group.members || "0", icon: Users },
    { label: "Verified", value: group.verified ? "Yes" : "No", icon: CheckCircle },
    { label: "Status", value: group.status, icon: Radio },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="hud-badge">SIGNAL PROVIDER</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">My Signal Dashboard</h2>
          <BrokerTierBadge tier={tier} size="md" />
        </div>
        <div className="flex gap-2">
          {tier !== "featured" && (
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:border-amber-500/60 font-mono text-xs" onClick={() => setUpgradeOpen(true)}>
              <ArrowUpCircle className="w-3 h-3 mr-1" /> UPGRADE
            </Button>
          )}
          {isVerified && (
            <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary/60 font-mono text-xs" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3 h-3 mr-1" /> EDIT GROUP
            </Button>
          )}
        </div>
      </div>

      {tier === "basic" && (
        <div className="hud-card p-4 mb-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-400 font-mono">BASIC TIER — LIMITED ACCESS</p>
              <p className="text-xs text-muted-foreground font-mono">Upgrade to unlock editing, analytics, and more.</p>
            </div>
            <Button size="sm" className="ml-auto font-mono text-xs" onClick={() => setUpgradeOpen(true)}>Upgrade Now</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => <HudGauge key={c.label} value={c.value} label={c.label} icon={c.icon} />)}
      </div>

      {isFeatured && (
        <div className="hud-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Analytics</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold font-mono">{group.win_rate || 0}%</p><p className="text-[10px] text-muted-foreground font-mono">Win Rate</p></div>
            <div><p className="text-2xl font-bold font-mono">{group.members || 0}</p><p className="text-[10px] text-muted-foreground font-mono">Members</p></div>
            <div><p className="text-2xl font-bold font-mono">{group.monthly_signals || 0}</p><p className="text-[10px] text-muted-foreground font-mono">Monthly Signals</p></div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Signal Group</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3 font-mono">Changes → Pending → Admin Approval → Live</p>
          <div className="space-y-3">
            <div><Label className="font-mono text-xs">Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Members</Label><Input value={form.members} onChange={e => setForm({...form, members: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Monthly Signals</Label><Input value={form.monthly_signals} onChange={e => setForm({...form, monthly_signals: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Avg R:R</Label><Input value={form.avg_rr} onChange={e => setForm({...form, avg_rr: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Track Record</Label><Input value={form.track_record} onChange={e => setForm({...form, track_record: e.target.value})} /></div>
            <Button onClick={handleEdit} className="w-full font-mono">SUBMIT FOR REVIEW</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Request Tier Upgrade</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3 font-mono">
            Current: <BrokerTierBadge tier={tier} /> → Requesting: <BrokerTierBadge tier={tier === "basic" ? "verified" : "featured"} />
          </p>
          <div className="space-y-3">
            <div><Label className="font-mono text-xs">Contact Email</Label><Input value={upgradeContact.email} onChange={e => setUpgradeContact({...upgradeContact, email: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Phone</Label><Input value={upgradeContact.phone} onChange={e => setUpgradeContact({...upgradeContact, phone: e.target.value})} /></div>
            <Button onClick={handleUpgradeRequest} className="w-full font-mono">SUBMIT UPGRADE REQUEST</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignalDashboard;
