import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, ExternalLink, Building2, Radio, Dices, User, Phone, MapPin, Mail, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/approvalQueue";

const typeIcons: Record<string, any> = { broker: Building2, signal: Radio, betting: Dices };

interface ClaimWithDetails {
  id: string;
  profile_type: string;
  profile_id: string;
  claimed_by: string;
  documents_url: string | null;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  contact_info: any;
  claimant_name?: string;
  claimant_phone?: string;
  claimant_country?: string;
  entity_name?: string;
}

const BrokerClaimsAdmin = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ClaimWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewClaim, setReviewClaim] = useState<ClaimWithDetails | null>(null);
  const [note, setNote] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    const { data } = await supabase.from("profile_claims").select("*").order("created_at", { ascending: false });
    if (!data || data.length === 0) { setClaims([]); setLoading(false); return; }

    const enriched: ClaimWithDetails[] = data.map(c => ({ ...c, contact_info: (c as any).contact_info }));

    // Fetch claimant profiles
    const userIds = [...new Set(data.map(c => c.claimed_by))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, phone, country").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    // Fetch entity names per type
    const brokerIds = data.filter(c => c.profile_type === "broker").map(c => c.profile_id);
    const signalIds = data.filter(c => c.profile_type === "signal").map(c => c.profile_id);
    const bettingIds = data.filter(c => c.profile_type === "betting").map(c => c.profile_id);

    const entityMap = new Map<string, string>();

    if (brokerIds.length > 0) {
      const { data: brokers } = await supabase.from("brokers").select("id, name").in("id", brokerIds);
      (brokers || []).forEach(b => entityMap.set(b.id, b.name));
    }
    if (signalIds.length > 0) {
      const { data: signals } = await supabase.from("signal_groups").select("id, name").in("id", signalIds);
      (signals || []).forEach(s => entityMap.set(s.id, s.name));
    }
    if (bettingIds.length > 0) {
      const { data: betting } = await supabase.from("betting_profiles").select("id, site_name").in("id", bettingIds);
      (betting || []).forEach(b => entityMap.set(b.id, b.site_name));
    }

    enriched.forEach(c => {
      const profile = profileMap.get(c.claimed_by);
      if (profile) {
        c.claimant_name = profile.full_name || undefined;
        c.claimant_phone = profile.phone || undefined;
        c.claimant_country = profile.country || undefined;
      }
      c.entity_name = entityMap.get(c.profile_id);
    });

    setClaims(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    const { error } = await supabase.from("profile_claims").update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_note: note,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }

    if (status === "approved" && reviewClaim) {
      const { profile_type, profile_id, claimed_by } = reviewClaim;
      const table = profile_type === "broker" ? "broker_profiles" : profile_type === "signal" ? "signal_profiles" : "betting_profiles";
      await (supabase.from(table) as any).update({ claim_status: "claimed", claimed_by }).eq(profile_type === "broker" ? "broker_id" : profile_type === "signal" ? "signal_group_id" : "id", profile_id);

      const roleMap: Record<string, string> = { broker: "broker", signal: "signal_provider", betting: "betting_site" };
      const role = roleMap[profile_type];
      if (role) {
        await supabase.from("user_roles").insert({ user_id: claimed_by, role: role as any });
      }
    }

    await logAuditAction(user.id, status === "approved" ? "approve_claim" : "reject_claim", "profile_claims", id, null, { status, note });
    toast.success(`Claim ${status}`);
    setReviewClaim(null);
    setNote("");
    fetchClaims();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/10 text-green-400 border-green-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const typeLabel: Record<string, string> = { broker: "Broker", signal: "Signal Group", betting: "Betting Site" };

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">ADMIN</div>
        <h2 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide">Profile Claims</h2>
      </div>

      {loading ? (
        <p className="text-muted-foreground font-mono text-sm">Loading...</p>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-mono">No claims submitted yet.</div>
      ) : (
        <div className="space-y-3">
          {claims.map(c => {
            const Icon = typeIcons[c.profile_type] || Building2;
            return (
              <div key={c.id} className="hud-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {c.claimant_name || "Unknown User"} → <span className="text-primary">{c.entity_name || c.profile_id?.slice(0, 8) + "..."}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      {typeLabel[c.profile_type] || c.profile_type} · {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${statusColor[c.status] || ""}`}>{c.status}</span>
                  {c.documents_url && (
                    <a href={c.documents_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" /></a>
                  )}
                  {c.status === "pending" && (
                    <Button size="sm" variant="outline" className="font-mono text-xs" onClick={() => { setReviewClaim(c); setNote(""); }}>Review</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!reviewClaim} onOpenChange={() => setReviewClaim(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Review Claim</DialogTitle></DialogHeader>
          {reviewClaim && (
            <div className="space-y-4">
              {/* Entity Info */}
              <div className="border border-border rounded-lg p-3 bg-muted/30">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Claiming</p>
                <div className="flex items-center gap-2">
                  {(() => { const Icon = typeIcons[reviewClaim.profile_type] || Building2; return <Icon className="w-4 h-4 text-primary" />; })()}
                  <span className="font-semibold">{reviewClaim.entity_name || reviewClaim.profile_id}</span>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">({typeLabel[reviewClaim.profile_type] || reviewClaim.profile_type})</span>
                </div>
              </div>

              {/* Claimant Info */}
              <div className="border border-border rounded-lg p-3 bg-muted/30">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-2">Claimant Details</p>
                <div className="space-y-1.5 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{reviewClaim.claimant_name || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{reviewClaim.claimant_phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{reviewClaim.claimant_country || "Not provided"}</span>
                  </div>
                  {/* Contact info from claim submission */}
                  {reviewClaim.contact_info && Object.keys(reviewClaim.contact_info).length > 0 && (
                    <>
                      {reviewClaim.contact_info.company && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{reviewClaim.contact_info.company} {reviewClaim.contact_info.position ? `(${reviewClaim.contact_info.position})` : ""}</span>
                        </div>
                      )}
                      {reviewClaim.contact_info.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{reviewClaim.contact_info.email}</span>
                        </div>
                      )}
                      {reviewClaim.contact_info.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{reviewClaim.contact_info.phone} <span className="text-[10px] text-muted-foreground">(submitted)</span></span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Documents */}
              {reviewClaim.documents_url && (
                <div className="text-sm font-mono">
                  <span className="text-muted-foreground">Docs: </span>
                  <a href={reviewClaim.documents_url} target="_blank" className="text-primary underline break-all">{reviewClaim.documents_url}</a>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="font-mono text-xs text-muted-foreground">Admin Note</label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..." />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDecision(reviewClaim.id, "approved")} className="flex-1 bg-green-600 hover:bg-green-700 font-mono">
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button onClick={() => handleDecision(reviewClaim.id, "rejected")} variant="destructive" className="flex-1 font-mono">
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerClaimsAdmin;
