import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, CheckCircle, XCircle, AlertTriangle, ArrowUpCircle,
  Clock, MessageSquare, Activity, BarChart3
} from "lucide-react";
import { toast } from "sonner";

const BLUE = "hsl(210, 100%, 50%)";

const priorityConfig: Record<number, { label: string; color: string; sla: string }> = {
  1: { label: "P1 URGENT", color: "bg-red-500/10 text-red-400 border-red-500/30", sla: "2h" },
  2: { label: "P2 HIGH", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", sla: "24h" },
  3: { label: "P3 NORMAL", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", sla: "48h" },
  4: { label: "P4 LOW", color: "bg-muted text-muted-foreground border-border", sla: "—" },
};

const REJECT_REASONS = [
  "Insufficient evidence",
  "Duplicate submission",
  "Violates guidelines",
  "Spam or irrelevant",
  "Needs more information",
  "Other",
];

interface QueueItem {
  id: string;
  content_type: string;
  content_id: string;
  status: string;
  priority: number | null;
  created_at: string;
  submitted_by: string | null;
  reviewer_notes: string;
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

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectItem, setRejectItem] = useState<QueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  // Stats
  const [todayApproved, setTodayApproved] = useState(0);
  const [weekApproved, setWeekApproved] = useState(0);
  const [escalatedCount, setEscalatedCount] = useState(0);

  const fetchQueue = async () => {
    setLoading(true);
    const { data } = await supabase.from("approval_queue").select("*")
      .eq("status", "pending")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });
    setQueue((data as QueueItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();

    // Fetch sidebar stats
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

    Promise.all([
      supabase.from("approval_queue").select("id", { count: "exact", head: true })
        .eq("status", "approved").gte("reviewed_at", today.toISOString()),
      supabase.from("approval_queue").select("id", { count: "exact", head: true })
        .eq("status", "approved").gte("reviewed_at", weekAgo.toISOString()),
      supabase.from("approval_queue").select("id", { count: "exact", head: true })
        .not("escalated_by", "is", null).eq("status", "pending"),
    ]).then(([t, w, e]) => {
      setTodayApproved(t.count || 0);
      setWeekApproved(w.count || 0);
      setEscalatedCount(e.count || 0);
    });
  }, []);

  const handleApprove = async (item: QueueItem) => {
    if (!user) return;
    await supabase.from("approval_queue").update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", item.id);
    await (supabase.from(item.content_type as any) as any).update({ status: "published" }).eq("id", item.content_id);
    toast.success("Approved!");
    fetchQueue();
  };

  const handleReject = async () => {
    if (!user || !rejectItem) return;
    await supabase.from("approval_queue").update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectReason,
      reviewer_notes: rejectNotes,
    }).eq("id", rejectItem.id);
    await (supabase.from(rejectItem.content_type as any) as any).update({ status: "rejected" }).eq("id", rejectItem.content_id);
    toast.success("Rejected");
    setRejectItem(null);
    setRejectReason("");
    setRejectNotes("");
    fetchQueue();
  };

  const handleEscalate = async (item: QueueItem) => {
    if (!user) return;
    await supabase.from("approval_queue").update({
      escalated_by: user.id,
      escalated_at: new Date().toISOString(),
      priority: 1,
    }).eq("id", item.id);
    toast.success("Escalated to supervisor");
    fetchQueue();
  };

  return (
    <div className="flex gap-6">
      {/* Main Queue — 70% */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5" style={{ color: BLUE }} />
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
            Welcome back, Moderator
          </h2>
          <span className="ml-auto text-sm font-mono" style={{ color: BLUE }}>
            {queue.length} items in queue
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BLUE, borderTopColor: "transparent" }} />
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: BLUE }} />
            <p className="font-mono text-sm text-muted-foreground">ALL CLEAR — QUEUE IS EMPTY</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map(item => {
              const p = priorityConfig[item.priority || 3];
              const overdue = isOverdue(item.created_at, item.priority);
              const timeStr = getTimeInQueue(item.created_at);

              return (
                <div key={item.id} className={`rounded-lg border p-4 bg-card/50 backdrop-blur-sm transition-all ${overdue ? "border-red-500/40 shadow-[0_0_12px_-4px_rgba(239,68,68,0.3)]" : "border-border/50"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Type badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-muted border border-border">
                          {item.content_type.replace("_", " ")}
                        </span>
                        {/* Priority badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono uppercase ${p.color}`}>
                          {p.label}
                        </span>
                        {/* Time in queue */}
                        <span className={`text-[10px] font-mono flex items-center gap-1 ${overdue ? "text-red-400" : "text-muted-foreground"}`}>
                          <Clock className="w-3 h-3" /> {timeStr} {overdue && "⚠"}
                        </span>
                        {/* Escalated */}
                        {item.escalated_by && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-mono">ESCALATED</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {item.content_id?.slice(0, 8)}...
                        {item.submitted_by && <> · By: {item.submitted_by.slice(0, 8)}...</>}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" className="font-mono text-xs h-8" style={{ backgroundColor: BLUE }} onClick={() => handleApprove(item)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="font-mono text-xs h-8" onClick={() => { setRejectItem(item); setRejectReason(""); setRejectNotes(""); }}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="outline" className="font-mono text-xs h-8 border-orange-500/30 text-orange-400 hover:border-orange-500/60" onClick={() => handleEscalate(item)}>
                        <ArrowUpCircle className="w-3 h-3 mr-1" /> Escalate
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar — 30% */}
      <div className="w-64 shrink-0 space-y-4 hidden lg:block">
        {/* Today's stats */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4" style={{ color: BLUE }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: BLUE }}>Today</span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono text-foreground">{todayApproved}</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Items processed</p>
          </div>
        </div>

        {/* Weekly stats */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4" style={{ color: BLUE }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: BLUE }}>This Week</span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono text-foreground">{weekApproved}</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Items processed</p>
          </div>
        </div>

        {/* Escalated */}
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">Escalated</span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono text-red-400">{escalatedCount}</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Awaiting supervisor</p>
          </div>
        </div>

        {/* Supervisor Contact */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Supervisor</p>
          <p className="text-sm font-mono text-foreground">Super Admin</p>
          <p className="text-xs text-muted-foreground font-mono">Contact via admin panel</p>
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={!!rejectItem} onOpenChange={() => setRejectItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Reject Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted-foreground mb-1 block">Reason</label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue placeholder="Select a reason..." /></SelectTrigger>
                <SelectContent>
                  {REJECT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground mb-1 block">Additional Notes</label>
              <Textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Optional details..." />
            </div>
            <Button onClick={handleReject} variant="destructive" className="w-full font-mono" disabled={!rejectReason}>
              <XCircle className="w-4 h-4 mr-1" /> Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorDashboard;
