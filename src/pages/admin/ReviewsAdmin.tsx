import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getFullYear()).slice(-2)}`;
};

interface Review {
  id: string; author: string; content: string; rating: number; role: string; status: string; created_at: string;
}

const ReviewsAdmin = () => {
  const [items, setItems] = useState<Review[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Review[]);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => filterByDateRange(items, "created_at", fromDate, toDate), [items, fromDate, toDate]);

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
      <AdminTableToolbar fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} onExport={handleExport} />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Content</TableHead>
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
                <TableCell className="max-w-[300px] truncate">{r.content}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-sm font-semibold text-foreground">{formatDate(r.created_at)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "published")}><Check className="w-4 h-4 text-primary" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No reviews</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewsAdmin;
