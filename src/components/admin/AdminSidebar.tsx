import {
  LayoutDashboard, Building2, Radio, TrendingUp, MessageSquare,
  AlertTriangle, ShieldAlert, CheckCircle, Settings, Users, DollarSign, LogOut,
  Gift, Newspaper, CalendarDays, Trophy, ScrollText, Share2, BookOpen, GraduationCap,
  Lightbulb, Mail, Dices, FileText
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

type AppRole = Database["public"]["Enums"]["app_role"];

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[];
}

const items: MenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["super_admin", "content_ops", "moderator", "broker", "signal_provider"] },
  { title: "Brokers", url: "/admin/brokers", icon: Building2, roles: ["super_admin", "content_ops"] },
  { title: "Signal Groups", url: "/admin/signals", icon: Radio, roles: ["super_admin", "content_ops"] },
  { title: "Forecasts", url: "/admin/forecasts", icon: TrendingUp, roles: ["super_admin", "content_ops"] },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Complaints", url: "/admin/complaints", icon: AlertTriangle, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Scam Alerts", url: "/admin/scam-alerts", icon: ShieldAlert, roles: ["super_admin", "content_ops"] },
  { title: "Approval Queue", url: "/admin/approvals", icon: CheckCircle, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Promotions", url: "/admin/promotions", icon: Gift, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "News", url: "/admin/news", icon: Newspaper, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Calendar", url: "/admin/calendar", icon: CalendarDays, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Sports", url: "/admin/sports", icon: Trophy, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Users & Roles", url: "/admin/users", icon: Users, roles: ["super_admin"] },
  { title: "Revenue", url: "/admin/revenue", icon: DollarSign, roles: ["super_admin"] },
  { title: "Site Settings", url: "/admin/settings", icon: Settings, roles: ["super_admin"] },
  { title: "Site Content", url: "/admin/site-content", icon: FileText, roles: ["super_admin"] },
  { title: "Referral Analytics", url: "/admin/referrals", icon: Share2, roles: ["super_admin"] },
  { title: "Audit Log", url: "/admin/audit-log", icon: ScrollText, roles: ["super_admin"] },
  { title: "Education", url: "/admin/education", icon: BookOpen, roles: ["super_admin", "content_ops"] },
  { title: "Courses", url: "/admin/courses", icon: GraduationCap, roles: ["super_admin", "content_ops"] },
  { title: "Trading Ideas", url: "/admin/trading-ideas", icon: Lightbulb, roles: ["super_admin", "content_ops", "moderator"] },
  { title: "Submissions", url: "/admin/submissions", icon: Mail, roles: ["super_admin", "content_ops"] },
  { title: "Betting Sites", url: "/admin/betting-sites", icon: Dices, roles: ["super_admin", "content_ops"] },
];

const dashboardItems: MenuItem[] = [
  { title: "Broker Dashboard", url: "/admin/broker-dashboard", icon: Building2, roles: ["super_admin", "broker"] },
  { title: "Signal Dashboard", url: "/admin/signal-dashboard", icon: Radio, roles: ["super_admin", "signal_provider"] },
  { title: "Sports Dashboard", url: "/admin/sports-dashboard", icon: TrendingUp, roles: ["super_admin", "content_ops"] },
  { title: "User Dashboard", url: "/admin/user-dashboard", icon: Users, roles: ["super_admin"] },
  { title: "All Brokers", url: "/admin/broker-dashboards", icon: Building2, roles: ["super_admin"] },
  { title: "All Signals", url: "/admin/signal-dashboards", icon: Radio, roles: ["super_admin"] },
  { title: "All Betting", url: "/admin/betting-dashboards", icon: Dices, roles: ["super_admin"] },
  { title: "All Users", url: "/admin/user-dashboards", icon: Users, roles: ["super_admin"] },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { roles, hasRole } = useUserRole();

  const canSee = (item: MenuItem) =>
    hasRole("super_admin") || item.roles.some((r) => roles.includes(r));

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const visibleItems = items.filter(canSee);
  const visibleDashboards = dashboardItems.filter(canSee);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="text-primary font-bold text-xs font-mono tracking-widest uppercase">NAFT ADMIN</span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={`hover:bg-muted/50 ${isActive(item.url) ? "bg-muted text-primary font-medium" : ""}`}
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={async () => { await signOut(); navigate("/"); }}
                    className="flex items-center w-full hover:bg-destructive/10 text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Log Out</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {visibleDashboards.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {!collapsed && <span className="text-muted-foreground text-xs">Dashboards</span>}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleDashboards.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`hover:bg-muted/50 ${isActive(item.url) ? "bg-muted text-primary font-medium" : ""}`}
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
