import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Dices, Search, ArrowLeft, Star, Shield, Eye } from "lucide-react";
import { bettingSites, type BettingSite } from "@/data/bettingSites";

const BettingDetail = ({ site }: { site: BettingSite }) => {
  const stats = [
    { label: "Rating", value: `${site.rating}/10`, icon: Star },
    { label: "License", value: site.license || "N/A", icon: Shield },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/betting-dashboards" className="hud-action-btn p-2"><ArrowLeft className="w-4 h-4 text-primary" /></Link>
        <div className="hud-badge">BETTING</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">{site.name}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="hud-stat p-4 flex flex-col items-center gap-1">
            <s.icon className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-foreground font-mono">{s.value}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="hud-card p-1">
        <div className="p-4">
          <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Details</span>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
              <span className="text-muted-foreground uppercase text-[10px]">Bonus</span>
              <span className="text-foreground">{site.bonus || "—"}</span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
              <span className="text-muted-foreground uppercase text-[10px]">Min Deposit</span>
              <span className="text-foreground">{site.min_deposit || "—"}</span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
              <span className="text-muted-foreground uppercase text-[10px]">Withdrawal</span>
              <span className="text-foreground">{site.withdrawal_speed || "—"}</span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
              <span className="text-muted-foreground uppercase text-[10px]">Sports</span>
              <span className="text-foreground">{site.sports?.join(", ") || "—"}</span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
              <span className="text-muted-foreground uppercase text-[10px]">Features</span>
              <span className="text-foreground">{site.features?.join(", ") || "—"}</span>
            </div>
            {site.warning && (
              <div className="p-2 bg-destructive/5 border border-destructive/20 rounded">
                <span className="text-[10px] text-destructive font-mono uppercase">⚠ {site.warning}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BettingDashboardsList = () => {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");

  if (id) {
    const site = bettingSites.find(s => s.slug === id);
    if (!site) return <p className="text-center py-16 text-muted-foreground font-mono">SITE NOT FOUND</p>;
    return <BettingDetail site={site} />;
  }

  const filtered = bettingSites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">DASHBOARDS</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Betting Site Dashboards</h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search betting sites..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 font-mono text-sm" />
      </div>

      <div className="space-y-2">
        {filtered.map(s => (
          <Link key={s.slug} to={`/admin/betting-dashboards/${s.slug}`} className="hud-card p-1 block hover:scale-[1.01] transition-transform">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.logo}</span>
                <div>
                  <span className="text-sm font-bold text-foreground">{s.name}</span>
                  <p className="text-[10px] text-muted-foreground font-mono">{s.bonus}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground font-mono">{s.rating}</span>
                  <span className="text-[10px] text-muted-foreground font-mono block">/10</span>
                </div>
                <Eye className="w-4 h-4 text-primary" />
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground font-mono text-sm">NO BETTING SITES FOUND</p>}
      </div>
    </div>
  );
};

export default BettingDashboardsList;
