import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Check, X, Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/admin/ImageUpload";

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getFullYear()).slice(-2)}`;
};

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  role: string;
  status: string;
  created_at: string;
  avatar: string;
  broker_id: string | null;
  user_id: string | null;
}

const emptyForm = { author: "", content: "", rating: 5, role: "Trader", status: "pending" as string, avatar: "" };

const ReviewsAdmin = () => {
  const [items, setItems] = useState<Review[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [onlyUserPending, setOnlyUserPending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Review | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Review[]);
  };
  useEffect(() => { fetchData(); }, []);

  const userReviewMap = useMemo(() => {
    const map = new Map<string, Review[]>();
    items.forEach(r => {
      if (!r.user_id) return;
      const arr = map.get(r.user_id) || [];
      arr.push(r);
      map.set(r.user_id, arr);
    });
    // Sort each user's reviews oldest → newest so index = submission order (0 = 1st)
    map.forEach(arr => arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    return map;
  }, [items]);

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const filtered = useMemo(() => {
    let list = filterByDateRange(items, "created_at", fromDate, toDate);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.author?.toLowerCase().includes(q) || r.content?.toLowerCase().includes(q));
    }
    if (onlyUserPending) {
      list = list.filter(r => r.user_id && r.status === "pending");
    }
    return list;
  }, [items, fromDate, toDate, search, onlyUserPending]);

  const handleExport = () => {
    exportToCSV(filtered.map(r => ({
      author: r.author, rating: r.rating, content: r.content, status: r.status,
      date: formatDate(r.created_at),
    })), [
      { key: "author", label: "Author" }, { key: "rating", label: "Rating" },
      { key: "content", label: "Content" }, { key: "status", label: "Status" }, { key: "date", label: "Date" },
    ], "reviews-export");
  };

  const updateStatus = async (id: string, status: "draft" | "pending" | "published" | "rejected") => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    toast.success(`Review ${status}`);
    fetchData();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (r: Review) => {
    setEditingId(r.id);
    setForm({ author: r.author || "", content: r.content || "", rating: r.rating || 5, role: r.role || "Trader", status: r.status, avatar: r.avatar || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.author.trim()) { toast.error("Author is required"); return; }
    if (editingId) {
      const { error } = await supabase.from("reviews").update({
        author: form.author, content: form.content, rating: form.rating, role: form.role, status: form.status as any, avatar: form.avatar,
      }).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Review updated");
    } else {
      const { error } = await supabase.from("reviews").insert({
        author: form.author, content: form.content, rating: form.rating, role: form.role, status: form.status as any, avatar: form.avatar,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Review created");
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("reviews").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Review deleted");
    setDeleteOpen(false);
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Review</Button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by author or content..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
        </div>
        <button
          type="button"
          onClick={() => setOnlyUserPending(v => !v)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            onlyUserPending
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          User submissions (pending)
        </button>
      </div>

      <AdminTableToolbar fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} onExport={handleExport} />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.author}</TableCell>
                <TableCell>{"⭐".repeat(r.rating)}</TableCell>
                <TableCell className="max-w-[250px] truncate">{r.content}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.user_id
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {r.user_id ? "User submitted" : "Admin created"}
                    </span>
                    {r.user_id && (() => {
                      const userReviews = userReviewMap.get(r.user_id) || [];
                      if (userReviews.length <= 1) return null;
                      const idx = userReviews.findIndex(u => u.id === r.id);
                      return (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" title={`This user has submitted ${userReviews.length} reviews`}>
                          ↻ {ordinal(idx + 1)} of {userReviews.length}
                        </span>
                      );
                    })()}
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-sm font-semibold text-foreground">{formatDate(r.created_at)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => { setViewItem(r); setViewOpen(true); }}><Eye className="w-4 h-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "published")}><Check className="w-4 h-4 text-primary" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-4 h-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setDeleteId(r.id); setDeleteOpen(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No reviews</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Review" : "Add Review"}</DialogTitle>
            <DialogDescription>{editingId ? "Update the review details below." : "Create a new review entry."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Author *</Label>
              <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Select value={String(form.rating)} onValueChange={v => setForm(f => ({ ...f, rating: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{"⭐".repeat(n)} ({n})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Trader, Day Trader, Scalper" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="min-h-[100px]" />
            </div>
            <ImageUpload
              value={form.avatar}
              onChange={(url) => setForm(f => ({ ...f, avatar: url }))}
              label="Profile Photo"
              bucket="avatars"
              folder="reviews"
            />
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["draft", "pending", "published", "rejected"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full review content.</DialogDescription>
          </DialogHeader>
          {viewItem && (() => {
            const userReviews = viewItem.user_id ? (userReviewMap.get(viewItem.user_id) || []) : [];
            const previousOnes = userReviews.filter(u => u.id !== viewItem.id);
            const currentIdx = userReviews.findIndex(u => u.id === viewItem.id);
            return (
              <div className="space-y-3 text-sm">
                {viewItem.user_id && userReviews.length > 1 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      ⚠ Repeat submission
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      This user has submitted <strong>{userReviews.length}</strong> reviews. This is their <strong>{ordinal(currentIdx + 1)}</strong>.
                    </div>
                  </div>
                )}
                <div><span className="font-semibold">Author:</span> {viewItem.author}</div>
                <div><span className="font-semibold">Rating:</span> {"⭐".repeat(viewItem.rating)}</div>
                <div><span className="font-semibold">Role:</span> {viewItem.role}</div>
                <div><span className="font-semibold">Status:</span> <StatusBadge status={viewItem.status} /></div>
                <div><span className="font-semibold">Date:</span> {formatDate(viewItem.created_at)}</div>
                <div><span className="font-semibold">Content:</span></div>
                <p className="bg-muted/30 rounded p-3 whitespace-pre-wrap">{viewItem.content}</p>

                {previousOnes.length > 0 && (
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                      Other reviews from this user ({previousOnes.length})
                    </div>
                    <div className="space-y-2">
                      {previousOnes.map((p, i) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setViewItem(p)}
                          className="w-full text-left rounded-md border border-border p-2.5 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground">#{userReviews.findIndex(u => u.id === p.id) + 1}</span>
                              <span className="text-xs">{"⭐".repeat(p.rating)}</span>
                              <StatusBadge status={p.status} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{formatDate(p.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{p.content || "(no content)"}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsAdmin;
