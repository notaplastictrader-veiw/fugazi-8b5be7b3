import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserRole {
  id: string; user_id: string; role: string; created_at: string;
}

const roles = ["super_admin", "content_ops", "moderator", "user", "broker", "signal_provider"];

const UsersAdmin = () => {
  const [items, setItems] = useState<UserRole[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("user");

  const fetchData = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as UserRole[]);
  };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!userId.trim()) { toast.error("Enter a user ID"); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role: role as "super_admin" | "content_ops" | "moderator" | "user" | "broker" | "signal_provider" });
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
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.user_id}</TableCell>
                <TableCell className="capitalize">{r.role.replace("_", " ")}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No roles assigned</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Role</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>User ID (UUID)</Label><Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Paste user UUID from Supabase Auth" /></div>
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
