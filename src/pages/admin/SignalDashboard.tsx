import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Radio, TrendingUp, Users, CheckCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";

const SignalDashboard = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", members: "", monthly_signals: "", avg_rr: "", track_record: "" });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase.from("signal_groups").select("*").eq("created_by", user.id).limit(1).maybeSingle();
      if (data) {
        setGroup(data);
        setForm({ name: data.name, members: data.members || "0", monthly_signals: data.monthly_signals || "0", avg_rr: data.avg_rr || "1:1", track_record: data.track_record || "" });
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

  if (!group) return (
    <div className="text-center py-16 text-muted-foreground">
      <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No signal group linked to your account yet.</p>
    </div>
  );

  const cards = [
    { label: "Win Rate", value: `${group.win_rate || 0}%`, icon: TrendingUp },
    { label: "Members", value: group.members || "0", icon: Users },
    { label: "Verified", value: group.verified ? "Yes" : "No", icon: CheckCircle },
    { label: "Status", value: group.status, icon: Radio },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Signal Dashboard</h2>
        <Button size="sm" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4 mr-1" /> Edit Group</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <Card key={c.label} className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><c.icon className="w-4 h-4 text-primary" />{c.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{c.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Signal Group</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">Changes will be submitted for admin approval.</p>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Members</Label><Input value={form.members} onChange={e => setForm({...form, members: e.target.value})} /></div>
            <div><Label>Monthly Signals</Label><Input value={form.monthly_signals} onChange={e => setForm({...form, monthly_signals: e.target.value})} /></div>
            <div><Label>Avg R:R</Label><Input value={form.avg_rr} onChange={e => setForm({...form, avg_rr: e.target.value})} /></div>
            <div><Label>Track Record</Label><Input value={form.track_record} onChange={e => setForm({...form, track_record: e.target.value})} /></div>
            <Button onClick={handleEdit} className="w-full">Submit for Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignalDashboard;
