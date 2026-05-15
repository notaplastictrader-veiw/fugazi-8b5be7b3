import { useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BrokerHealthScore from "@/components/broker/BrokerHealthScore";

export default function HealthScoreAdmin() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("brokers")
      .select("id, name, slug, health_score, health_breakdown, health_updated_at")
      .eq("status", "published")
      .order("health_score", { ascending: false });
    setBrokers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const recalcAll = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("recalc_all_broker_health");
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Recalculated ${data} brokers`);
    load();
  };

  const recalcOne = async (id: string) => {
    const { error } = await supabase.rpc("calc_broker_health_score", { _broker_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-condensed text-3xl uppercase tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Broker Health Score
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Computed from complaints, scam alerts, ratings, and verified withdrawal proofs.
          </p>
        </div>
        <Button onClick={recalcAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Recalculate all
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((b) => (
          <div key={b.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{b.name}</h3>
              <Button size="sm" variant="ghost" onClick={() => recalcOne(b.id)}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <BrokerHealthScore
              score={b.health_score}
              breakdown={b.health_breakdown}
              updatedAt={b.health_updated_at}
            />
          </div>
        ))}
        {!brokers.length && (
          <p className="text-sm text-muted-foreground col-span-full">No published brokers yet.</p>
        )}
      </div>
    </div>
  );
}
