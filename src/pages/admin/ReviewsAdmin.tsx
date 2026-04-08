import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string; author: string; content: string; rating: number; role: string; status: string;
}

const ReviewsAdmin = () => {
  const [items, setItems] = useState<Review[]>([]);
  const fetchData = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Review[]);
  };
  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: "draft" | "pending" | "published" | "rejected") => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    toast.success(`Review ${status}`);
    fetchData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.author}</TableCell>
                <TableCell>{"⭐".repeat(r.rating)}</TableCell>
                <TableCell className="max-w-[300px] truncate">{r.content}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "published")}><Check className="w-4 h-4 text-primary" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No reviews</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewsAdmin;
