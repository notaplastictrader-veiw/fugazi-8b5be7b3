import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: "bg-primary/20 text-primary",
  update: "bg-accent/20 text-accent-foreground",
  delete: "bg-destructive/20 text-destructive",
  approve: "bg-primary/20 text-primary",
  reject: "bg-destructive/20 text-destructive",
};

const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    supabase
      .from("audit_log")
      .select("id, user_id, action, table_name, record_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setEntries(data);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Audit Log</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Badge variant="outline" className={actionColors[e.action] || ""}>
                    {e.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{e.table_name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {e.record_id?.slice(0, 8) || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No audit entries yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditLog;
