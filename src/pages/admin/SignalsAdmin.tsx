import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface PricingTier { name: string; price: string; period: string; features: string[]; }

interface Signal {
  id: string;
  name: string;
  win_rate: number;
  monthly_signals: string;
  avg_rr: string;
  track_record: string;
  members: string;
  verified: boolean;
  status: string;
  description: string;
  telegram_url: string;
  discord_url: string;
  pricing_tiers: PricingTier[];
  categories: string[];
  logo_url: string;
}

const empty = {
  name: "", win_rate: 0, monthly_signals: "0", avg_rr: "1:1",
  track_record: "", members: "0", verified: false, status: "draft",
  description: "", telegram_url: "", discord_url: "",
  pricing_tiers: [] as PricingTier[],
  categories: [] as string[],
  logo_url: "",
};

const SignalsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Signal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Signal | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const fetch = async () => {
    const { data } = await supabase.from("signal_groups").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as any);
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s: Signal) => {
    setEditing(s);
    setForm({
      ...empty,
      ...s,
      description: s.description || "",
      telegram_url: s.telegram_url || "",
      discord_url: s.discord_url || "",
      pricing_tiers: Array.isArray(s.pricing_tiers) ? s.pricing_tiers : [],
      categories: s.categories || [],
      logo_url: s.logo_url || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload: any = {
      ...form,
      win_rate: Number(form.win_rate),
      pricing_tiers: form.pricing_tiers,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };
    if (editing) {
      const { error } = await supabase.from("signal_groups").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "signal_groups", editing.id, editing, payload);
      toast.success("Updated");
    } else {
      const { data: created, error } = await supabase.from("signal_groups").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("signal_group", created.id, user.id);
        await logAuditAction(user.id, "create", "signal_groups", created.id, null, payload);
      }
      toast.success("Created");
    }
    setModalOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("signal_groups").delete().eq("id", id);
    toast.success("Deleted"); fetch();
  };

  // Pricing tier editor helpers
  const addTier = () => setForm({ ...form, pricing_tiers: [...form.pricing_tiers, { name: "", price: "", period: "monthly", features: [] }] });
  const updateTier = (i: number, field: keyof PricingTier, value: any) => {
    const updated = [...form.pricing_tiers];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, pricing_tiers: updated });
  };
  const removeTier = (i: number) => setForm({ ...form, pricing_tiers: form.pricing_tiers.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Signal Groups</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Signal</Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.win_rate}%</TableCell>
                <TableCell>{s.members}</TableCell>
                <TableCell>{s.verified ? "✅" : "❌"}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No signal groups</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Signal" : "Add Signal"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-5">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 mt-0">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <ImageUpload value={form.logo_url} onChange={url => setForm({...form, logo_url: url})} bucket="logos" folder="signals" maxSizeMB={2} label="Signal Group Logo" />
                <div><Label>Description</Label>
                  <Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description shown on detail page" />
                </div>
                <div><Label>Categories <span className="text-xs text-muted-foreground font-normal">(comma-separated)</span></Label>
                  <Input value={form.categories.join(", ")} onChange={e => setForm({...form, categories: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Forex, Gold, Crypto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Telegram URL</Label><Input value={form.telegram_url} onChange={e => setForm({...form, telegram_url: e.target.value})} placeholder="https://t.me/..." /></div>
                  <div><Label>Discord URL</Label><Input value={form.discord_url} onChange={e => setForm({...form, discord_url: e.target.value})} placeholder="https://discord.gg/..." /></div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Win Rate (%)</Label><Input type="number" value={form.win_rate} onChange={e => setForm({...form, win_rate: +e.target.value})} /></div>
                  <div><Label>Monthly Signals</Label><Input value={form.monthly_signals} onChange={e => setForm({...form, monthly_signals: e.target.value})} /></div>
                  <div><Label>Avg R:R</Label><Input value={form.avg_rr} onChange={e => setForm({...form, avg_rr: e.target.value})} /></div>
                  <div><Label>Track Record</Label><Input value={form.track_record} onChange={e => setForm({...form, track_record: e.target.value})} /></div>
                  <div><Label>Members</Label><Input value={form.members} onChange={e => setForm({...form, members: e.target.value})} /></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Switch checked={form.verified} onCheckedChange={v => setForm({...form, verified: v})} />
                  <div>
                    <Label className="cursor-pointer">Verified</Label>
                    <p className="text-xs text-muted-foreground">Show verified badge on listings</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Pricing Tiers</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addTier}><Plus className="w-3 h-3 mr-1" /> Add Tier</Button>
                </div>
                {form.pricing_tiers.length === 0 && (
                  <div className="border border-dashed border-border rounded-lg min-h-[80px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No pricing tiers yet. Click "Add Tier" above.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {form.pricing_tiers.map((t, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">#{i + 1} Tier</span>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeTier(i)}><X className="w-4 h-4 text-destructive" /></Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><Label className="text-xs">Name</Label><Input placeholder="Free / VIP" value={t.name} onChange={e => updateTier(i, "name", e.target.value)} /></div>
                        <div><Label className="text-xs">Price</Label><Input placeholder="$49" value={t.price} onChange={e => updateTier(i, "price", e.target.value)} /></div>
                        <div><Label className="text-xs">Period</Label><Input placeholder="monthly" value={t.period} onChange={e => updateTier(i, "period", e.target.value)} /></div>
                      </div>
                      <div>
                        <Label className="text-xs">Features <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                        <Textarea rows={3} value={t.features.join("\n")} onChange={e => updateTier(i, "features", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4 mt-0">
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignalsAdmin;
