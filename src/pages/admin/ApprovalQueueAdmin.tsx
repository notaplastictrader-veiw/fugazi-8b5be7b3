import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface QueueItem {
  id: string; content_type: string; content_id: string; status: string;
  reviewer_notes: string; created_at: string;
}

const ApprovalQueueAdmin = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const { user } = useAuth();

  const fetchData = async () => {
    const { data } = await supabase.from("approval_queue").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as QueueItem[]);
  };
  useEffect(() => { fetchData(); }, []);

  const handleAction = async (item: QueueItem, action: "approved" | "rejected") => {
    await supabase.from("approval_queue").update({
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", item.id);

    // Also update the actual content status
    const contentStatus = action === "approved" ? "published" : "rejected";
    await supabase.from(item.content_type as any).update({ status: contentStatus }).eq("id", item.content_id);

    toast.success(`${action}`);
    fetchData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Approval Queue</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(q => (
              <TableRow key={q.id}>
                <TableCell className="font-medium capitalize">{q.content_type}</TableCell>
                <TableCell className={q.status === "pending" ? "text-accent" : q.status === "approved" ? "text-primary" : "text-destructive"}>{q.status}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  {q.status === "pending" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleAction(q, "approved")}><Check className="w-4 h-4 text-primary" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleAction(q, "rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Queue is empty</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ApprovalQueueAdmin;
