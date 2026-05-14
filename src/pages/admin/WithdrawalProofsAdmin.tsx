import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ExternalLink, Loader2 } from "lucide-react";

interface Proof {
  id: string;
  amount: number | null;
  currency: string | null;
  withdrawal_date: string | null;
  payout_method: string | null;
  payout_time_hours: number | null;
  proof_url: string;
  notes: string | null;
  status: string;
  created_at: string;
  user_id: string;
  broker_id: string;
  brokers?: { name: string; slug: string } | null;
}

const WithdrawalProofsAdmin = () => {
  const [items, setItems] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected">("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("withdrawal_proofs")
      .select("*, brokers(name, slug)")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Proof[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const verify = async (id: string) => {
    const { error } = await supabase.from("withdrawal_proofs").update({
      status: "verified", verified_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Proof verified — now public.");
    load();
  };

  const reject = async (id: string) => {
    const reason = reasons[id]?.trim();
    if (!reason) return toast.error("Add a rejection reason.");
    const { error } = await supabase.from("withdrawal_proofs").update({
      status: "rejected", rejection_reason: reason,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Rejected.");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Withdrawal Proofs</h1>
          <p className="text-sm text-muted-foreground">Verify trader-submitted payout screenshots before they go public.</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "verified", "rejected"] as const).map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
              {s === "pending" && <Clock className="w-3.5 h-3.5 mr-1" />}
              {s === "verified" && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
              {s === "rejected" && <XCircle className="w-3.5 h-3.5 mr-1" />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center text-sm text-muted-foreground">No {filter} proofs.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((p) => (
            <div key={p.id} className="border border-border rounded-lg overflow-hidden bg-card">
              <a href={p.proof_url} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-secondary/40 overflow-hidden relative group">
                <img src={p.proof_url} alt="proof" className="w-full h-full object-contain" />
                <span className="absolute top-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Open
                </span>
              </a>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.brokers?.name || "(unknown broker)"}</span>
                  {p.amount && <span className="font-mono text-sm">{p.currency || "$"}{Number(p.amount).toLocaleString()}</span>}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {p.payout_method && <div>Method: {p.payout_method}</div>}
                  {p.payout_time_hours != null && <div>Payout time: {p.payout_time_hours}h</div>}
                  {p.withdrawal_date && <div>Date: {new Date(p.withdrawal_date).toLocaleDateString()}</div>}
                  <div>Submitted: {new Date(p.created_at).toLocaleString()}</div>
                </div>
                {p.notes && <p className="text-xs text-foreground/80">{p.notes}</p>}

                {filter === "pending" && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => verify(p.id)} className="gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(p.id)} className="gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Rejection reason (required to reject)"
                      value={reasons[p.id] || ""}
                      onChange={(e) => setReasons((r) => ({ ...r, [p.id]: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalProofsAdmin;
