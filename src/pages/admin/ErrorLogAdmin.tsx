import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ErrorEntry {
  id: string;
  message: string;
  stack: string;
  route: string;
  user_agent: string;
  severity: string;
  created_at: string;
  user_id: string | null;
}

const ErrorLogAdmin = () => {
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_error_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setEntries(data as ErrorEntry[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clearOld = async () => {
    if (!confirm("Delete all errors older than 30 days?")) return;
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("client_error_log").delete().lt("created_at", cutoff);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Error Log</h2>
          <p className="text-sm text-muted-foreground mt-1">
            JavaScript errors, unhandled rejections and React error boundary crashes from the browser.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={clearOld}>
            <Trash2 className="w-4 h-4 mr-1" /> Purge &gt;30d
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">When</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-48">Route</TableHead>
              <TableHead className="w-24">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No errors logged. 🎉
                </TableCell>
              </TableRow>
            )}
            {entries.map((e) => (
              <>
                <TableRow
                  key={e.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-xl">{e.message}</TableCell>
                  <TableCell className="text-xs">{e.route || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={e.severity === "error" ? "destructive" : "secondary"}>{e.severity}</Badge>
                  </TableCell>
                </TableRow>
                {expanded === e.id && (
                  <TableRow key={`${e.id}-x`}>
                    <TableCell colSpan={4} className="bg-muted/20">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                        {e.stack || "(no stack)"}
                        {"\n\nUA: "}{e.user_agent}
                      </pre>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ErrorLogAdmin;
