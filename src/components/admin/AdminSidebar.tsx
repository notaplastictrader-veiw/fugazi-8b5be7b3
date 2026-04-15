import { useState, useEffect } from "react";
import {
  LayoutDashboard, Building2, Radio, TrendingUp, MessageSquare,
  AlertTriangle, ShieldAlert, CheckCircle, Settings, Users, DollarSign, LogOut,
  Gift, Newspaper, CalendarDays, Trophy, ScrollText, Share2, BookOpen, GraduationCap,
  Lightbulb, Mail, Dices, FileText, ChevronDown, ShieldCheck, ArrowUpCircle,
  Globe, BarChart3, Briefcase, UserCog
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
}

interface SidebarSection {
  label: string;
  icon: any;
  items: MenuItem[];
}

const STORAGE_KEY = "naft-admin-sidebar-state";

const sections: SidebarSection[] = [
  {
    label: "OVERVIEW",
    icon: LayoutDashboard,
    items: [
      { title: "Command Center", url: "/admin", icon: LayoutDashboard },
      { title: "Approval Queue", url: "/admin/approvals", icon: CheckCircle },
      { title: "Audit Log", url: "/admin/audit-log", icon: ScrollText },
    ],
  },
  {
    label: "SITE CONTENT",
    icon: Globe,
    items: [
      { title: "Homepage Sections", url: "/admin/site-content", icon: FileText },
      { title: "Global Settings", url: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "CONTENT MANAGEMENT",
    icon: Briefcase,
    items: [
      { title: "Brokers", url: "/admin/brokers", icon: Building2 },
      { title: "Betting Sites", url: "/admin/betting-sites", icon: Dices },
      { title: "Signal Groups", url: "/admin/signals", icon: Radio },
      { title: "Forecasts", url: "/admin/forecasts", icon: TrendingUp },
      { title: "Promotions", url: "/admin/promotions", icon: Gift },
      { title: "News", url: "/admin/news", icon: Newspaper },
      { title: "Calendar", url: "/admin/calendar", icon: CalendarDays },
      { title: "Sports", url: "/admin/sports", icon: Trophy },
      { title: "Education", url: "/admin/education", icon: BookOpen },
      { title: "Courses", url: "/admin/courses", icon: GraduationCap },
      { title: "Scam Alerts", url: "/admin/scam-alerts", icon: ShieldAlert },
    ],
  },
  {
    label: "COMMUNITY",
    icon: MessageSquare,
    items: [
      { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
      { title: "Complaints", url: "/admin/complaints", icon: AlertTriangle },
      { title: "Trading Ideas", url: "/admin/trading-ideas", icon: Lightbulb },
      { title: "Submissions", url: "/admin/submissions", icon: Mail },
    ],
  },
  {
    label: "COMPANY DASHBOARDS",
    icon: BarChart3,
    items: [
      { title: "Broker Dashboard", url: "/admin/broker-dashboard", icon: Building2 },
      { title: "Signal Dashboard", url: "/admin/signal-dashboard", icon: Radio },
      { title: "Sports Dashboard", url: "/admin/sports-dashboard", icon: TrendingUp },
      { title: "User Dashboard", url: "/admin/user-dashboard", icon: Users },
      { title: "All Brokers", url: "/admin/broker-dashboards", icon: Building2 },
      { title: "All Signals", url: "/admin/signal-dashboards", icon: Radio },
      { title: "All Betting", url: "/admin/betting-dashboards", icon: Dices },
      { title: "All Users", url: "/admin/user-dashboards", icon: Users },
    ],
  },
  {
    label: "PEOPLE",
    icon: UserCog,
    items: [
      { title: "Users & Roles", url: "/admin/users", icon: Users },
      { title: "Applications", url: "/admin/applications", icon: UserCog },
      { title: "Profile Claims", url: "/admin/claims", icon: ShieldCheck },
      { title: "Tier Upgrades", url: "/admin/tier-upgrades", icon: ArrowUpCircle },
    ],
  },
  {
    label: "ANALYTICS & REVENUE",
    icon: DollarSign,
    items: [
      { title: "Revenue", url: "/admin/revenue", icon: DollarSign },
      { title: "Referral Analytics", url: "/admin/referrals", icon: Share2 },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Load persisted section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { OVERVIEW: true };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const activeClasses = "bg-primary/15 text-primary font-medium shadow-[0_0_12px_-2px_hsl(var(--primary)/0.4),inset_0_0_8px_-4px_hsl(var(--primary)/0.2)] border border-primary/30 rounded-md";
  const hoverClasses = "hover:bg-muted/50 hover:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)] transition-all duration-200";

  // Super admin sees everything — no role filtering needed

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="text-primary font-bold text-xs font-mono tracking-widest uppercase">NAFT ADMIN</span>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Section groups */}
        {sections.map(section => {
          const sectionItems = section.items;
          if (sectionItems.length === 0) return null;
          const sectionHasActive = sectionItems.some(i => isActive(i.url));
          const isOpen = openSections[section.label] ?? sectionHasActive;

          return (
            <SidebarGroup key={section.label}>
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.label)}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer select-none hover:text-primary transition-colors duration-200 flex items-center justify-between w-full pr-2">
                    {!collapsed ? (
                      <>
                        <span className={`text-[10px] uppercase tracking-widest font-mono ${sectionHasActive ? "text-primary" : "text-muted-foreground"}`}>
                          {section.label}
                        </span>
                        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      </>
                    ) : (
                      <section.icon className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {sectionItems.map((item) => (
                        <SidebarMenuItem key={item.title + item.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/admin"}
                              className={`${hoverClasses} ${isActive(item.url) ? activeClasses : ""}`}
                              activeClassName={activeClasses}
                            >
                              <item.icon className={`mr-2 h-3.5 w-3.5 ${isActive(item.url) ? "drop-shadow-[0_0_4px_hsl(var(--primary)/0.6)]" : ""}`} />
                              {!collapsed && <span className="text-sm">{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}

        {/* Logout */}
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
