import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Users, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const PAGE_SIZE = 5;

interface SignalGroup {
  id: string;
  name: string;
  win_rate: number;
  monthly_signals: string;
  avg_rr: string;
  track_record: string;
  members: string;
  verified: boolean;
}

const SignalHub = () => {
  const [groups, setGroups] = useState<SignalGroup[]>([]);
  const [page, setPage] = useState(0);
  const cms = useSiteSettings<Record<string, any>>("signal_hub", {});

  const sectionTitle = cms.section_title || "Verified Signal";
  const accentText = cms.accent_text || "Groups";
  const subtitle = cms.subtitle || "Every Telegram group listed, reviewed and rated by real traders.";
  const ctaText = cms.cta_text || "View All Groups →";
  const displayCount = cms.display_count || 50;

  const fallbackGroups: SignalGroup[] = [
    { id: "s1", name: "Gold Pulse Signals", win_rate: 81, monthly_signals: "35", avg_rr: "1:2.4", track_record: "14 months", members: "4,200", verified: true },
    { id: "s2", name: "Asia FX Scalpers", win_rate: 84, monthly_signals: "48", avg_rr: "1:1.8", track_record: "22 months", members: "12,400", verified: true },
    { id: "s3", name: "Prop Killer Trades", win_rate: 78, monthly_signals: "60+", avg_rr: "1:3.1", track_record: "9 months", members: "8,900", verified: true },
  ];

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase
        .from("signal_groups")
        .select("*")
        .eq("status", "published")
        .order("win_rate", { ascending: false })
        .limit(displayCount);
      if (data && data.length > 0) setGroups(data as SignalGroup[]);
      else setGroups(fallbackGroups);
    };
    fetchGroups();
  }, [displayCount]);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="section-tag">// SIGNAL HUB</span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3">
              {sectionTitle} <span className="text-primary">{accentText}</span>
            </h2>
          </div>
          <Link to="/signals" className="text-sm font-semibold text-primary hover:underline">
            {ctaText}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mb-10">{subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">{group.name}</h3>
                {group.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-primary">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-0.5">Win Rate</div>
                  <div className="text-lg font-bold text-foreground flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    {group.win_rate}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-0.5">Members</div>
                  <div className="text-lg font-bold text-foreground flex items-center gap-1">
                    <Users className="w-4 h-4 text-primary" />
                    {group.members}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-0.5">Monthly</div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-accent" />
                    {group.monthly_signals}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-0.5">Avg R:R</div>
                  <div className="text-sm font-bold text-foreground">{group.avg_rr}</div>
                </div>
              </div>
              <Link to={`/signals/${group.id}`} className="block w-full py-2 text-sm font-semibold border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors text-center">
                View Group →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SignalHub;
