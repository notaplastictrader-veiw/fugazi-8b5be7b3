import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";

const RevenueAdmin = () => {
  const placeholders = [
    { label: "Total Revenue", value: "$0.00", icon: DollarSign },
    { label: "Active Affiliates", value: "0", icon: Users },
    { label: "Clicks This Month", value: "0", icon: BarChart3 },
    { label: "Conversion Rate", value: "0%", icon: TrendingUp },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Revenue</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {placeholders.map(p => (
          <Card key={p.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <p.icon className="w-4 h-4 text-primary" />{p.label}
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{p.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
        <p className="text-lg font-medium">Revenue tracking coming soon</p>
        <p className="text-sm mt-1">Affiliate links, ad revenue, and conversion analytics</p>
      </div>
    </div>
  );
};

export default RevenueAdmin;
