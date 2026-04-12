import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Star, AlertTriangle, TrendingUp, Pencil } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";

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
    <div className="text-center py-16 text-muted-foreground">
      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No broker listing linked to your account yet.</p>
    </div>
  );

  const cards = [
    { label: "Score", value: broker.score || 0, icon: Star },
    { label: "Reviews", value: broker.review_count || 0, icon: TrendingUp },
    { label: "Complaints", value: broker.complaints || 0, icon: AlertTriangle },
    { label: "Status", value: broker.status, icon: Building2 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Broker Dashboard</h2>
        <Button size="sm" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4 mr-1" /> Edit Profile</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <Card key={c.label} className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><c.icon className="w-4 h-4 text-primary" />{c.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{c.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4">Complaints Against You ({complaints.length})</h3>
      <div className="space-y-2">
        {complaints.map((c, i) => (
          <div key={i} className="p-3 bg-card border border-border rounded-lg">
            <p className="text-sm text-foreground">{c.content || "No details"}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${c.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
          </div>
        ))}
        {complaints.length === 0 && <p className="text-sm text-muted-foreground">No complaints filed.</p>}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Broker Profile</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">Changes will be submitted for admin approval.</p>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Avg Spread</Label><Input value={form.avg_spread} onChange={e => setForm({...form, avg_spread: e.target.value})} /></div>
            <div><Label>Leverage</Label><Input value={form.leverage} onChange={e => setForm({...form, leverage: e.target.value})} /></div>
            <div><Label>Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({...form, min_deposit: e.target.value})} /></div>
            <Button onClick={handleEdit} className="w-full">Submit for Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerDashboard;
