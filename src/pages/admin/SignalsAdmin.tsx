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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Signal" : "Add Signal"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <ImageUpload value={form.logo_url} onChange={url => setForm({...form, logo_url: url})} bucket="logos" folder="signals" maxSizeMB={2} label="Signal Group Logo" />
            <div><Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description shown on detail page" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Win Rate (%)</Label><Input type="number" value={form.win_rate} onChange={e => setForm({...form, win_rate: +e.target.value})} /></div>
              <div><Label>Monthly Signals</Label><Input value={form.monthly_signals} onChange={e => setForm({...form, monthly_signals: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Avg R:R</Label><Input value={form.avg_rr} onChange={e => setForm({...form, avg_rr: e.target.value})} /></div>
              <div><Label>Track Record</Label><Input value={form.track_record} onChange={e => setForm({...form, track_record: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Members</Label><Input value={form.members} onChange={e => setForm({...form, members: e.target.value})} /></div>
              <div className="flex items-end gap-2">
                <Switch checked={form.verified} onCheckedChange={v => setForm({...form, verified: v})} />
                <Label>Verified</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telegram URL</Label><Input value={form.telegram_url} onChange={e => setForm({...form, telegram_url: e.target.value})} placeholder="https://t.me/..." /></div>
              <div><Label>Discord URL</Label><Input value={form.discord_url} onChange={e => setForm({...form, discord_url: e.target.value})} placeholder="https://discord.gg/..." /></div>
            </div>
            <div><Label>Categories (comma-separated)</Label>
              <Input value={form.categories.join(", ")} onChange={e => setForm({...form, categories: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Forex, Gold, Crypto" />
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Label>Pricing Tiers</Label>
                <Button type="button" size="sm" variant="outline" onClick={addTier}><Plus className="w-3 h-3 mr-1" /> Add Tier</Button>
              </div>
              {form.pricing_tiers.length === 0 && <p className="text-xs text-muted-foreground">No pricing tiers added.</p>}
              <div className="space-y-3">
                {form.pricing_tiers.map((t, i) => (
                  <div key={i} className="border border-border/50 rounded p-2 space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-4" placeholder="Tier name (Free / VIP)" value={t.name} onChange={e => updateTier(i, "name", e.target.value)} />
                      <Input className="col-span-3" placeholder="Price ($49)" value={t.price} onChange={e => updateTier(i, "price", e.target.value)} />
                      <Input className="col-span-4" placeholder="Period (monthly)" value={t.period} onChange={e => updateTier(i, "period", e.target.value)} />
                      <Button type="button" size="sm" variant="ghost" className="col-span-1" onClick={() => removeTier(i)}><X className="w-4 h-4 text-destructive" /></Button>
                    </div>
                    <Textarea rows={2} placeholder="Features (one per line)" value={t.features.join("\n")} onChange={e => updateTier(i, "features", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
                  </div>
                ))}
              </div>
            </div>

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
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignalsAdmin;
