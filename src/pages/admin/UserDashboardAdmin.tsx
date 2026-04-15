import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserCheck } from "lucide-react";

const UserDashboardAdmin: React.FC = () => {
  const [stats, setStats] = useState({ totalProfiles: 0, totalRoles: 0 });
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { count: pCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      const { count: rCount } = await supabase.from("user_roles").select("id", { count: "exact", head: true });
      const { data: recent } = await supabase.from("profiles").select("full_name, country, created_at").order("created_at", { ascending: false }).limit(10);
      setStats({ totalProfiles: pCount || 0, totalRoles: rCount || 0 });
      if (recent) setRecentProfiles(recent);
    };
    fetch();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">User Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Total Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{stats.totalProfiles}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-accent" />Roles Assigned</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{stats.totalRoles}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="w-4 h-4 text-primary" />Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{stats.totalProfiles}</p></CardContent></Card>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Registrations</h3>
      <div className="space-y-2">
        {recentProfiles.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">{p.full_name || "Anonymous"}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{p.country || "N/A"}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboardAdmin;
