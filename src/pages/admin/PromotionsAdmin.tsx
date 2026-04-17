import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Promotion {
  id: string; title: string; description: string; promo_type: string;
  bonus_amount: string; expiry_date: string | null; link_url: string;
  image_url: string; is_featured: boolean; status: string;
  slug?: string; how_to_claim?: string; terms?: string; category?: string;
}

const empty = {
  title: "", description: "", promo_type: "bonus", bonus_amount: "",
  expiry_date: "", link_url: "", image_url: "", is_featured: false, status: "draft",
  slug: "", how_to_claim: "", terms: "", category: "bonus",
};

const PromotionsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Promotion[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(empty);

  const fetchData = async () => {
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Promotion[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      ...p,
      expiry_date: p.expiry_date || "", link_url: p.link_url || "",
      image_url: p.image_url || "", description: p.description || "",
      bonus_amount: p.bonus_amount || "", slug: p.slug || "",
      how_to_claim: p.how_to_claim || "", terms: p.terms || "",
      category: p.category || p.promo_type || "bonus",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title, description: form.description, promo_type: form.promo_type,
      bonus_amount: form.bonus_amount, link_url: form.link_url, image_url: form.image_url,
      is_featured: form.is_featured,
      expiry_date: form.expiry_date || null,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };
    if (editing) {
      const { error } = await supabase.from("promotions").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "promotions", editing.id, editing, payload);
    } else {
      const { data: created, error } = await supabase.from("promotions").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("promotion", created.id, user.id);
        await logAuditAction(user.id, "create", "promotions", created.id, null, payload);
      }
    }
    toast.success(editing ? "Updated" : "Created");
    setModalOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    toast.success("Deleted"); fetchData();
  };

  const filtered = items.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Promotions</h2>
          <p className="text-sm text-muted-foreground">{items.length} promotions · {items.filter(p => p.is_featured).length} featured</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Promotion</Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {["draft", "pending", "published", "rejected"].map(s => (
          <div key={s} className="glass-card rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{items.filter(p => p.status === s).length}</p>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      <Input placeholder="Search promotions..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    {p.slug && <p className="text-[10px] text-muted-foreground font-mono">/{p.slug}</p>}
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{p.promo_type}</Badge></TableCell>
                <TableCell className="text-xs">{p.bonus_amount || "—"}</TableCell>
                <TableCell>
                  {p.expiry_date ? (
                    <span className={`text-xs font-mono ${isExpired(p.expiry_date) ? "text-destructive" : "text-foreground"}`}>
                      {new Date(p.expiry_date).toLocaleDateString()}
                      {isExpired(p.expiry_date) && " ⏰"}
                    </span>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>{p.is_featured ? "⭐" : "—"}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No promotions</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Promotion" : "Add Promotion"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-from-title" /></div>
            </div>

            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.promo_type} onValueChange={v => setForm({ ...form, promo_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="no_deposit">No Deposit</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="contest">Contest</SelectItem>
                    <SelectItem value="rebate">Rebate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Bonus Amount</Label><Input value={form.bonus_amount} onChange={e => setForm({ ...form, bonus_amount: e.target.value })} placeholder="e.g. 100%" /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="no_deposit">No Deposit</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="rebate">Rebate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></div>
              <div><Label>Link URL</Label><Input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} /></div>
            </div>

            <ImageUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} bucket="media" folder="promotions" maxSizeMB={5} label="Promotion Banner" accept="image/png,image/jpeg,image/webp,image/gif" />

            <div>
              <Label>How to Claim (one step per line)</Label>
              <Textarea value={form.how_to_claim} onChange={e => setForm({ ...form, how_to_claim: e.target.value })} rows={4} placeholder={"1. Register a new account\n2. Deposit minimum $50\n3. Bonus applied automatically"} />
            </div>

            <div>
              <Label>Terms & Conditions (one per line)</Label>
              <Textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} rows={4} placeholder={"Minimum deposit required\n30x wagering requirement\n30-day expiry"} />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} />
                <Label>Featured</Label>
              </div>
              <div className="flex-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">{editing ? "Update Promotion" : "Create Promotion"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsAdmin;
