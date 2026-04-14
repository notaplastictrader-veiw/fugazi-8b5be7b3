import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, ExternalLink, Building2, Radio, Dices } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/approvalQueue";

const typeIcons: Record<string, any> = { broker: Building2, signal: Radio, betting: Dices };

const BrokerClaimsAdmin = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewClaim, setReviewClaim] = useState<any>(null);
  const [note, setNote] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    const { data } = await supabase.from("profile_claims").select("*").order("created_at", { ascending: false });
    setClaims(data || []);
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

      // Assign role
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

  const statusColor: Record<string, string> = { pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", approved: "bg-green-500/10 text-green-400 border-green-500/30", rejected: "bg-red-500/10 text-red-400 border-red-500/30" };

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
                    <p className="font-mono text-sm font-semibold uppercase">{c.profile_type} Profile</p>
                    <p className="text-[10px] text-muted-foreground font-mono">ID: {c.profile_id?.slice(0, 8)}... · By: {c.claimed_by?.slice(0, 8)}...</p>
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Review Claim</DialogTitle></DialogHeader>
          {reviewClaim && (
            <div className="space-y-4">
              <div className="text-sm font-mono space-y-1">
                <p><span className="text-muted-foreground">Type:</span> {reviewClaim.profile_type}</p>
                <p><span className="text-muted-foreground">Profile ID:</span> {reviewClaim.profile_id}</p>
                <p><span className="text-muted-foreground">Claimed By:</span> {reviewClaim.claimed_by}</p>
                {reviewClaim.documents_url && <p><span className="text-muted-foreground">Docs:</span> <a href={reviewClaim.documents_url} target="_blank" className="text-primary underline">{reviewClaim.documents_url}</a></p>}
              </div>
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
