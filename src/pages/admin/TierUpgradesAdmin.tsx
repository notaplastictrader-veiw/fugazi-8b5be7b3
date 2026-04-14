import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/approvalQueue";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";

const TierUpgradesAdmin = () => {
  const { user } = useAuth();
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [note, setNote] = useState("");

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("tier_upgrades").select("*").order("created_at", { ascending: false });
    setUpgrades(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    if (!user || !reviewItem) return;
    const { error } = await supabase.from("tier_upgrades").update({
      status,
      admin_note: note,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }

    if (status === "approved") {
      const { profile_type, profile_id, requested_tier } = reviewItem;
      const table = profile_type === "broker" ? "broker_profiles" : profile_type === "signal" ? "signal_profiles" : "betting_profiles";
      const idCol = profile_type === "broker" ? "broker_id" : profile_type === "signal" ? "signal_group_id" : "id";
      await (supabase.from(table) as any).update({
        tier: requested_tier,
        is_verified: requested_tier !== "basic",
        is_featured: requested_tier === "featured",
      }).eq(idCol, profile_id);
    }

    await logAuditAction(user.id, status === "approved" ? "approve_upgrade" : "reject_upgrade", "tier_upgrades", id, null, { status, note });
    toast.success(`Upgrade ${status}`);
    setReviewItem(null);
    setNote("");
    fetch();
  };

  const statusColor: Record<string, string> = { pending: "text-yellow-400", approved: "text-green-400", rejected: "text-red-400" };

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">ADMIN</div>
        <h2 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide">Tier Upgrades</h2>
      </div>

      {loading ? (
        <p className="text-muted-foreground font-mono text-sm">Loading...</p>
      ) : upgrades.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-mono">No upgrade requests yet.</div>
      ) : (
        <div className="space-y-3">
          {upgrades.map(u => (
            <div key={u.id} className="hud-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowUpCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-mono text-sm font-semibold uppercase">{u.profile_type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <BrokerTierBadge tier={u.current_tier} size="sm" />
                    <span className="text-muted-foreground text-xs">→</span>
                    <BrokerTierBadge tier={u.requested_tier} size="sm" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono uppercase ${statusColor[u.status] || ""}`}>{u.status}</span>
                {u.status === "pending" && (
                  <Button size="sm" variant="outline" className="font-mono text-xs" onClick={() => { setReviewItem(u); setNote(""); }}>Review</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reviewItem} onOpenChange={() => setReviewItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Review Upgrade Request</DialogTitle></DialogHeader>
          {reviewItem && (
            <div className="space-y-4">
              <div className="text-sm font-mono space-y-1">
                <p><span className="text-muted-foreground">Type:</span> {reviewItem.profile_type}</p>
                <div className="flex items-center gap-2">
                  <BrokerTierBadge tier={reviewItem.current_tier} />
                  <span>→</span>
                  <BrokerTierBadge tier={reviewItem.requested_tier} />
                </div>
                {reviewItem.contact_info && <p><span className="text-muted-foreground">Contact:</span> {JSON.stringify(reviewItem.contact_info)}</p>}
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground">Admin Note</label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..." />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDecision(reviewItem.id, "approved")} className="flex-1 bg-green-600 hover:bg-green-700 font-mono">
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button onClick={() => handleDecision(reviewItem.id, "rejected")} variant="destructive" className="flex-1 font-mono">
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

export default TierUpgradesAdmin;
