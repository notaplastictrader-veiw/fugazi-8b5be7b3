import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Star, AlertTriangle, TrendingUp, Pencil, Activity } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";

const HudGauge = ({ value, label, icon: Icon }: { value: string | number; label: string; icon: any }) => {
  return (
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
};

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [broker, setBroker] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", avg_spread: "", leverage: "", min_deposit: "" });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: b } = await supabase.from("brokers").select("*").eq("created_by", user.id).limit(1).maybeSingle();
      if (b) {
        setBroker(b);
        setForm({ name: b.name, avg_spread: b.avg_spread || "", leverage: b.leverage || "", min_deposit: b.min_deposit || "" });
        const { data: c } = await supabase.from("complaints").select("*").eq("broker_id", b.id).order("created_at", { ascending: false });
        if (c) setComplaints(c);
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

  if (!broker) return (
    <div className="text-center py-16 text-muted-foreground hud-scanline">
      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="font-mono text-sm">NO BROKER LISTING LINKED TO YOUR ACCOUNT</p>
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
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
            My Broker Dashboard
          </h2>
        </div>
        <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary/60 font-mono text-xs" onClick={() => setEditOpen(true)}>
          <Pencil className="w-3 h-3 mr-1" /> EDIT PROFILE
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <HudGauge key={c.label} value={c.value} label={c.label} icon={c.icon} />
        ))}
      </div>

      <div className="hud-card p-1">
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
    </div>
  );
};

export default BrokerDashboard;
