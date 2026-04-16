import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Copy, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV } from "@/lib/adminExport";

interface UserRole {
  id: string; user_id: string; role: string; created_at: string;
}
interface ProfileInfo {
  user_id: string; full_name: string | null; phone: string | null;
}
interface AuthUser {
  id: string; email: string; created_at: string;
}
interface CsvRow {
  user_id: string; role: string;
}

const roles = ["super_admin", "content_ops", "moderator", "user", "broker", "signal_provider"];

const UsersAdmin = () => {
  const [items, setItems] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [authUsers, setAuthUsers] = useState<Record<string, AuthUser>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("user");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as UserRole[]);

    const { data: profileData } = await supabase.from("profiles").select("user_id, full_name, phone");
    if (profileData) {
      const map: Record<string, ProfileInfo> = {};
      profileData.forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (token) {
        const { data: authData, error } = await supabase.functions.invoke("admin-users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!error && Array.isArray(authData)) {
          const map: Record<string, AuthUser> = {};
          authData.forEach((u: AuthUser) => { map[u.id] = u; });
          setAuthUsers(map);
        }
      }
    } catch (e) {
      console.error("Failed to fetch auth users", e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredItems = useMemo(() => {
    if (!fromDate && !toDate) return items;
    return items.filter(item => {
      const authUser = authUsers[item.user_id];
      const date = authUser?.created_at || item.created_at;
      const d = new Date(date).toISOString().slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [items, authUsers, fromDate, toDate]);

  const handleExport = () => {
    const exportData = filteredItems.map(r => ({
      user_id: r.user_id,
      name: profiles[r.user_id]?.full_name || "—",
      email: authUsers[r.user_id]?.email || "—",
      phone: profiles[r.user_id]?.phone || "—",
      role: r.role.replace("_", " "),
      signup_date: authUsers[r.user_id]?.created_at
        ? new Date(authUsers[r.user_id].created_at).toLocaleDateString()
        : new Date(r.created_at).toLocaleDateString(),
    }));
    exportToCSV(exportData, [
      { key: "user_id", label: "User ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role" },
      { key: "signup_date", label: "Signup Date" },
    ], "users-export");
  };

  const handleCopy = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      toast.success("Copied!");
    } catch { toast.error("Failed to copy"); }
  };

  const handleAdd = async () => {
    if (!userId.trim()) { toast.error("Enter a user ID"); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role: role as any });
    if (error) { toast.error(error.message); return; }
    toast.success("Role assigned");
    setModalOpen(false);
    setUserId("");
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this role?")) return;
    await supabase.from("user_roles").delete().eq("id", id);
    toast.success("Removed");
    fetchData();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const parsed: CsvRow[] = [];
      for (const line of lines) {
        const [uid, r] = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
        if (uid && r && uid !== "user_id") {
          parsed.push({ user_id: uid, role: r });
        }
      }
      setCsvRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (csvRows.length === 0) { toast.error("No rows to import"); return; }
    setImporting(true);
    let success = 0, errors = 0;
    for (const row of csvRows) {
      if (!roles.includes(row.role)) { errors++; continue; }
      const { error } = await supabase.from("user_roles").insert({ user_id: row.user_id, role: row.role as any });
      if (error) errors++; else success++;
    }
    toast.success(`Imported ${success} roles${errors ? `, ${errors} failed` : ""}`);
    setImporting(false);
    setBulkModalOpen(false);
    setCsvRows([]);
    if (fileRef.current) fileRef.current.value = "";
    fetchData();
  };

  const downloadSampleCSV = () => {
    const csv = "user_id,role\n00000000-0000-0000-0000-000000000000,user";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample-bulk-roles.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Users & Roles</h2>
        <div className="flex gap-2">
          <Button onClick={() => setBulkModalOpen(true)} size="sm" variant="outline"><Upload className="w-4 h-4 mr-1" /> Bulk Import</Button>
          <Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" /> Assign Role</Button>
        </div>
      </div>

      <AdminTableToolbar
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onExport={handleExport}
      />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{profiles[r.user_id]?.full_name || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-muted-foreground">{r.user_id.slice(0, 8)}…</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(r.user_id)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{authUsers[r.user_id]?.email || "—"}</TableCell>
                <TableCell>{profiles[r.user_id]?.phone || "—"}</TableCell>
                <TableCell className="capitalize">{r.role.replace("_", " ")}</TableCell>
                <TableCell className="text-muted-foreground">
                  {authUsers[r.user_id]?.created_at
                    ? new Date(authUsers[r.user_id].created_at).toLocaleDateString()
                    : new Date(r.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No roles assigned</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Assign Role Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Role</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>User ID (UUID)</Label><Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Paste user UUID" /></div>
            <div><Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="w-full">Assign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={(open) => { setBulkModalOpen(open); if (!open) { setCsvRows([]); if (fileRef.current) fileRef.current.value = ""; } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Bulk Import Roles (CSV)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              CSV format: <code className="bg-muted px-1 rounded">user_id,role</code> — one per line.
              <br />Valid roles: {roles.join(", ")}
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={downloadSampleCSV}>
              <Download className="w-3 h-3 mr-1" /> Download sample CSV
            </Button>
            <Input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} />
            {csvRows.length > 0 && (
              <div className="rounded border border-border max-h-48 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvRows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-mono">{row.user_id.slice(0, 8)}…</TableCell>
                        <TableCell className="capitalize">{row.role.replace("_", " ")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-2 text-xs text-muted-foreground">{csvRows.length} row(s) ready</div>
              </div>
            )}
            <Button onClick={handleBulkImport} className="w-full" disabled={csvRows.length === 0 || importing}>
              {importing ? "Importing…" : `Import ${csvRows.length} Role(s)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersAdmin;
