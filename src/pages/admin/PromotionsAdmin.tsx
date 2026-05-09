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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Promotion {
  id: string; title: string; description: string; promo_type: string;
  bonus_amount: string; expiry_date: string | null; link_url: string;
  image_url: string; is_featured: boolean; status: string;
  slug?: string | null;
  full_description?: string | null;
  how_to_claim?: string[] | null;
  terms?: string[] | null;
  broker_name?: string | null;
  referral_url?: string | null;
}

// FormState keeps how_to_claim/terms as multiline strings for textarea editing.
interface FormState {
  title: string; description: string; promo_type: string; bonus_amount: string;
  expiry_date: string; link_url: string; image_url: string;
  is_featured: boolean; status: string;
  slug: string; full_description: string; how_to_claim: string; terms: string;
  broker_name: string; referral_url: string;
}

const empty: FormState = {
  title: "", description: "", promo_type: "bonus", bonus_amount: "",
  expiry_date: "", link_url: "", image_url: "", is_featured: false, status: "draft",
  slug: "", full_description: "", how_to_claim: "", terms: "",
  broker_name: "", referral_url: "",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const PromotionsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Promotion[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const fetchData = async () => {
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as unknown as Promotion[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      description: p.description || "",
      promo_type: p.promo_type || "bonus",
      bonus_amount: p.bonus_amount || "",
      expiry_date: p.expiry_date || "",
      link_url: p.link_url || "",
      image_url: p.image_url || "",
      is_featured: !!p.is_featured,
      status: p.status || "draft",
      slug: p.slug || "",
      full_description: p.full_description || "",
      how_to_claim: (p.how_to_claim || []).join("\n"),
      terms: (p.terms || []).join("\n"),
      broker_name: p.broker_name || "",
      referral_url: p.referral_url || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const finalSlug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title,
      description: form.description,
      promo_type: form.promo_type,
      bonus_amount: form.bonus_amount,
      link_url: form.link_url,
      image_url: form.image_url,
      is_featured: form.is_featured,
      expiry_date: form.expiry_date || null,
      status: form.status as "draft" | "pending" | "published" | "rejected",
      slug: finalSlug,
      full_description: form.full_description,
      how_to_claim: form.how_to_claim.split("\n").map(s => s.trim()).filter(Boolean),
      terms: form.terms.split("\n").map(s => s.trim()).filter(Boolean),
      broker_name: form.broker_name,
      referral_url: form.referral_url,
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
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-5">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="offer">Offer</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                  <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-from-title" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Broker / Brand</Label><Input value={form.broker_name} onChange={e => setForm({ ...form, broker_name: e.target.value })} placeholder="e.g. Exness" /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.promo_type} onValueChange={v => setForm({ ...form, promo_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bonus">Deposit Bonus</SelectItem>
                        <SelectItem value="no-deposit">No Deposit</SelectItem>
                        <SelectItem value="cashback">Cashback</SelectItem>
                        <SelectItem value="discount">Challenge Discount</SelectItem>
                        <SelectItem value="spread">Low Spread</SelectItem>
                        <SelectItem value="profit-split">Profit Split</SelectItem>
                        <SelectItem value="low-deposit">Low Deposit / Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Short Description <span className="text-xs text-muted-foreground font-normal">(card teaser)</span></Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                <div><Label>Full Description <span className="text-xs text-muted-foreground font-normal">(detail page)</span></Label><Textarea value={form.full_description} onChange={e => setForm({ ...form, full_description: e.target.value })} rows={6} placeholder="Long-form explanation shown on the promo detail page." /></div>
              </TabsContent>

              <TabsContent value="offer" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Bonus Amount</Label><Input value={form.bonus_amount} onChange={e => setForm({ ...form, bonus_amount: e.target.value })} placeholder="e.g. 100% / $30" /></div>
                  <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></div>
                </div>
                <div>
                  <Label>How to Claim <span className="text-xs text-muted-foreground font-normal">(one step per line)</span></Label>
                  <Textarea value={form.how_to_claim} onChange={e => setForm({ ...form, how_to_claim: e.target.value })} rows={5} placeholder={"Register a new account\nDeposit minimum $50\nBonus applied automatically"} />
                </div>
                <div>
                  <Label>Terms & Conditions <span className="text-xs text-muted-foreground font-normal">(one per line)</span></Label>
                  <Textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} rows={5} placeholder={"Minimum deposit required\n30x wagering requirement\n30-day expiry"} />
                </div>
              </TabsContent>

              <TabsContent value="display" className="space-y-4 mt-0">
                <ImageUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} bucket="media" folder="promotions" maxSizeMB={5} label="Promotion Banner" accept="image/png,image/jpeg,image/webp,image/gif" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Read More Link <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label><Input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." /></div>
                  <div><Label>Claim / Referral URL</Label><Input value={form.referral_url} onChange={e => setForm({ ...form, referral_url: e.target.value })} placeholder="Affiliate link used by Claim button" /></div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4 mt-0">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} />
                  <div>
                    <Label className="cursor-pointer">Featured</Label>
                    <p className="text-xs text-muted-foreground">Highlight this promotion on the homepage</p>
                  </div>
                </div>
                <div>
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
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsAdmin;
