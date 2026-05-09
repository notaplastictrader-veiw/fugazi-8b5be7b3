import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Pencil, Trash2, BookOpen, Lock, Unlock, ChevronUp, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditAction } from "@/lib/approvalQueue";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Section { id: string; title: string; content: string }
interface Article {
  id: string; slug: string; title: string; track: string; read_time: number;
  is_locked: boolean; course_id: string | null; sections: Section[];
  key_takeaway: string; display_order: number; status: string;
  hero_image_url: string;
}
interface Course { id: string; title: string; slug: string }

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const newSection = (): Section => ({ id: `s${Date.now()}`, title: "", content: "" });

const empty: Omit<Article, "id"> = {
  slug: "", title: "", track: "beginner", read_time: 5, is_locked: false,
  course_id: null, sections: [newSection()], key_takeaway: "",
  display_order: 0, status: "published",
  hero_image_url: "",
};

const EducationAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trackFilter, setTrackFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<Omit<Article, "id">>(empty);

  const fetchAll = async () => {
    const [{ data: arts }, { data: cs }] = await Promise.all([
      supabase.from("education_articles").select("*").order("display_order"),
      supabase.from("courses").select("id,title,slug").order("title"),
    ]);
    if (arts) setItems(arts as any);
    if (cs) setCourses(cs as any);
  };
  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...empty, sections: [newSection()], display_order: items.length });
    setModalOpen(true);
  };
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      slug: a.slug, title: a.title, track: a.track, read_time: a.read_time,
      is_locked: a.is_locked, course_id: a.course_id,
      sections: Array.isArray(a.sections) && a.sections.length ? a.sections : [newSection()],
      key_takeaway: a.key_takeaway || "", display_order: a.display_order || 0,
      status: a.status,
      hero_image_url: (a as any).hero_image_url || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    if (!form.sections.length || !form.sections[0].title) { toast.error("At least one section with title required"); return; }
    const payload = {
      ...form,
      read_time: Number(form.read_time) || 5,
      display_order: Number(form.display_order) || 0,
      sections: form.sections as any,
      status: form.status as "draft" | "pending" | "published" | "rejected",
      course_id: form.course_id || null,
    };
    if (editing) {
      const { error } = await supabase.from("education_articles").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "education_articles", editing.id, editing as any, payload);
      toast.success("Article updated");
    } else {
      const { data, error } = await supabase.from("education_articles").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && data) await logAuditAction(user.id, "create", "education_articles", data.id, null, payload);
      toast.success("Article created");
    }
    setModalOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("education_articles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    fetchAll();
  };

  // Section editing helpers
  const updateSection = (idx: number, patch: Partial<Section>) => {
    setForm(f => ({ ...f, sections: f.sections.map((s, i) => i === idx ? { ...s, ...patch } : s) }));
  };
  const addSection = () => setForm(f => ({ ...f, sections: [...f.sections, newSection()] }));
  const removeSection = (idx: number) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== idx) }));
  const moveSection = (idx: number, dir: -1 | 1) => {
    setForm(f => {
      const arr = [...f.sections];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...f, sections: arr };
    });
  };

  const filtered = useMemo(() => {
    let r = items;
    if (trackFilter !== "all") r = r.filter(a => a.track === trackFilter);
    if (search) r = r.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [items, trackFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Education Articles</h1>
          <p className="text-sm text-muted-foreground">{items.length} articles · 3 tracks</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Article</Button>
      </div>

      <div className="flex items-center gap-3">
        <Tabs value={trackFilter} onValueChange={setTrackFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Read</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />{a.title}
                </TableCell>
                <TableCell className="capitalize">{a.track}</TableCell>
                <TableCell>{a.read_time} min</TableCell>
                <TableCell>{Array.isArray(a.sections) ? a.sections.length : 0}</TableCell>
                <TableCell>
                  {a.is_locked
                    ? <span className="text-[10px] flex items-center gap-1"><Lock className="w-3 h-3" />Locked</span>
                    : <span className="text-[10px] flex items-center gap-1 text-primary"><Unlock className="w-3 h-3" />Free</span>}
                </TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No articles</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Article" : "Add Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => {
                  const t = e.target.value;
                  setForm(f => ({ ...f, title: t, slug: f.slug || slugify(t) }));
                }} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Track</Label>
                <Select value={form.track} onValueChange={v => setForm({ ...form, track: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Read Time (min)</Label>
                <Input type="number" min={1} value={form.read_time}
                  onChange={e => setForm({ ...form, read_time: +e.target.value })} />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order}
                  onChange={e => setForm({ ...form, display_order: +e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_locked} onCheckedChange={v => setForm({ ...form, is_locked: v })} />
                <Label>Locked (premium)</Label>
              </div>
              <div>
                <Label>Linked Course (optional)</Label>
                <Select value={form.course_id || "none"} onValueChange={v => setForm({ ...form, course_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Key Takeaway</Label>
              <Textarea rows={2} value={form.key_takeaway}
                onChange={e => setForm({ ...form, key_takeaway: e.target.value })} />
            </div>

            <ImageUpload value={form.hero_image_url} onChange={url => setForm({ ...form, hero_image_url: url })} bucket="media" folder="education" maxSizeMB={5} label="Hero Image" accept="image/png,image/jpeg,image/webp" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Sections ({form.sections.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="w-3 h-3 mr-1" /> Add Section
                </Button>
              </div>
              <div className="space-y-3">
                {form.sections.map((s, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-3 bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">#{idx + 1}</span>
                      <Input placeholder="Section title" value={s.title}
                        onChange={e => updateSection(idx, { title: e.target.value })} className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => moveSection(idx, 1)} disabled={idx === form.sections.length - 1}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(idx)} disabled={form.sections.length === 1}>
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                    <Textarea rows={5} placeholder="Section content (HTML allowed: <p>, <ul>, <li>, <strong>, <em>)"
                      value={s.content} onChange={e => updateSection(idx, { content: e.target.value })}
                      className="font-mono text-xs" />
                  </div>
                ))}
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

            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducationAdmin;
