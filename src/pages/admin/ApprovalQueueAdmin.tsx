import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, ArrowUpCircle, Clock, MessageSquare, Filter, Info } from "lucide-react";
import { toast } from "sonner";

const priorityConfig: Record<number, { label: string; color: string; sla: string }> = {
  1: { label: "P1 URGENT", color: "bg-red-500/10 text-red-400 border-red-500/30", sla: "2h" },
  2: { label: "P2 HIGH", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", sla: "24h" },
  3: { label: "P3 NORMAL", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", sla: "48h" },
  4: { label: "P4 LOW", color: "bg-muted text-muted-foreground border-border", sla: "—" },
};

const REJECT_REASONS = [
  "Insufficient evidence", "Duplicate submission", "Violates guidelines",
  "Spam or irrelevant", "Needs more information", "Other",
];

const CONTENT_TYPES = ["all", "brokers", "signal_groups", "news_articles", "forecasts", "promotions", "scam_alerts", "reviews", "complaints"];

interface QueueItem {
  id: string;
  content_type: string;
  content_id: string;
  status: string;
  priority: number | null;
  created_at: string;
  submitted_by: string | null;
  reviewer_notes: string;
  reviewed_at: string | null;
  escalated_by: string | null;
  escalated_at: string | null;
  rejection_reason: string | null;
}

const getTimeInQueue = (created: string) => {
  const ms = Date.now() - new Date(created).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return "< 1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

const isOverdue = (created: string, priority: number | null) => {
  const ms = Date.now() - new Date(created).getTime();
  const hours = ms / (1000 * 60 * 60);
  if (priority === 1) return hours > 2;
  if (priority === 2) return hours > 24;
  return hours > 48;
};

const ApprovalQueueAdmin = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [rejectItem, setRejectItem] = useState<QueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [infoItem, setInfoItem] = useState<QueueItem | null>(null);
  const [infoMessage, setInfoMessage] = useState("");
  const { user } = useAuth();

  const fetchData = async () => {
    let query = supabase.from("approval_queue").select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });
    if (tab !== "all") query = query.eq("content_type", tab);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (priorityFilter !== "all") query = query.eq("priority", parseInt(priorityFilter));
    const { data } = await query;
    if (data) setItems(data as QueueItem[]);
  };

  useEffect(() => { fetchData(); }, [tab, statusFilter, priorityFilter]);

  const handleApprove = async (item: QueueItem) => {
    if (!user) return;
    await supabase.from("approval_queue").update({
      status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString(),
    }).eq("id", item.id);
    await (supabase.from(item.content_type as any) as any).update({ status: "published" }).eq("id", item.content_id);
    await supabase.from("audit_log").insert({
      user_id: user.id, action: "approve", table_name: item.content_type, record_id: item.content_id,
    });
    toast.success("Approved!");
    fetchData();
  };

  const handleReject = async () => {
    if (!user || !rejectItem) return;
    await supabase.from("approval_queue").update({
      status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString(),
      rejection_reason: rejectReason, reviewer_notes: rejectNotes,
    }).eq("id", rejectItem.id);
    await (supabase.from(rejectItem.content_type as any) as any).update({ status: "rejected" }).eq("id", rejectItem.content_id);
    await supabase.from("audit_log").insert({
      user_id: user.id, action: "reject", table_name: rejectItem.content_type, record_id: rejectItem.content_id,
      new_data: { rejection_reason: rejectReason, notes: rejectNotes },
    });
    toast.success("Rejected");
    setRejectItem(null); setRejectReason(""); setRejectNotes("");
    fetchData();
  };

  const handleEscalate = async (item: QueueItem) => {
    if (!user) return;
    await supabase.from("approval_queue").update({
      escalated_by: user.id, escalated_at: new Date().toISOString(), priority: 1,
    }).eq("id", item.id);
    toast.success("Escalated to P1");
    fetchData();
  };

  const handleRequestInfo = async () => {
    if (!user || !infoItem) return;
    await supabase.from("approval_queue").update({
      reviewer_notes: `[INFO REQUESTED] ${infoMessage}`,
    }).eq("id", infoItem.id);
    // Optionally notify submitter
    if (infoItem.submitted_by) {
      await supabase.from("notifications").insert({
        user_id: infoItem.submitted_by,
        title: "More info requested",
        message: infoMessage,
        type: "info",
        link: `/dashboard`,
      });
    }
    toast.success("Info requested");
    setInfoItem(null); setInfoMessage("");
    fetchData();
  };

  const pendingCount = items.filter(i => i.status === "pending").length;
  const overdueCount = items.filter(i => i.status === "pending" && isOverdue(i.created_at, i.priority)).length;

  return (
    <div className="hud-scanline">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="hud-badge">QUEUE</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Approval Queue</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-primary">{pendingCount} pending</span>
          {overdueCount > 0 && <span className="text-xs font-mono text-red-400">⚠ {overdueCount} overdue</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-8">
            {CONTENT_TYPES.map(t => (
              <TabsTrigger key={t} value={t} className="capitalize text-xs h-7 px-2">
                {t === "all" ? "All" : t.replace("_", " ")}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 ml-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="1">P1 Urgent</SelectItem>
              <SelectItem value="2">P2 High</SelectItem>
              <SelectItem value="3">P3 Normal</SelectItem>
              <SelectItem value="4">P4 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-2">
        {items.map(item => {
          const p = priorityConfig[item.priority || 3];
          const overdue = item.status === "pending" && isOverdue(item.created_at, item.priority);
          const timeStr = getTimeInQueue(item.created_at);

          return (
            <div key={item.id} className={`rounded-lg border p-4 bg-card/50 transition-all ${overdue ? "border-red-500/40 shadow-[0_0_8px_-3px_rgba(239,68,68,0.3)]" : "border-border/50"}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                  {/* Priority badge */}
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono uppercase shrink-0 ${p.color}`}>
                    {p.label}
                  </span>
                  {/* Type */}
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-muted border border-border shrink-0">
                    {item.content_type.replace("_", " ")}
                  </span>
                  {/* Time */}
                  <span className={`text-[10px] font-mono flex items-center gap-1 shrink-0 ${overdue ? "text-red-400" : "text-muted-foreground"}`}>
                    <Clock className="w-3 h-3" /> {timeStr}
                  </span>
                  {/* Escalated */}
                  {item.escalated_by && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-mono shrink-0">ESCALATED</span>
                  )}
                  {/* Status for non-pending */}
                  {item.status !== "pending" && (
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                      item.status === "approved" ? "bg-primary/10 text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}>{item.status}</span>
                  )}
                  {/* Rejection reason */}
                  {item.rejection_reason && (
                    <span className="text-[10px] text-muted-foreground font-mono">— {item.rejection_reason}</span>
                  )}
                </div>

                {/* Actions */}
                {item.status === "pending" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary hover:bg-primary/10" onClick={() => handleApprove(item)} title="Approve">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => { setRejectItem(item); setRejectReason(""); setRejectNotes(""); }} title="Reject">
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-orange-400 hover:bg-orange-500/10" onClick={() => handleEscalate(item)} title="Escalate">
                      <ArrowUpCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-400 hover:bg-blue-500/10" onClick={() => { setInfoItem(item); setInfoMessage(""); }} title="Request Info">
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              {item.reviewer_notes && (
                <p className="text-[10px] text-muted-foreground font-mono mt-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {item.reviewer_notes}
                </p>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-mono">Queue is empty</div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectItem} onOpenChange={() => setRejectItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Reject Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted-foreground mb-1 block">Reason</label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  {REJECT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground mb-1 block">Notes</label>
              <Textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Optional..." />
            </div>
            <Button onClick={handleReject} variant="destructive" className="w-full font-mono" disabled={!rejectReason}>
              <X className="w-4 h-4 mr-1" /> Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={!!infoItem} onOpenChange={() => setInfoItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Request More Info</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted-foreground mb-1 block">Message to submitter</label>
              <Textarea value={infoMessage} onChange={e => setInfoMessage(e.target.value)} placeholder="What information do you need?" />
            </div>
            <Button onClick={handleRequestInfo} className="w-full font-mono" disabled={!infoMessage}>
              <Info className="w-4 h-4 mr-1" /> Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalQueueAdmin;
