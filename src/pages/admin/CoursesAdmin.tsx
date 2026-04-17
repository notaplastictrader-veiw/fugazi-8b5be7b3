import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Pencil, Trash2, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditAction } from "@/lib/approvalQueue";

interface Course {
  id: string; slug: string; title: string; type: string;
  price: number; original_price: number | null;
  description: string; includes: string[]; note: string;
  is_active: boolean; is_featured: boolean;
  display_order: number; status: string;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const empty = {
  slug: "", title: "", type: "course", price: 0, original_price: null as number | null,
  description: "", includes: [] as string[], note: "",
  is_active: true, is_featured: false, display_order: 0, status: "published",
};

const CoursesAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(empty);
  const [includesText, setIncludesText] = useState("");

  const fetch = async () => {
    const { data } = await supabase.from("courses").select("*").order("display_order");
    if (data) setItems(data as any);
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...empty, display_order: items.length });
    setIncludesText("");
    setModalOpen(true);
  };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      slug: c.slug, title: c.title, type: c.type, price: c.price,
      original_price: c.original_price, description: c.description || "",
      includes: c.includes || [], note: c.note || "",
      is_active: c.is_active, is_featured: c.is_featured,
      display_order: c.display_order || 0, status: c.status,
    });
    setIncludesText((c.includes || []).join("\n"));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      original_price: form.original_price ? Number(form.original_price) : null,
      includes: includesText.split("\n").map(s => s.trim()).filter(Boolean),
      display_order: Number(form.display_order) || 0,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };
    if (editing) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "courses", editing.id, editing as any, payload);
      toast.success("Course updated");
    } else {
      const { data, error } = await supabase.from("courses").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && data) await logAuditAction(user.id, "create", "courses", data.id, null, payload);
      toast.success("Course created");
    }
    setModalOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    fetch();
  };

  const filtered = useMemo(() =>
    items.filter(c => c.title.toLowerCase().includes(search.toLowerCase())),
    [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Courses & Ebooks</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} products · {items.filter(c => c.is_active).length} active
          </p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Course</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(["course", "ebook", "bundle"] as const).map(t => (
          <div key={t} className="glass-card rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{items.filter(c => c.type === t).length}</p>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">{t}s</p>
          </div>
        ))}
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">${items.filter(c => c.is_active).reduce((s, c) => s + c.price, 0)}</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Catalog Value</p>
        </div>
      </div>

      <Input placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">/{c.slug}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{c.type}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-primary" />
                    <span className="font-bold text-sm">{c.price}</span>
                    {c.original_price && <span className="text-[10px] text-muted-foreground line-through ml-1">${c.original_price}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  {c.is_featured ? (
                    <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30">
                      <Sparkles className="w-3 h-3 mr-0.5" /> Best Value
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No courses</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => {
                const t = e.target.value;
                setForm(f => ({ ...f, title: t, slug: f.slug || slugify(t) }));
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price ($)</Label><Input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
              <div><Label>Original Price ($, optional)</Label><Input type="number" value={form.original_price ?? ""} onChange={e => setForm({ ...form, original_price: e.target.value ? +e.target.value : null })} placeholder="For strikethrough" /></div>
            </div>
            <div>
              <Label>Includes (one per line)</Label>
              <Textarea rows={3} value={includesText} onChange={e => setIncludesText(e.target.value)}
                placeholder="PDF workbook&#10;Video links&#10;Quiz at end of each module" />
            </div>
            <div><Label>Note</Label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Instant access after purchase" /></div>
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} />
                <Label>Featured (Best Value)</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesAdmin;
