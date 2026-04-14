import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Users, Search, ArrowLeft, Shield, MessageSquare, AlertTriangle, Eye, UserCheck } from "lucide-react";

const UserDetail = ({ id }: { id: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: p }, { data: r }, { data: rev }, { data: comp }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", id),
        supabase.from("reviews").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
        supabase.from("complaints").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
      ]);
      if (p) setProfile(p);
      if (r) setRoles(r.map(x => x.role));
      if (rev) setReviews(rev);
      if (comp) setComplaints(comp);
    };
    fetch();
  }, [id]);

  if (!profile) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Reviews", value: reviews.length, icon: MessageSquare },
    { label: "Complaints", value: complaints.length, icon: AlertTriangle },
    { label: "Roles", value: roles.length, icon: Shield },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/user-dashboards" className="hud-action-btn p-2"><ArrowLeft className="w-4 h-4 text-primary" /></Link>
        <div className="hud-badge">USER</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          {profile.full_name || "Anonymous"}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="hud-stat p-4 flex flex-col items-center gap-1">
            <s.icon className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-foreground font-mono">{s.value}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hud-card p-1">
          <div className="p-4">
            <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Profile</span>
            <div className="space-y-2 text-sm font-mono">
              {[
                ["Name", profile.full_name],
                ["Country", profile.country],
                ["Phone", profile.phone],
                ["Joined", new Date(profile.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
                  <span className="text-muted-foreground uppercase text-[10px]">{k}</span>
                  <span className="text-foreground">{v || "—"}</span>
                </div>
              ))}
              <div className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
                <span className="text-muted-foreground uppercase text-[10px]">Roles</span>
                <div className="flex gap-1">
                  {roles.length > 0 ? roles.map(r => (
                    <span key={r} className="hud-badge">{r}</span>
                  )) : <span className="text-muted-foreground text-xs">user</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="hud-card p-1">
            <div className="p-4">
              <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Reviews ({reviews.length})</span>
              <div className="space-y-2 max-h-48 overflow-auto">
                {reviews.map((r, i) => (
                  <div key={i} className="p-2 bg-background/50 border border-border/50 rounded text-xs font-mono">
                    <div className="flex justify-between"><span className="text-foreground">★ {r.rating}/10</span><span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span></div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">{r.content || "No content"}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-xs text-muted-foreground font-mono">NO REVIEWS</p>}
              </div>
            </div>
          </div>

          <div className="hud-card p-1">
            <div className="p-4">
              <span className="text-xs font-mono text-destructive uppercase tracking-widest mb-3 block">Complaints ({complaints.length})</span>
              <div className="space-y-2 max-h-48 overflow-auto">
                {complaints.map((c, i) => (
                  <div key={i} className="p-2 bg-background/50 border border-border/50 rounded text-xs font-mono">
                    <p className="text-muted-foreground line-clamp-2">{c.content || "No details"}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ${c.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                  </div>
                ))}
                {complaints.length === 0 && <p className="text-xs text-muted-foreground font-mono">NO COMPLAINTS</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboardsList = () => {
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("id, full_name, country, created_at")
      .order("created_at", { ascending: false }).then(({ data }) => { if (data) setUsers(data); setLoading(false); });
  }, []);

  if (id) return <UserDetail id={id} />;

  const filtered = users.filter(u => (u.full_name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">DASHBOARDS</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">User Dashboards</h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 font-mono text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Link key={u.id} to={`/admin/user-dashboards/${u.id}`} className="hud-card p-1 block hover:scale-[1.01] transition-transform">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-bold text-foreground">{u.full_name || "Anonymous"}</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">{u.country || "Unknown"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                  <Eye className="w-4 h-4 text-primary" />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground font-mono text-sm">NO USERS FOUND</p>}
        </div>
      )}
    </div>
  );
};

export default UserDashboardsList;
