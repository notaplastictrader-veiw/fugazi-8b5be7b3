import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MyReviews = () => {
  const { user } = useAuth();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, brokers(name, slug)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <>
      <SEO title="My Reviews" description="View and manage your broker reviews." path="/dashboard/reviews" />
      <h1 className="text-2xl font-display font-extrabold text-foreground mb-6">My Reviews</h1>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reviews submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="glass-card rounded-xl p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-foreground text-sm">{r.brokers?.name || "Unknown Broker"}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: r.rating || 0 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MyReviews;
