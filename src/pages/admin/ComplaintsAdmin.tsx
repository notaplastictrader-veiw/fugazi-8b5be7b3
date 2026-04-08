import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface Complaint {
  id: string; content: string; proof_urls: string[]; status: string; created_at: string;
}

const ComplaintsAdmin = () => {
  const [items, setItems] = useState<Complaint[]>([]);
  const fetchData = async () => {
    const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Complaint[]);
  };
  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("complaints").update({ status }).eq("id", id);
    toast.success(`Complaint ${status}`);
    fetchData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Complaints</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Proofs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(c => (
              <TableRow key={c.id}>
                <TableCell className="max-w-[400px] truncate">{c.content}</TableCell>
                <TableCell>{c.proof_urls?.length || 0}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "published")}><Check className="w-4 h-4 text-primary" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No complaints</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ComplaintsAdmin;
