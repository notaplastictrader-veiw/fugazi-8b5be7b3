import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Peer {
  id: string;
  name: string;
  slug: string;
  score: number;
  logo_url: string | null;
  regulation: string[] | null;
  type: string;
}

const PeerBrokersRail = ({ brokerId, type }: { brokerId: string; type: string }) => {
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("brokers")
        .select("id,name,slug,score,logo_url,regulation,type")
        .eq("status", "published")
        .eq("type", type)
        .neq("id", brokerId)
        .order("score", { ascending: false })
        .limit(3);
      if (!cancelled && data) setPeers(data as Peer[]);
    })();
    return () => { cancelled = true; };
  }, [brokerId, type]);

  if (peers.length === 0) return null;

  return (
    <section className="mt-10 scroll-mt-24" id="similar-brokers">
      <div className="flex items-end justify-between mb-3">
        <h2 className="font-display font-extrabold text-xl text-foreground">Similar {type === "prop-firm" ? "Prop Firms" : "Brokers"}</h2>
        <Link to={type === "prop-firm" ? "/prop-firms" : "/brokers"} className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {peers.map((p) => (
          <Link
            key={p.id}
            to={`/brokers/${p.slug}`}
            className="glass-card rounded-xl p-4 hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              {p.logo_url ? (
                <img src={p.logo_url} alt={`${p.name} logo`} loading="lazy" decoding="async" width={40} height={40} className="w-10 h-10 rounded-lg bg-background border border-border object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-foreground">{p.name.charAt(0)}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{p.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{Math.round((p.score || 0) * 10)}/100 Trust</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {(p.regulation || []).slice(0, 3).map((r) => (
                <span key={r} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border">
                  <Shield className="w-2.5 h-2.5" /> {r}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PeerBrokersRail;
