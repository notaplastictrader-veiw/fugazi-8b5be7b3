import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import StatusBadge from "@/components/admin/StatusBadge";
import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MyComplaints = () => {
  const { user } = useAuth();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("complaints")
        .select("*, brokers(name, slug)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <>
      <SEO title="My Complaints" description="Track your filed complaints." path="/dashboard/complaints" />
      <h1 className="text-2xl font-display font-extrabold text-foreground mb-6">My Complaints</h1>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : complaints.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No complaints filed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c: any) => (
            <div key={c.id} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-bold text-foreground text-sm">{c.brokers?.name || "Unknown Broker"}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.content}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MyComplaints;
