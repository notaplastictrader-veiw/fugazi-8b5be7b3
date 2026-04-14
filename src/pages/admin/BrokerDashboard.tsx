import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Star, AlertTriangle, TrendingUp, Pencil, Activity, ArrowUpCircle, Lock, BarChart3 } from "lucide-react";
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

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [broker, setBroker] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [form, setForm] = useState({ name: "", avg_spread: "", leverage: "", min_deposit: "" });
  const [upgradeContact, setUpgradeContact] = useState({ email: "", phone: "" });

  const tier = profile?.tier || "basic";
  const isVerified = tier === "verified" || tier === "featured";
  const isFeatured = tier === "featured";

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Get broker profile linked to user
      const { data: bp } = await supabase.from("broker_profiles").select("*").eq("claimed_by", user.id).limit(1).maybeSingle();
      if (bp) {
        setProfile(bp);
        const { data: b } = await supabase.from("brokers").select("*").eq("id", bp.broker_id).maybeSingle();
        if (b) {
          setBroker(b);
          setForm({ name: b.name, avg_spread: b.avg_spread || "", leverage: b.leverage || "", min_deposit: b.min_deposit || "" });
          const { data: c } = await supabase.from("complaints").select("*").eq("broker_id", b.id).order("created_at", { ascending: false });
          if (c) setComplaints(c);
          const { data: r } = await supabase.from("reviews").select("*").eq("broker_id", b.id).order("created_at", { ascending: false });
          if (r) setReviews(r);
        }
      } else {
        // Fallback: check by created_by
        const { data: b } = await supabase.from("brokers").select("*").eq("created_by", user.id).limit(1).maybeSingle();
        if (b) {
          setBroker(b);
          setForm({ name: b.name, avg_spread: b.avg_spread || "", leverage: b.leverage || "", min_deposit: b.min_deposit || "" });
        }
      }
    };
    fetchData();
  }, [user]);

  const handleEdit = async () => {
    if (!broker || !user) return;
    const { error } = await supabase.from("brokers").update({ ...form, status: "pending" as const }).eq("id", broker.id);
    if (error) { toast.error(error.message); return; }
    await submitToApprovalQueue("broker", broker.id, user.id);
    await logAuditAction(user.id, "update", "brokers", broker.id, broker, form);
    toast.success("Profile submitted for review");
    setEditOpen(false);
    setBroker({ ...broker, ...form, status: "pending" });
  };

  const handleUpgradeRequest = async () => {
    if (!user || !profile) return;
    const nextTier = tier === "basic" ? "verified" : "featured";
    const { error } = await supabase.from("tier_upgrades").insert({
      profile_type: "broker",
      profile_id: profile.broker_id,
      requested_by: user.id,
      current_tier: tier,
      requested_tier: nextTier,
      contact_info: upgradeContact,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Upgrade request submitted!");
    setUpgradeOpen(false);
  };

  if (!broker) return (
    <div className="text-center py-16 text-muted-foreground hud-scanline">
      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="font-mono text-sm">NO BROKER LISTING LINKED TO YOUR ACCOUNT</p>
      <a href="/claim-broker" className="text-primary font-mono text-xs underline mt-2 inline-block">Claim your broker profile →</a>
    </div>
  );

  const cards = [
    { label: "Score", value: broker.score || 0, icon: Star },
    { label: "Reviews", value: broker.review_count || 0, icon: TrendingUp },
    { label: "Complaints", value: broker.complaints || 0, icon: AlertTriangle },
    { label: "Status", value: broker.status, icon: Building2 },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="hud-badge">BROKER</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">My Broker Dashboard</h2>
          <BrokerTierBadge tier={tier} size="md" />
        </div>
        <div className="flex gap-2">
          {tier !== "featured" && (
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:border-amber-500/60 font-mono text-xs" onClick={() => setUpgradeOpen(true)}>
              <ArrowUpCircle className="w-3 h-3 mr-1" /> UPGRADE
            </Button>
          )}
          {(isVerified || isFeatured) && (
            <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary/60 font-mono text-xs" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3 h-3 mr-1" /> EDIT PROFILE
            </Button>
          )}
        </div>
      </div>

      {/* Tier 1 (Basic) upgrade banner */}
      {tier === "basic" && (
        <div className="hud-card p-4 mb-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-400 font-mono">BASIC TIER — LIMITED ACCESS</p>
              <p className="text-xs text-muted-foreground font-mono">Upgrade to Verified to reply to reviews, manage promotions, and access analytics.</p>
            </div>
            <Button size="sm" className="ml-auto font-mono text-xs" onClick={() => setUpgradeOpen(true)}>Upgrade Now</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => <HudGauge key={c.label} value={c.value} label={c.label} icon={c.icon} />)}
      </div>

      {/* Reviews section — Tier 2+ can see reply options */}
      <div className="hud-card p-1 mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Reviews ({reviews.length})</span>
            {!isVerified && <Lock className="w-3 h-3 text-muted-foreground ml-2" />}
          </div>
          <div className="space-y-2">
            {reviews.slice(0, 5).map((r, i) => (
              <div key={i} className="p-3 bg-background/50 border border-border/50 rounded">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground font-mono">{r.content || "No content"}</p>
                  <span className="text-xs text-muted-foreground">★{r.rating}</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">By {r.author}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground font-mono">NO REVIEWS YET</p>}
          </div>
        </div>
      </div>

      {/* Complaints section */}
      <div className="hud-card p-1 mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Complaints ({complaints.length})</span>
          </div>
          <div className="space-y-2">
            {complaints.map((c, i) => (
              <div key={i} className="p-3 bg-background/50 border border-border/50 rounded">
                <p className="text-sm text-foreground font-mono">{c.content || "No details"}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono mt-1 inline-block ${c.status === "published" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"}`}>{c.status}</span>
              </div>
            ))}
            {complaints.length === 0 && <p className="text-sm text-muted-foreground font-mono">NO COMPLAINTS FILED</p>}
          </div>
        </div>
      </div>

      {/* Featured tier: Analytics & Account Manager */}
      {isFeatured && (
        <>
          <div className="hud-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Analytics</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold font-mono">{broker.review_count || 0}</p><p className="text-[10px] text-muted-foreground font-mono">Total Reviews</p></div>
              <div><p className="text-2xl font-bold font-mono">{broker.score || 0}</p><p className="text-[10px] text-muted-foreground font-mono">Trust Score</p></div>
              <div><p className="text-2xl font-bold font-mono">{complaints.length}</p><p className="text-[10px] text-muted-foreground font-mono">Complaints</p></div>
            </div>
          </div>
          {profile?.account_manager_name && (
            <div className="hud-card p-4 mb-6">
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Account Manager</p>
              <p className="font-mono text-sm">{profile.account_manager_name}</p>
              <p className="text-xs text-muted-foreground font-mono">{profile.account_manager_contact}</p>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog — Tier 2+ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Broker Profile</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3 font-mono">Changes → Pending → Admin Approval → Live</p>
          <div className="space-y-3">
            <div><Label className="font-mono text-xs">Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Avg Spread</Label><Input value={form.avg_spread} onChange={e => setForm({...form, avg_spread: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Leverage</Label><Input value={form.leverage} onChange={e => setForm({...form, leverage: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({...form, min_deposit: e.target.value})} /></div>
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

export default BrokerDashboard;
