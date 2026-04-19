import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Placement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  internal_price_note: string;
  display_order: number;
  is_active: boolean;
}

interface FormState {
  slug: string; title: string; description: string; icon: string;
  internal_price_note: string; display_order: number; is_active: boolean;
}

const empty: FormState = {
  slug: "", title: "", description: "", icon: "Megaphone",
  internal_price_note: "", display_order: 0, is_active: true,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const AdvertisePlacementsAdmin = () => {
  const [items, setItems] = useState<Placement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Placement | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const fetchData = async () => {
    const { data } = await supabase
      .from("ad_placements").select("*").order("display_order", { ascending: true });
    if (data) setItems(data as Placement[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Placement) => {
    setEditing(p);
    setForm({
      slug: p.slug, title: p.title, description: p.description || "",
      icon: p.icon || "Megaphone", internal_price_note: p.internal_price_note || "",
      display_order: p.display_order || 0, is_active: !!p.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
    };
    if (editing) {
      const { error } = await supabase.from("ad_placements").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Placement updated");
    } else {
      const { error } = await supabase.from("ad_placements").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Placement created");
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this placement?")) return;
    const { error } = await supabase.from("ad_placements").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Advertise Placements</h1>
          <p className="text-sm text-muted-foreground">Manage placement options shown on /advertise</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Placement</Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Internal Price Note</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.display_order}</TableCell>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.slug}</TableCell>
                <TableCell className="font-mono text-xs">{p.icon}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">
                  {p.internal_price_note || <span className="italic">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No placements yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Placement" : "New Placement"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Slug (auto-generated if empty)</Label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="homepage-banner" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon (lucide name)</Label>
                <Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Eye, BarChart3, Users…" />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Internal Price Note (admin only)</Label>
              <Input
                value={form.internal_price_note}
                onChange={e => setForm({ ...form, internal_price_note: e.target.value })}
                placeholder="e.g. From $1,500/mo (not shown publicly)"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active (visible on /advertise)</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertisePlacementsAdmin;
