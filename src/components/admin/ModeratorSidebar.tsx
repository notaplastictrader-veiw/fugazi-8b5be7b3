import {
  CheckCircle, MessageSquare, AlertTriangle, Lightbulb,
  Gift, LogOut, Activity, BarChart3, Flag
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const BLUE = "hsl(210, 100%, 50%)";

const queueItems = [
  { title: "My Queue", url: "/moderator", icon: CheckCircle },
  { title: "Reviews", url: "/moderator/reviews", icon: MessageSquare },
  { title: "Complaints", url: "/moderator/complaints", icon: AlertTriangle },
  { title: "Trading Ideas", url: "/moderator/ideas", icon: Lightbulb },
  { title: "Promotions", url: "/moderator/promotions", icon: Gift },
];

const browseItems = [
  { title: "All Pending", url: "/moderator/all-pending", icon: Activity },
  { title: "Escalated", url: "/moderator/escalated", icon: Flag },
];

const activityItems = [
  { title: "My Stats", url: "/moderator/stats", icon: BarChart3 },
];

export function ModeratorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) =>
    path === "/moderator" ? location.pathname === "/moderator" : location.pathname.startsWith(path);

  const activeClasses = "bg-[hsl(210,100%,50%)]/15 text-[hsl(210,100%,50%)] font-medium shadow-[0_0_12px_-2px_hsl(210_100%_50%/0.4)] border border-[hsl(210,100%,50%)]/30 rounded-md";
  const hoverClasses = "hover:bg-muted/50 hover:shadow-[0_0_8px_-2px_hsl(210_100%_50%/0.15)] transition-all duration-200";

  const renderSection = (label: string, items: typeof queueItems) => (
    <SidebarGroup>
      <SidebarGroupLabel>
        {!collapsed && (
          <span className="text-[10px] uppercase tracking-widest font-mono text-[hsl(210,100%,50%)]/70">{label}</span>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/moderator"}
                  className={`${hoverClasses} ${isActive(item.url) ? activeClasses : ""}`}
                  activeClassName={activeClasses}
                >
                  <item.icon className={`mr-2 h-3.5 w-3.5 ${isActive(item.url) ? "text-[hsl(210,100%,50%)]" : ""}`} />
                  {!collapsed && <span className="text-sm">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="font-bold text-xs font-mono tracking-widest uppercase" style={{ color: BLUE }}>NAFT MOD</span>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {renderSection("MY QUEUE", queueItems)}
        {renderSection("BROWSE", browseItems)}
        {renderSection("MY ACTIVITY", activityItems)}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
