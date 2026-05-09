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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface NewsArticle {
  id: string; title: string; slug: string; excerpt: string; content: string;
  category: string; author: string; source_url: string; image_url: string; status: string;
}

const empty = {
  title: "", slug: "", excerpt: "", content: "", category: "market",
  author: "NAFT Editorial", source_url: "", image_url: "", status: "draft",
};

const NewsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState(empty);

  const fetchData = async () => {
    const { data } = await supabase.from("news_articles").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as NewsArticle[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (a: NewsArticle) => {
    setEditing(a);
    setForm({ ...a, excerpt: a.excerpt || "", content: a.content || "", source_url: a.source_url || "", image_url: a.image_url || "", author: a.author || "NAFT Editorial" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form, status: form.status as "draft" | "pending" | "published" | "rejected" };
    if (editing) {
      const { error } = await supabase.from("news_articles").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "news_articles", editing.id, editing, payload);
    } else {
      const { data: created, error } = await supabase.from("news_articles").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("news_article", created.id, user.id);
        await logAuditAction(user.id, "create", "news_articles", created.id, null, payload);
      }
    }
    toast.success(editing ? "Updated" : "Created");
    setModalOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("news_articles").delete().eq("id", id);
    toast.success("Deleted"); fetchData();
  };

  const filtered = items.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">News Articles</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Article</Button>
      </div>
      <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell>
                <TableCell className="capitalize">{a.category}</TableCell>
                <TableCell>{a.author}</TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No articles</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Article" : "Add Article"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="url-friendly-slug" /></div>
            <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} /></div>
            <div><Label>Content</Label><Textarea rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Author</Label><Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} /></div>
            </div>
            <div><Label>Source URL</Label><Input value={form.source_url} onChange={e => setForm({...form, source_url: e.target.value})} /></div>
            <ImageUpload value={form.image_url} onChange={url => setForm({...form, image_url: url})} bucket="media" folder="news" maxSizeMB={5} label="Article Image" accept="image/png,image/jpeg,image/webp,image/gif" />
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem><SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
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

export default NewsAdmin;
