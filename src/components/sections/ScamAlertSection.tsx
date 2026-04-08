import { scamAlerts, scamScoreFactors } from "@/data/reviews";
import { AlertTriangle } from "lucide-react";

const ScamAlertSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// SCAM WATCH</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-10">
          Active Scam <span className="text-destructive">Alerts</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Alerts */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-muted-foreground mb-4">LIVE ALERTS</h3>
            {scamAlerts.map((alert, i) => (
              <div key={i} className="glass-card rounded-xl p-5 hover:border-destructive/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <span className="pulse-dot inline-block w-2.5 h-2.5 rounded-full bg-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-foreground">{alert.broker}</h4>
                      <span className="text-[10px] font-mono text-muted-foreground">{alert.daysAgo}d ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.issue}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-destructive font-semibold">{alert.amount} lost</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scam Score Engine */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-sm font-mono text-foreground">SCAM SCORE ENGINE</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Our proprietary algorithm analyzes multiple risk factors to determine broker legitimacy.
            </p>
            <div className="space-y-5">
              {scamScoreFactors.map((f, i) => {
                const barColor =
                  f.color === "danger" ? "bg-destructive" : f.color === "accent" ? "bg-accent" : "bg-primary";
                const textColor =
                  f.color === "danger" ? "text-destructive" : f.color === "accent" ? "text-accent" : "text-primary";

                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{f.factor}</span>
                      <span className={`text-xs font-mono font-semibold ${textColor}`}>{f.level}</span>
                    </div>
                    <div className="score-bar">
                      <div className={`score-bar-fill ${barColor}`} style={{ width: `${f.value}%` }} />
                    </div>
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
