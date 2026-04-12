import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface QueueItem {
  id: string;
  content_type: string;
  content_id: string;
  status: string;
  reviewer_notes: string;
  created_at: string;
  submitted_by: string | null;
}

const CONTENT_TYPES = ["all", "brokers", "signal_groups", "news_articles", "forecasts", "promotions", "scam_alerts"];

const ApprovalQueueAdmin = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [tab, setTab] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    let query = supabase.from("approval_queue").select("*").order("created_at", { ascending: false });
    if (tab !== "all") query = query.eq("content_type", tab);
    const { data } = await query;
    if (data) setItems(data as QueueItem[]);
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleAction = async (item: QueueItem, action: "approved" | "rejected") => {
    const reviewerNotes = notes[item.id] || "";
    await supabase.from("approval_queue").update({
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes,
    }).eq("id", item.id);

    const contentStatus = action === "approved" ? "published" : "rejected";
    await supabase.from(item.content_type as any).update({ status: contentStatus }).eq("id", item.content_id);

    // Log to audit
    await supabase.from("audit_log").insert({
      user_id: user!.id,
      action: action === "approved" ? "approve" : "reject",
      table_name: item.content_type,
      record_id: item.content_id,
      new_data: { reviewer_notes: reviewerNotes },
    });

    toast.success(`Content ${action}`);
    setNotes((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
    fetchData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Approval Queue</h2>
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          {CONTENT_TYPES.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t === "all" ? "All" : t.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((q) => (
              <>
                <TableRow key={q.id}>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                      {expanded === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium capitalize">{q.content_type.replace("_", " ")}</TableCell>
                  <TableCell className={q.status === "pending" ? "text-accent" : q.status === "approved" ? "text-primary" : "text-destructive"}>
                    {q.status}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {q.status === "pending" && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleAction(q, "approved")}>
                          <Check className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAction(q, "rejected")}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
                {expanded === q.id && (
                  <TableRow key={`${q.id}-exp`}>
                    <TableCell colSpan={5} className="bg-muted/30 p-4">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Content ID: <span className="font-mono">{q.content_id}</span></p>
                        {q.reviewer_notes && <p className="text-sm"><strong>Notes:</strong> {q.reviewer_notes}</p>}
                        {q.status === "pending" && (
                          <Textarea
                            placeholder="Add reviewer notes before approving/rejecting..."
                            value={notes[q.id] || ""}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="max-w-md"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Queue is empty</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ApprovalQueueAdmin;
