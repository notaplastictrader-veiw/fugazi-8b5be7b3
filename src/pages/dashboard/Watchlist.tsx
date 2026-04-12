import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Bookmark, Trash2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Watchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-watchlist", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("watchlist")
        .select("*, brokers(id, name, slug, score, stars, type, badge)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (watchlistId: string) => {
      await supabase.from("watchlist").delete().eq("id", watchlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-watchlist"] });
      toast.success("Removed from watchlist");
    },
  });

  return (
    <>
      <SEO title="Watchlist" description="Your saved brokers." path="/dashboard/watchlist" />
      <h1 className="text-2xl font-display font-extrabold text-foreground mb-6">Watchlist</h1>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No brokers saved yet. Browse brokers and add them to your watchlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/brokers/${item.brokers?.slug}`} className="font-display font-bold text-foreground text-sm hover:text-primary transition-colors">
                  {item.brokers?.name || "Unknown"}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize">{item.brokers?.type}</span>
                  {item.brokers?.stars && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs text-muted-foreground">{item.brokers.stars}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeMutation.mutate(item.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Watchlist;
