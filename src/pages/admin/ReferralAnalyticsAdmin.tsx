import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { MousePointerClick, Users, DollarSign, Link2 } from "lucide-react";

interface ReferralCode {
  id: string;
  code: string;
  user_id: string;
  clicks: number;
  conversions: number;
  earnings: number;
  created_at: string;
}

const ReferralAnalyticsAdmin = () => {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCodes = async () => {
      const { data } = await supabase
        .from("referral_codes")
        .select("*")
        .order("clicks", { ascending: false });
      setCodes(data || []);
      setLoading(false);
    };
    fetchCodes();
  }, []);

  const totalClicks = codes.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = codes.reduce((s, c) => s + c.conversions, 0);
  const totalEarnings = codes.reduce((s, c) => s + Number(c.earnings), 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  const filtered = codes.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Referral Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conv. Rate</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{conversionRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Input placeholder="Search by code or user ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No referral codes found</TableCell></TableRow>
              ) : (
                filtered.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono text-sm font-medium">{code.code}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{code.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-right">{code.clicks}</TableCell>
                    <TableCell className="text-right">{code.conversions}</TableCell>
                    <TableCell className="text-right">${Number(code.earnings).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(code.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralAnalyticsAdmin;
