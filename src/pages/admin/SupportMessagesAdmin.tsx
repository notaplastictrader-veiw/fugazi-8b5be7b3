import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Inbox, Mail, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SupportMessage {
  id: string;
  user_id: string;
  sender_role: string;
  context_name: string | null;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  open: { label: "Open", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: Mail },
  in_progress: { label: "In Progress", cls: "bg-accent/15 text-accent-foreground border-accent/30", icon: Clock },
  resolved: { label: "Resolved", cls: "bg-primary/15 text-primary border-primary/30", icon: CheckCircle2 },
};

const SupportMessagesAdmin = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<SupportMessage | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState<SupportMessage["status"]>("open");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_messages" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setMessages((data || []) as any);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = messages.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (roleFilter !== "all" && m.sender_role !== roleFilter) return false;
    return true;
  });

  const openMessage = (m: SupportMessage) => {
    setSelected(m);
    setResponse(m.admin_response || "");
    setNewStatus(m.status);
  };

  const saveResponse = async () => {
    if (!selected) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const updates: any = {
      status: newStatus,
      admin_response: response.trim() || null,
    };
    if (response.trim() && !selected.admin_response) {
      updates.responded_at = new Date().toISOString();
      updates.responded_by = user?.id;
    }
    const { error } = await supabase
      .from("support_messages" as any)
      .update(updates)
      .eq("id", selected.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Updated");
      setSelected(null);
      load();
    }
    setSaving(false);
  };

  const counts = {
    open: messages.filter((m) => m.status === "open").length,
    in_progress: messages.filter((m) => m.status === "in_progress").length,
    resolved: messages.filter((m) => m.status === "resolved").length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-['Barlow_Condensed'] uppercase tracking-wide">Priority Support Inbox</h1>
        <p className="text-sm text-muted-foreground font-mono">Messages from broker, signal & betting partners</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-destructive/30">
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-destructive" /><span className="text-xs font-mono uppercase">Open</span></div>
          <div className="text-2xl font-bold mt-1">{counts.open}</div>
        </Card>
        <Card className="p-4 border-accent/30">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-xs font-mono uppercase">In Progress</span></div>
          <div className="text-2xl font-bold mt-1">{counts.in_progress}</div>
        </Card>
        <Card className="p-4 border-primary/30">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /><span className="text-xs font-mono uppercase">Resolved</span></div>
          <div className="text-2xl font-bold mt-1">{counts.resolved}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sender roles</SelectItem>
            <SelectItem value="broker">Broker</SelectItem>
            <SelectItem value="signal_provider">Signal Provider</SelectItem>
            <SelectItem value="betting_site">Betting Site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="font-mono text-sm">No messages match these filters.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const cfg = statusConfig[m.status];
            const Icon = cfg.icon;
            return (
              <Card
                key={m.id}
                className="p-4 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => openMessage(m)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cfg.cls}>
                        <Icon className="w-3 h-3 mr-1" />{cfg.label}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {m.sender_role.replace("_", " ")}
                      </Badge>
                      {m.context_name && (
                        <span className="text-xs font-mono text-muted-foreground truncate">{m.context_name}</span>
                      )}
                    </div>
                    <h3 className="font-medium truncate">{m.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{m.message}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
                  {selected.subject}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <Badge variant="outline">{selected.sender_role.replace("_", " ")}</Badge>
                  {selected.context_name && <Badge variant="outline">{selected.context_name}</Badge>}
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap">
                  {selected.message}
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground">Status</label>
                  <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground">Internal response notes</label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Notes about how you responded (e.g. via email/telegram)…"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                  <Button onClick={saveResponse} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportMessagesAdmin;
