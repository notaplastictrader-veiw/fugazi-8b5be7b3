import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, AlertTriangle, TrendingUp, Pencil, Activity, ArrowUpCircle, Lock, BarChart3, Shield, Loader2, Crown, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import ReviewReactions from "@/components/reviews/ReviewReactions";
import ContactAdminDialog from "@/components/portal/ContactAdminDialog";
import ImageUpload from "@/components/admin/ImageUpload";

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

const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const joinCsv = (a?: string[] | null) => (a || []).join(", ");

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [broker, setBroker] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, ReviewReply>>({});
  const [reads, setReads] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", avg_spread: "", leverage: "", min_deposit: "",
    description: "", headquarters: "", founded_year: "", website_url: "",
    support_email: "", support_phone: "", logo_url: "",
    pros: "", cons: "", platforms: "", payment_methods: "", regulation: "",
  });
  const [upgradeContact, setUpgradeContact] = useState({ email: "", phone: "" });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replySaving, setReplySaving] = useState<string | null>(null);

  const tier = profile?.tier || "basic";
  const isVerified = tier === "verified" || tier === "featured";
  const isFeatured = tier === "featured";
  // Gating is derived purely from `tier` — admin sets the tier so it implies trust.
  // Booleans (is_verified/is_featured) and claim_status are no longer used to lock UI.
  const owns = !!user && !!profile && profile.claimed_by === user.id;
  const canEdit = owns && isVerified;
  const canReply = owns && isVerified;
  const canReact = owns && isVerified;
  const canTrackReads = owns && isVerified;

  const unreadCount = useMemo(
    () => reviews.filter((r) => !reads.has(r.id) && !replies[r.id]).length,
    [reviews, reads, replies]
  );

  const loadReplies = async (brokerId: string) => {
    const { data: rep } = await supabase.from("review_replies").select("*").eq("broker_id", brokerId);
    if (rep) {
      const map: Record<string, ReviewReply> = {};
      (rep as ReviewReply[]).forEach((rr) => { map[rr.review_id] = rr; });
      setReplies(map);
    }
  };

  const loadReads = async (brokerId: string, uid: string) => {
    const { data } = await supabase.from("review_reads").select("review_id").eq("broker_id", brokerId).eq("user_id", uid);
    if (data) setReads(new Set((data as any[]).map((d) => d.review_id)));
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
          setForm({
            name: b.name || "",
            avg_spread: b.avg_spread || "",
            leverage: b.leverage || "",
            min_deposit: b.min_deposit || "",
            description: b.description || "",
            headquarters: b.headquarters || "",
            founded_year: b.founded_year ? String(b.founded_year) : "",
            website_url: b.website_url || "",
            support_email: b.support_email || "",
            support_phone: b.support_phone || "",
            logo_url: b.logo_url || "",
            pros: joinCsv(b.pros),
            cons: joinCsv(b.cons),
            platforms: joinCsv(b.platforms),
            payment_methods: joinCsv(b.payment_methods),
            regulation: joinCsv(b.regulation),
          });
          const { data: c } = await supabase.from("complaints").select("*").eq("broker_id", b.id).order("created_at", { ascending: false });
          if (c) setComplaints(c);
          const { data: r } = await supabase.from("reviews").select("*").eq("broker_id", b.id).eq("status", "published").order("created_at", { ascending: false });
          if (r) setReviews(r);
          await loadReplies(b.id);
          await loadReads(b.id, user.id);
        }
      } else {
        const { data: b } = await supabase.from("brokers").select("*").eq("created_by", user.id).limit(1).maybeSingle();
        if (b) {
          setBroker(b);
          setForm((f) => ({ ...f, name: b.name, avg_spread: b.avg_spread || "", leverage: b.leverage || "", min_deposit: b.min_deposit || "" }));
        }
      }
    };
    fetchData();
  }, [user]);

  const handleEdit = async () => {
    if (!broker || !user) return;
    if (!canEdit) { toast.error("Upgrade to Verified to edit your profile"); return; }
    const payload: any = {
      name: form.name,
      avg_spread: form.avg_spread,
      leverage: form.leverage,
      min_deposit: form.min_deposit,
      description: form.description,
      headquarters: form.headquarters,
      founded_year: form.founded_year ? parseInt(form.founded_year, 10) || null : null,
      website_url: form.website_url,
      support_email: form.support_email,
      support_phone: form.support_phone,
      logo_url: form.logo_url,
      pros: splitCsv(form.pros),
      cons: splitCsv(form.cons),
      platforms: splitCsv(form.platforms),
      payment_methods: splitCsv(form.payment_methods),
      regulation: splitCsv(form.regulation),
      status: "pending" as const,
    };
    const { error } = await supabase.from("brokers").update(payload).eq("id", broker.id);
    if (error) { toast.error(error.message); return; }
    await submitToApprovalQueue("broker", broker.id, user.id);
    await logAuditAction(user.id, "update", "brokers", broker.id, broker, payload);
    toast.success("Profile submitted for review");
    setEditOpen(false);
    setBroker({ ...broker, ...payload });
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

  const markRead = async (reviewId: string) => {
    if (!canTrackReads || !broker || !user) return;
    if (reads.has(reviewId)) return;
    const { error } = await supabase.from("review_reads").insert({
      review_id: reviewId, broker_id: broker.id, user_id: user.id,
    });
    if (!error) setReads((s) => new Set(s).add(reviewId));
  };

  const handleSaveReply = async (reviewId: string) => {
    if (!broker || !user) return;
    if (!canReply) { toast.error("Upgrade to Verified to reply"); return; }
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
      // Auto-mark as read on reply
      await markRead(reviewId);
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hud-badge">BROKER</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">My Broker Dashboard</h2>
          <BrokerTierBadge tier={tier} size="md" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <ContactAdminDialog senderRole="broker" contextName={broker.name} />
          {tier !== "featured" && (
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:border-amber-500/60 font-mono text-xs" onClick={() => setUpgradeOpen(true)}>
              <ArrowUpCircle className="w-3 h-3 mr-1" /> UPGRADE
            </Button>
          )}
          {canEdit ? (
            <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary/60 font-mono text-xs" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3 h-3 mr-1" /> EDIT PROFILE
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled className="font-mono text-xs border-amber-500/20 text-amber-400/70 cursor-not-allowed" title="Upgrade to Verified to edit">
              <Lock className="w-3 h-3 mr-1" /> EDIT (LOCKED)
            </Button>
          )}
        </div>
      </div>

      {/* Tier Benefits banner */}
      {tier === "basic" && (
        <div className="hud-card p-4 mb-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-3 flex-wrap">
            <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="flex-1 min-w-[260px]">
              <p className="text-sm font-semibold text-amber-400 font-mono">BASIC TIER — LIMITED ACCESS</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                You can view your listing, reviews, and analytics. Upgrade to <span className="text-amber-400">Verified</span> to:
                edit your profile content, reply to reviews, react with emojis, and track read/unread status.
              </p>
            </div>
            <Button size="sm" className="font-mono text-xs" onClick={() => setUpgradeOpen(true)}>UPGRADE NOW</Button>
          </div>
        </div>
      )}

      {isVerified && !isFeatured && (
        <div className="hud-card p-3 mb-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 flex-wrap">
            <Shield className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-muted-foreground font-mono flex-1">
              <span className="text-blue-400 font-semibold">VERIFIED PARTNER</span> — All edit & reply tools unlocked. Upgrade to <span className="text-amber-400">Featured</span> for homepage placement & search priority.
            </p>
            <Button size="sm" variant="outline" className="font-mono text-xs border-amber-500/30 text-amber-400" onClick={() => setUpgradeOpen(true)}>
              <Crown className="w-3 h-3 mr-1" /> GO FEATURED
            </Button>
          </div>
        </div>
      )}

      {isFeatured && (
        <div className="hud-card p-3 mb-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-mono text-muted-foreground">
              <span className="text-amber-400 font-semibold">FEATURED PARTNER</span> — Your listing is featured on the homepage and prioritized in search results.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => <HudGauge key={c.label} value={c.value} label={c.label} icon={c.icon} />)}
      </div>

      {/* Reviews section with reply + reactions + read tracking */}
      <div className="hud-card p-1 mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Reviews ({reviews.length})</span>
            {canTrackReads && unreadCount > 0 && (
              <Badge variant="default" className="ml-2 h-5 text-[10px] font-mono bg-amber-500/20 text-amber-400 border-amber-500/40">
                {unreadCount} NEW
              </Badge>
            )}
            {!canReply && (
              <span className="ml-auto text-[10px] font-mono text-amber-400/80 inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> Reply & React locked — Verified+
              </span>
            )}
          </div>
          <div className="space-y-3">
            {reviews.map((r) => {
              const reply = replies[r.id];
              const isEditing = !!replyOpen[r.id];
              const isUnread = canTrackReads && !reads.has(r.id) && !reply;
              return (
                <div key={r.id} className={`p-3 bg-background/50 border rounded ${isUnread ? "border-amber-500/40" : "border-border/50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {isUnread && <Badge className="h-5 text-[9px] font-mono bg-amber-500/20 text-amber-400 border-amber-500/40">NEW</Badge>}
                      <p className="text-sm text-foreground font-mono">{r.content || "No content"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">★{r.rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">By {r.author}</p>

                  <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                    <ReviewReactions reviewId={r.id} readOnly={!canReact} />
                    <div className="flex items-center gap-2">
                      {canTrackReads && isUnread && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs font-mono text-muted-foreground" onClick={() => markRead(r.id)}>
                          <CheckCheck className="w-3 h-3 mr-1" /> MARK READ
                        </Button>
                      )}
                      {canReply ? (
                        !isEditing && (
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
                        )
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="h-7 text-xs font-mono text-amber-400/70 cursor-not-allowed">
                          <Lock className="w-3 h-3 mr-1" /> REPLY
                        </Button>
                      )}
                    </div>
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

      {/* EXPANDED Edit Dialog (Verified+) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Broker Profile</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-3 font-mono">All changes go to Pending → Admin Approval → Live</p>
          <div className="space-y-4">
            <ImageUpload value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} bucket="logos" folder="brokers" maxSizeMB={2} label="Broker Logo" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label className="font-mono text-xs">Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label className="font-mono text-xs">Headquarters</Label><Input value={form.headquarters} onChange={e => setForm({...form, headquarters: e.target.value})} placeholder="e.g. London, UK" /></div>
              <div><Label className="font-mono text-xs">Founded Year</Label><Input type="number" value={form.founded_year} onChange={e => setForm({...form, founded_year: e.target.value})} /></div>
              <div><Label className="font-mono text-xs">Website URL</Label><Input value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://" /></div>
              <div><Label className="font-mono text-xs">Avg Spread</Label><Input value={form.avg_spread} onChange={e => setForm({...form, avg_spread: e.target.value})} /></div>
              <div><Label className="font-mono text-xs">Leverage</Label><Input value={form.leverage} onChange={e => setForm({...form, leverage: e.target.value})} /></div>
              <div><Label className="font-mono text-xs">Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({...form, min_deposit: e.target.value})} /></div>
              <div></div>
              <div><Label className="font-mono text-xs">Support Email</Label><Input type="email" value={form.support_email} onChange={e => setForm({...form, support_email: e.target.value})} /></div>
              <div><Label className="font-mono text-xs">Support Phone</Label><Input value={form.support_phone} onChange={e => setForm({...form, support_phone: e.target.value})} /></div>
            </div>

            <div>
              <Label className="font-mono text-xs">Description / Overview</Label>
              <Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Tell traders about your broker..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-xs">Pros (comma-separated)</Label>
                <Textarea rows={2} value={form.pros} onChange={e => setForm({...form, pros: e.target.value})} placeholder="Tight spreads, Fast withdrawals" />
              </div>
              <div>
                <Label className="font-mono text-xs">Cons (comma-separated)</Label>
                <Textarea rows={2} value={form.cons} onChange={e => setForm({...form, cons: e.target.value})} placeholder="Limited assets" />
              </div>
              <div>
                <Label className="font-mono text-xs">Platforms (comma-separated)</Label>
                <Input value={form.platforms} onChange={e => setForm({...form, platforms: e.target.value})} placeholder="MT4, MT5, cTrader" />
              </div>
              <div>
                <Label className="font-mono text-xs">Payment Methods (comma-separated)</Label>
                <Input value={form.payment_methods} onChange={e => setForm({...form, payment_methods: e.target.value})} placeholder="Visa, Skrill, Crypto" />
              </div>
              <div className="md:col-span-2">
                <Label className="font-mono text-xs">Regulation (comma-separated)</Label>
                <Input value={form.regulation} onChange={e => setForm({...form, regulation: e.target.value})} placeholder="FCA, CySEC, ASIC" />
              </div>
            </div>

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
