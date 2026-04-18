import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Star, AlertTriangle, TrendingUp, Pencil, Activity, ArrowUpCircle, Lock, BarChart3, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import ReviewReactions from "@/components/reviews/ReviewReactions";

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

interface ReviewReply { id: string; review_id: string; content: string; updated_at: string; user_id: string; }

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [broker, setBroker] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, ReviewReply>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [form, setForm] = useState({ name: "", avg_spread: "", leverage: "", min_deposit: "" });
  const [upgradeContact, setUpgradeContact] = useState({ email: "", phone: "" });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replySaving, setReplySaving] = useState<string | null>(null);

  const tier = profile?.tier || "basic";
  const isVerified = tier === "verified" || tier === "featured";
  const isFeatured = tier === "featured";
  const canReply = !!user && !!profile && profile.claimed_by === user.id && profile.claim_status === "approved";

  const loadReplies = async (brokerId: string) => {
    const { data: rep } = await supabase.from("review_replies").select("*").eq("broker_id", brokerId);
    if (rep) {
      const map: Record<string, ReviewReply> = {};
      (rep as ReviewReply[]).forEach((rr) => { map[rr.review_id] = rr; });
      setReplies(map);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: bp } = await supabase.from("broker_profiles").select("*").eq("claimed_by", user.id).limit(1).maybeSingle();
      if (bp) {
        setProfile(bp);
        const { data: b } = await supabase.from("brokers").select("*").eq("id", bp.broker_id).maybeSingle();
        if (b) {
          setBroker(b);
          setForm({ name: b.name, avg_spread: b.avg_spread || "", leverage: b.leverage || "", min_deposit: b.min_deposit || "" });
          const { data: c } = await supabase.from("complaints").select("*").eq("broker_id", b.id).order("created_at", { ascending: false });
          if (c) setComplaints(c);
          const { data: r } = await supabase.from("reviews").select("*").eq("broker_id", b.id).eq("status", "published").order("created_at", { ascending: false });
          if (r) setReviews(r);
          await loadReplies(b.id);
        }
      } else {
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

  const handleSaveReply = async (reviewId: string) => {
    if (!broker || !user) return;
    const content = (replyDrafts[reviewId] || "").trim();
    if (!content) { toast.error("Reply cannot be empty"); return; }
    setReplySaving(reviewId);
    try {
      const existing = replies[reviewId];
      if (existing) {
        const { error } = await supabase.from("review_replies").update({ content }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("review_replies").insert({
          review_id: reviewId, broker_id: broker.id, user_id: user.id, content,
        });
        if (error) throw error;
      }
      toast.success("Reply saved");
      setReplyOpen((s) => ({ ...s, [reviewId]: false }));
      setReplyDrafts((s) => ({ ...s, [reviewId]: "" }));
      await loadReplies(broker.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to save reply");
    }
    setReplySaving(null);
  };

  const handleDeleteReply = async (reviewId: string) => {
    const existing = replies[reviewId];
    if (!existing) return;
    const { error } = await supabase.from("review_replies").delete().eq("id", existing.id);
    if (error) { toast.error(error.message); return; }
    setReplies((s) => { const n = { ...s }; delete n[reviewId]; return n; });
    toast.success("Reply deleted");
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
    { label: "Reviews", value: reviews.length, icon: TrendingUp },
    { label: "Complaints", value: complaints.length || broker.complaints || 0, icon: AlertTriangle },
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

      {/* Reviews section with reply + reactions */}
      <div className="hud-card p-1 mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Reviews ({reviews.length})</span>
            {!canReply && <Lock className="w-3 h-3 text-muted-foreground ml-2" />}
          </div>
          <div className="space-y-3">
            {reviews.map((r) => {
              const reply = replies[r.id];
              const isEditing = !!replyOpen[r.id];
              return (
                <div key={r.id} className="p-3 bg-background/50 border border-border/50 rounded">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground font-mono flex-1">{r.content || "No content"}</p>
                    <span className="text-xs text-muted-foreground shrink-0">★{r.rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">By {r.author}</p>

                  <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                    <ReviewReactions reviewId={r.id} />
                    {canReply && !isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs font-mono"
                        onClick={() => {
                          setReplyOpen((s) => ({ ...s, [r.id]: true }));
                          setReplyDrafts((s) => ({ ...s, [r.id]: reply?.content || "" }));
                        }}
                      >
                        {reply ? "EDIT REPLY" : "REPLY"}
                      </Button>
                    )}
                  </div>

                  {reply && !isEditing && (
                    <div className="mt-3 ml-2 border-l-2 border-primary/40 pl-3 py-2 bg-primary/5 rounded-r">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest">Official response</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  )}

                  {canReply && isEditing && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={replyDrafts[r.id] || ""}
                        onChange={(e) => setReplyDrafts((s) => ({ ...s, [r.id]: e.target.value }))}
                        placeholder={`Write an official response as ${broker.name}...`}
                        rows={3}
                        className="font-mono text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        {reply && (
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteReply(r.id)}>
                            DELETE
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-8 text-xs font-mono" onClick={() => setReplyOpen((s) => ({ ...s, [r.id]: false }))}>
                          CANCEL
                        </Button>
                        <Button size="sm" className="h-8 text-xs font-mono" disabled={replySaving === r.id} onClick={() => handleSaveReply(r.id)}>
                          {replySaving === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "SAVE"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground font-mono">NO REVIEWS YET</p>}
          </div>
        </div>
      </div>

      {/* Complaints */}
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

      {isFeatured && (
        <>
          <div className="hud-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Analytics</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold font-mono">{reviews.length}</p><p className="text-[10px] text-muted-foreground font-mono">Total Reviews</p></div>
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
