import {
  LayoutDashboard, Building2, Radio, TrendingUp, MessageSquare,
  AlertTriangle, ShieldAlert, CheckCircle, Settings, Users, DollarSign, LogOut,
  Gift, Newspaper, CalendarDays, Trophy
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Brokers", url: "/admin/brokers", icon: Building2 },
  { title: "Signal Groups", url: "/admin/signals", icon: Radio },
  { title: "Forecasts", url: "/admin/forecasts", icon: TrendingUp },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
  { title: "Complaints", url: "/admin/complaints", icon: AlertTriangle },
  { title: "Scam Alerts", url: "/admin/scam-alerts", icon: ShieldAlert },
  { title: "Approval Queue", url: "/admin/approvals", icon: CheckCircle },
  { title: "Site Settings", url: "/admin/settings", icon: Settings },
  { title: "Users & Roles", url: "/admin/users", icon: Users },
  { title: "Revenue", url: "/admin/revenue", icon: DollarSign },
  { title: "Promotions", url: "/admin/promotions", icon: Gift },
  { title: "News", url: "/admin/news", icon: Newspaper },
  { title: "Calendar", url: "/admin/calendar", icon: CalendarDays },
  { title: "Sports", url: "/admin/sports", icon: Trophy },
];

const dashboardItems = [
  { title: "Broker Dashboard", url: "/admin/broker-dashboard", icon: Building2 },
  { title: "Signal Dashboard", url: "/admin/signal-dashboard", icon: Radio },
  { title: "Sports Dashboard", url: "/admin/sports-dashboard", icon: TrendingUp },
  { title: "User Dashboard", url: "/admin/user-dashboard", icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="text-primary font-bold text-sm">NAFT Admin</span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && <span className="text-muted-foreground text-xs">Dashboards</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
