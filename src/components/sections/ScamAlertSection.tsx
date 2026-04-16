import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface ScamAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  created_at: string;
}

const defaultScamScoreFactors = [
  { factor: "Complaint Ratio", level: "High", value: 85, color: "danger" as const },
  { factor: "Withdrawal Speed", level: "Med", value: 55, color: "accent" as const },
  { factor: "Regulation Strength", level: "High", value: 80, color: "danger" as const },
  { factor: "Proof-verified Reviews", level: "Med", value: 60, color: "accent" as const },
  { factor: "Platform Transparency", level: "Low", value: 30, color: "primary" as const },
];

const ScamAlertSection = () => {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const cms = useSiteSettings<Record<string, any>>("scam_alert_section", {});

  const sectionTitle = cms.section_title || "Active Scam";
  const ctaText = cms.cta_text || "View All Scam Alerts →";
  const displayCount = cms.display_count || 10;

  const fallbackAlerts: ScamAlert[] = [
    { id: "sa1", title: "TradeWave Markets", description: "Withdrawal refused after profit — $12,400 unresolved.", severity: "high", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: "sa2", title: "GoldFX Pro", description: "Fake regulation, platform manipulation — $8,200 under investigation.", severity: "high", created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: "sa3", title: "CryptoEdge BD", description: "Account frozen, no response 30+ days — $3,800 unresolved.", severity: "medium", created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  ];

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("scam_alerts").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(displayCount);
      if (data && data.length > 0) setAlerts(data as ScamAlert[]);
      else setAlerts(fallbackAlerts);
    };
    fetch();
  }, [displayCount]);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// SCAM WATCH</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-10">
          {sectionTitle} <span className="text-destructive">Alerts</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-muted-foreground mb-4">LIVE ALERTS</h3>
            {alerts.map((alert) => {
              const daysAgo = Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 86400000);
              return (
                <Link to={`/scam-alerts/${alert.id}`} key={alert.id} className="block glass-card rounded-xl p-5 hover:border-destructive/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><span className="pulse-dot inline-block w-2.5 h-2.5 rounded-full bg-destructive" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                        <span className="text-[10px] font-mono text-muted-foreground">{daysAgo}d ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        alert.severity === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-accent/10 text-accent border-accent/20"
                      }`}>{alert.severity} severity</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <div className="mt-4">
              <a href="/scam-alerts" className="text-sm text-destructive hover:underline font-medium">{ctaText}</a>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-sm font-mono text-foreground">SCAM SCORE ENGINE</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Our proprietary algorithm analyzes multiple risk factors to determine broker legitimacy.</p>
            <div className="space-y-5">
              {defaultScamScoreFactors.map((f, i) => {
                const barColor = f.color === "danger" ? "bg-destructive" : f.color === "accent" ? "bg-accent" : "bg-primary";
                const textColor = f.color === "danger" ? "text-destructive" : f.color === "accent" ? "text-accent" : "text-primary";
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{f.factor}</span>
                      <span className={`text-xs font-mono font-semibold ${textColor}`}>{f.level}</span>
                    </div>
                    <div className="score-bar"><div className={`score-bar-fill ${barColor}`} style={{ width: `${f.value}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScamAlertSection;
