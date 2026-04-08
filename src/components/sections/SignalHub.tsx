import { signalGroups } from "@/data/signals";
import { CheckCircle, Users, BarChart3, TrendingUp } from "lucide-react";

const SignalHub = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// SIGNAL HUB</span>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mt-3 mb-2">
          Verified Signal <span className="text-primary">Groups</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-10">Every Telegram group listed, reviewed and rated by real traders.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signalGroups.map((group) => (
            <div key={group.name} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
                {group.verified && <CheckCircle className="w-4 h-4 text-primary" />}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="text-sm font-mono font-bold text-foreground">{group.winRate}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <div>
                    <div className="text-xs text-muted-foreground">Monthly</div>
                    <div className="text-sm font-mono font-bold text-foreground">{group.monthlySignals}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avg R:R</div>
                  <div className="text-sm font-mono font-bold text-foreground">{group.avgRR}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Track Record</div>
                  <div className="text-sm font-mono font-bold text-foreground">{group.trackRecord}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {group.members} members
                </div>
                <button className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  View Group
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SignalHub;
