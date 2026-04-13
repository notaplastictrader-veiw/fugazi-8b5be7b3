import { useState } from "react";
import { courses as initialCourses, type Course } from "@/data/educationArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  title: "", type: "course" as Course["type"], price: 0, originalPrice: "",
  description: "", includes: "", slug: "", isActive: true, isFeatured: false, note: "",
};

const CoursesAdmin = () => {
  const [items, setItems] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      title: c.title, type: c.type, price: c.price,
      originalPrice: c.originalPrice?.toString() || "",
      description: c.description, includes: c.includes,
      slug: c.slug, isActive: c.isActive, isFeatured: c.isFeatured, note: c.note,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    const course: Course = {
      id: editing?.id || `c${Date.now()}`,
      title: form.title, type: form.type, price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      description: form.description, includes: form.includes,
      slug: form.slug, isActive: form.isActive, isFeatured: form.isFeatured, note: form.note,
    };
    if (editing) {
      setItems(prev => prev.map(c => c.id === editing.id ? course : c));
      toast.success("Course updated");
    } else {
      setItems(prev => [course, ...prev]);
      toast.success("Course added");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this course?")) return;
    setItems(prev => prev.filter(c => c.id !== id));
    toast.success("Deleted");
  };

  const toggleActive = (id: string) => {
    setItems(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const filtered = items.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue = items.filter(c => c.isActive).reduce((sum, c) => sum + c.price, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Courses & Ebooks</h2>
          <p className="text-sm text-muted-foreground">{items.length} products · {items.filter(c => c.isActive).length} active</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Course</Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">{items.filter(c => c.type === "course").length}</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Courses</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">{items.filter(c => c.type === "ebook").length}</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Ebooks</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">{items.filter(c => c.type === "bundle").length}</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Bundles</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">${totalRevenue}</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Catalog Value</p>
        </div>
      </div>

      <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Active</TableHead>
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
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] capitalize">{c.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-primary" />
                    <span className="font-bold text-sm">{c.price}</span>
                    {c.originalPrice && (
                      <span className="text-[10px] text-muted-foreground line-through ml-1">${c.originalPrice}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {c.isFeatured ? (
                    <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30">
                      <Sparkles className="w-3 h-3 mr-0.5" /> Best Value
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <Switch checked={c.isActive} onCheckedChange={() => toggleActive(c.id)} />
                </TableCell>
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

      <p className="text-xs text-muted-foreground italic mt-4">
        Currently using local state. Full DB CRUD available once courses table is created.
      </p>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as Course["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price ($)</Label><Input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>Original Price ($, optional)</Label><Input value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="For strikethrough" /></div>
            </div>
            <div><Label>Includes</Label><Input value={form.includes} onChange={e => setForm({ ...form, includes: e.target.value })} placeholder="PDF workbook, video links, quiz" /></div>
            <div><Label>Note</Label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Instant access after purchase" /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={v => setForm({ ...form, isFeatured: v })} />
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
