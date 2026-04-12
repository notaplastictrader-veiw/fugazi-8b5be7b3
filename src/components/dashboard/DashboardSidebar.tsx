import { LayoutDashboard, Star, AlertTriangle, Bookmark, Settings, Link2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  const { t } = useI18n();
  const items = [
    { title: t("dashboard.overview"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("dashboard.reviews"), url: "/dashboard/reviews", icon: Star },
    { title: t("dashboard.complaints"), url: "/dashboard/complaints", icon: AlertTriangle },
    { title: t("dashboard.watchlist"), url: "/dashboard/watchlist", icon: Bookmark },
    { title: t("dashboard.settings"), url: "/dashboard/settings", icon: Settings },
    { title: t("dashboard.referrals"), url: "/dashboard/referrals", icon: Link2 },
  ];
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
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
};

export default DashboardSidebar;
