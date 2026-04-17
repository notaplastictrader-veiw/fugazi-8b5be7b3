import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Pencil, Trash2, Star, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditAction } from "@/lib/approvalQueue";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Site {
  id: string; slug: string; name: string; logo: string; rating: number;
  bonus: string; sports: string[]; features: string[];
  min_deposit: string; withdrawal_speed: string; license: string;
  url: string; warning: string; display_order: number; status: string;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const empty = {
  slug: "", name: "", logo: "🟢", rating: 8, bonus: "",
  sports: [] as string[], features: [] as string[],
  min_deposit: "$10", withdrawal_speed: "", license: "",
  url: "", warning: "", display_order: 0, status: "published",
};

const BettingSitesAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Site[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [form, setForm] = useState(empty);
  const [sportsText, setSportsText] = useState("");
  const [featuresText, setFeaturesText] = useState("");

  const fetch = async () => {
    const { data } = await supabase.from("betting_sites").select("*").order("display_order");
    if (data) setItems(data as any);
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...empty, display_order: items.length });
    setSportsText(""); setFeaturesText("");
    setModalOpen(true);
  };
  const openEdit = (s: Site) => {
    setEditing(s);
    setForm({
      slug: s.slug, name: s.name, logo: s.logo, rating: s.rating,
      bonus: s.bonus || "", sports: s.sports || [], features: s.features || [],
      min_deposit: s.min_deposit || "$10", withdrawal_speed: s.withdrawal_speed || "",
      license: s.license || "", url: s.url || "", warning: s.warning || "",
      display_order: s.display_order || 0, status: s.status,
    });
    setSportsText((s.sports || []).join(", "));
    setFeaturesText((s.features || []).join(", "));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Name and slug required"); return; }
    const payload = {
      ...form,
      rating: Number(form.rating) || 0,
      sports: sportsText.split(",").map(s => s.trim()).filter(Boolean),
      features: featuresText.split(",").map(s => s.trim()).filter(Boolean),
      display_order: Number(form.display_order) || 0,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };
    if (editing) {
      const { error } = await supabase.from("betting_sites").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "betting_sites", editing.id, editing as any, payload);
      toast.success("Site updated");
    } else {
      const { data, error } = await supabase.from("betting_sites").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && data) await logAuditAction(user.id, "create", "betting_sites", data.id, null, payload);
      toast.success("Site created");
    }
    setModalOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this betting site?")) return;
    const { error } = await supabase.from("betting_sites").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    fetch();
  };

  const filtered = useMemo(() =>
    items.filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Betting Sites</h1>
          <p className="text-sm text-muted-foreground">{items.length} sites listed</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Site</Button>
      </div>

      <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Warning</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.logo}</span>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">/{s.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="font-bold text-sm">{s.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs">
                    <Shield className="w-3 h-3" /> {s.license}
                  </div>
                </TableCell>
                <TableCell className="text-xs max-w-[150px] truncate">{s.bonus}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>
                  {s.warning ? (
                    <Badge variant="destructive" className="text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Warning
                    </Badge>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No betting sites</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Betting Site" : "Add Betting Site"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={e => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, name: v, slug: f.slug || slugify(v) }));
                }} />
              </div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rating (0-10)</Label><Input type="number" min={0} max={10} step={0.1} value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })} /></div>
              <div></div>
            </div>
            <ImageUpload value={form.logo} onChange={url => setForm({ ...form, logo: url })} bucket="logos" folder="betting" maxSizeMB={2} label="Site Logo (image or emoji URL)" />
            <div><Label>Welcome Bonus</Label><Input value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} placeholder="Up to $30 in Bet Credits" /></div>
            <div><Label>License</Label><Input value={form.license} onChange={e => setForm({ ...form, license: e.target.value })} placeholder="UK Gambling Commission" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({ ...form, min_deposit: e.target.value })} /></div>
              <div><Label>Withdrawal Speed</Label><Input value={form.withdrawal_speed} onChange={e => setForm({ ...form, withdrawal_speed: e.target.value })} /></div>
            </div>
            <div><Label>Sports (comma-separated)</Label><Input value={sportsText} onChange={e => setSportsText(e.target.value)} placeholder="football, cricket, basketball" /></div>
            <div><Label>Features (comma-separated)</Label><Input value={featuresText} onChange={e => setFeaturesText(e.target.value)} placeholder="Live Streaming, Cash Out, Bet Builder" /></div>
            <div><Label>URL</Label><Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /></div>
            <div><Label>Warning (optional)</Label><Textarea rows={2} value={form.warning} onChange={e => setForm({ ...form, warning: e.target.value })} placeholder="Risk warning…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value })} /></div>
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
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BettingSitesAdmin;
