import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Users } from "lucide-react";

const SportsDashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Sports / Betting Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" />Betting Sites</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">0</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" />Active Tips</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">0</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Followers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">0</p></CardContent></Card>
      </div>
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Sports betting section coming soon. Add betting sites and tips from the admin panel.</p>
      </div>
    </div>
  );
};

export default SportsDashboard;
