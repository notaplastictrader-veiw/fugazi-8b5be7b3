import { LayoutDashboard, Building2, Radio, Trophy, ArrowUpCircle, Settings, LogOut, Home } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Props {
  role: AppRole;
}

const menuByRole: Record<string, { title: string; url: string; icon: any }[]> = {
  broker: [
    { title: "Dashboard", url: "/portal/broker", icon: LayoutDashboard },
    { title: "My Listing", url: "/portal/broker/listing", icon: Building2 },
    { title: "Upgrade Tier", url: "/portal/broker/upgrade", icon: ArrowUpCircle },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
  signal_provider: [
    { title: "Dashboard", url: "/portal/signal", icon: LayoutDashboard },
    { title: "My Channel", url: "/portal/signal/channel", icon: Radio },
    { title: "Upgrade Tier", url: "/portal/signal/upgrade", icon: ArrowUpCircle },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
  betting_site: [
    { title: "Dashboard", url: "/portal/betting", icon: LayoutDashboard },
    { title: "My Profile", url: "/portal/betting/profile", icon: Trophy },
    { title: "Upgrade Tier", url: "/portal/betting/upgrade", icon: ArrowUpCircle },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
};

export function ProviderSidebar({ role }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const items = menuByRole[role] || [];
  const isActive = (path: string) => location.pathname === path;

  const activeClasses = "bg-primary/15 text-primary font-medium border border-primary/30 rounded-md";
  const hoverClasses = "hover:bg-muted/50 transition-all duration-200";

  const roleLabel = role === "broker" ? "BROKER" : role === "signal_provider" ? "SIGNAL" : "BETTING";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="text-primary font-bold text-xs font-mono tracking-widest uppercase">
                {roleLabel} PORTAL
              </span>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === `/portal/${role === "broker" ? "broker" : role === "signal_provider" ? "signal" : "betting"}`}
                      className={`${hoverClasses} ${isActive(item.url) ? activeClasses : ""}`}
                      activeClassName={activeClasses}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Back to site + Logout */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={hoverClasses} activeClassName="">
                    <Home className="mr-2 h-4 w-4" />
                    {!collapsed && <span className="text-sm">Back to Site</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={async () => { await signOut(); navigate("/"); }}
                    className="flex items-center w-full hover:bg-destructive/10 text-destructive transition-all duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Log Out</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
