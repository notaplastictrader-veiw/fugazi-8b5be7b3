import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";

interface UserRole {
  id: string; user_id: string; role: string; created_at: string;
}
interface ProfileInfo {
  user_id: string; full_name: string | null; phone: string | null;
}
interface AuthUser {
  id: string; email: string; created_at: string;
}

const roles = ["super_admin", "content_ops", "moderator", "user", "broker", "signal_provider"];

const UsersAdmin = () => {
  const [items, setItems] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [authUsers, setAuthUsers] = useState<Record<string, AuthUser>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("user");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as UserRole[]);

    const { data: profileData } = await supabase.from("profiles").select("user_id, full_name, phone");
    if (profileData) {
      const map: Record<string, ProfileInfo> = {};
      profileData.forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }

    // Fetch emails from edge function
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
    // Filter by signup date from authUsers
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
      name: profiles[r.user_id]?.full_name || "—",
      email: authUsers[r.user_id]?.email || "—",
      phone: profiles[r.user_id]?.phone || "—",
      role: r.role.replace("_", " "),
      signup_date: authUsers[r.user_id]?.created_at
        ? new Date(authUsers[r.user_id].created_at).toLocaleDateString()
        : new Date(r.created_at).toLocaleDateString(),
    }));
    exportToCSV(exportData, [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role" },
      { key: "signup_date", label: "Signup Date" },
    ], "users-export");
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Users & Roles</h2>
        <Button onClick={() => setModalOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" /> Assign Role</Button>
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
            {filteredItems.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No roles assigned</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
};

export default UsersAdmin;
