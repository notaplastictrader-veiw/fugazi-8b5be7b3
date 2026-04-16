import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Search, UserPlus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getFullYear()).slice(-2)}`;
};

type AppRole = Database["public"]["Enums"]["app_role"];

interface Application {
  id: string;
  user_id: string | null;
  role: string;
  status: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_telegram: string | null;
  application_data: any;
  created_at: string;
}

const ROLE_MAP: Record<string, AppRole> = {
  broker: "broker",
  signal_provider: "signal_provider",
  signal: "signal_provider",
  betting_site: "betting_site",
  betting: "betting_site",
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={styles[status] || styles.pending}>
      {status}
    </Badge>
  );
};

const ApplicationsAdmin = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    let query = supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query;
    if (!error && data) setApplications(data);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, [filter]);

  const handleApprove = async (app: Application) => {
    if (!app.user_id) {
      toast.error("No user ID linked to this application");
      return;
    }
    setProcessingId(app.id);

    const appRole = ROLE_MAP[app.role];
    if (!appRole) {
      toast.error(`Unknown role: ${app.role}`);
      setProcessingId(null);
      return;
    }

    // Insert role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: app.user_id, role: appRole });

    if (roleError && !roleError.message.includes("duplicate")) {
      toast.error("Failed to assign role: " + roleError.message);
      setProcessingId(null);
      return;
    }

    // Create profile/listing based on role
    const data = (app.application_data as any) || {};
    try {
      if (appRole === "broker") {
        const slug = (data.company_name || "broker").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
        const { data: brokerRow } = await supabase.from("brokers").insert({
          name: data.company_name || "New Broker",
          slug,
          type: "forex",
          status: "draft",
          created_by: app.user_id,
        }).select("id").single();

        if (brokerRow) {
          await supabase.from("broker_profiles").insert({
            broker_id: brokerRow.id,
            claimed_by: app.user_id,
            claim_status: "claimed",
            tier: "basic",
          });
        }
      } else if (appRole === "signal_provider") {
        const { data: signalRow } = await supabase.from("signal_groups").insert({
          name: data.telegram_link || data.group_name || "New Signal Group",
          status: "draft",
          created_by: app.user_id,
        }).select("id").single();

        if (signalRow) {
          await supabase.from("signal_profiles").insert({
            signal_group_id: signalRow.id,
            claimed_by: app.user_id,
            claim_status: "claimed",
            tier: "basic",
          });
        }
      } else if (appRole === "betting_site") {
        const slug = (data.platform_name || "betting").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
        await supabase.from("betting_profiles").insert({
          site_name: data.platform_name || "New Betting Site",
          slug,
          claimed_by: app.user_id,
          claim_status: "claimed",
          tier: "basic",
        });
      }
    } catch (e) {
      console.error("Profile creation error:", e);
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", app.id);

    if (updateError) {
      toast.error("Role assigned but failed to update application status");
    } else {
      toast.success(`${app.role} role assigned + profile created!`);
    }

    // Audit log
    if (user) {
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "approve_application",
        table_name: "applications",
        record_id: app.id,
        new_data: { role: appRole, target_user: app.user_id },
      });
    }

    // Notify the user
    if (app.user_id) {
      await supabase.from("notifications").insert({
        user_id: app.user_id,
        type: "system",
        title: "Application Approved!",
        message: `Your ${app.role.replace("_", " ")} application has been approved. You can now access your portal.`,
        link: appRole === "broker" ? "/portal/broker" : appRole === "signal_provider" ? "/portal/signal" : "/portal/betting",
      });
    }

    setProcessingId(null);
    fetchApplications();
  };

  const handleReject = async (app: Application) => {
    setProcessingId(app.id);

    const { error } = await supabase
      .from("applications")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
        application_data: { ...((app.application_data as any) || {}), rejection_note: rejectNote[app.id] || "" },
      })
      .eq("id", app.id);

    if (error) {
      toast.error("Failed to reject: " + error.message);
    } else {
      toast.success("Application rejected");
    }

    if (user) {
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "reject_application",
        table_name: "applications",
        record_id: app.id,
        old_data: { role: app.role },
      });
    }

    setProcessingId(null);
    fetchApplications();
  };

  const filtered = applications.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.contact_email?.toLowerCase().includes(s) ||
      a.role.toLowerCase().includes(s) ||
      a.user_id?.toLowerCase().includes(s)
    );
  });

  const dateFiltered = useMemo(() => filterByDateRange(filtered, "created_at", fromDate, toDate), [filtered, fromDate, toDate]);

  const handleExport = () => {
    exportToCSV(dateFiltered.map(a => ({
      email: a.contact_email || "—", role: a.role, status: a.status,
      date: formatDate(a.created_at),
    })), [
      { key: "email", label: "Email" }, { key: "role", label: "Role" },
      { key: "status", label: "Status" }, { key: "date", label: "Date" },
    ], "applications-export");
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Provider Applications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve broker, signal provider, and betting site applications
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "pending" && <Clock className="h-3.5 w-3.5 mr-1" />}
            {f === "approved" && <CheckCircle className="h-3.5 w-3.5 mr-1" />}
            {f === "rejected" && <XCircle className="h-3.5 w-3.5 mr-1" />}
            {f}
          </Button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      <AdminTableToolbar fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} onExport={handleExport} />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : dateFiltered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No {filter !== "all" ? filter : ""} applications found
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateFiltered.map((app) => {
                const data = (app.application_data as any) || {};
                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.contact_email || "—"}</div>
                        {app.contact_phone && <div className="text-xs text-muted-foreground">{app.contact_phone}</div>}
                        {app.contact_telegram && <div className="text-xs text-muted-foreground">TG: {app.contact_telegram}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{app.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs space-y-0.5">
                        {data.company_name && <div><span className="text-muted-foreground">Company:</span> {data.company_name}</div>}
                        {data.website && <div><span className="text-muted-foreground">Web:</span> {data.website}</div>}
                        {data.group_name && <div><span className="text-muted-foreground">Group:</span> {data.group_name}</div>}
                        {data.platform && <div><span className="text-muted-foreground">Platform:</span> {data.platform}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(app.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(app.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status === "pending" ? (
                        <div className="flex items-center gap-2 justify-end">
                          <Textarea
                            placeholder="Rejection note (optional)"
                            value={rejectNote[app.id] || ""}
                            onChange={(e) => setRejectNote((p) => ({ ...p, [app.id]: e.target.value }))}
                            className="w-40 h-8 text-xs resize-none"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processingId === app.id}
                            onClick={() => handleReject(app)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={processingId === app.id || !app.user_id}
                            onClick={() => handleApprove(app)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsAdmin;
