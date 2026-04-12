import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { BarChart3, Star, AlertTriangle, TrendingUp, Users, Eye } from "lucide-react";

const StatCard = ({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) => (
  <div className="glass-card rounded-xl p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className="text-2xl font-display font-bold text-foreground">{value}</div>
  </div>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || "User";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">Welcome back, {fullName.split(" ")[0]}.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Eye} label="Profile Views" value="—" />
          <StatCard icon={Users} label="Leads" value="—" />
          <StatCard icon={Star} label="Reviews" value="—" />
          <StatCard icon={TrendingUp} label="Clicks" value="—" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">Recent Reviews</h2>
            <p className="text-sm text-muted-foreground">No reviews yet. Your reviews will appear here once approved.</p>
          </div>
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">Analytics</h2>
            <p className="text-sm text-muted-foreground">Analytics data will be available once your profile is active and receiving traffic.</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mt-6">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Complaints</h2>
          <p className="text-sm text-muted-foreground">No complaints filed. Track and manage complaints from this panel.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
