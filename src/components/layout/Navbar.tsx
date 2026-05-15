import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Sun, Moon, Flame, LogOut, Search, Shield, User, Settings, Building2, Radio, Star, MessageSquare, Trophy, Gift, Lightbulb, CalendarDays, Newspaper, Handshake, Users, Briefcase, Info, Mail } from "lucide-react";

// Icon map for More mega-menu items (matched by label keyword)
const moreIcons: Record<string, any> = {
  promotions: Gift,
  ideas: Lightbulb,
  share: Lightbulb,
  calendar: CalendarDays,
  news: Newspaper,
  affiliate: Handshake,
  ib: Users,
  collab: Briefcase,
  about: Info,
  contact: Mail,
};
const iconFor = (label: string) => {
  const k = label.toLowerCase();
  for (const key in moreIcons) if (k.includes(key)) return moreIcons[key];
  return ChevronDown;
};
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import AuthModal from "@/components/modals/AuthModal";
import LanguageSelector from "@/components/LanguageSelector";
import UserDropdown from "@/components/UserDropdown";
import NotificationBell from "@/components/NotificationBell";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { theme, cycleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const { hasRole } = useUserRole();
  const navigate = useNavigate();

  const getMobileMenuItems = () => {
    if (hasRole("super_admin")) return [
      { icon: Shield, label: "Admin Panel", href: "/admin" },
      { icon: User, label: "Dashboard", href: "/dashboard" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];
    if (hasRole("broker")) return [
      { icon: Building2, label: "Broker Portal", href: "/portal/broker" },
      { icon: User, label: "Dashboard", href: "/dashboard" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];
    if (hasRole("signal_provider")) return [
      { icon: Radio, label: "Signal Portal", href: "/portal/signal" },
      { icon: User, label: "Dashboard", href: "/dashboard" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];
    if (hasRole("betting_site")) return [
      { icon: Trophy, label: "Betting Portal", href: "/portal/betting" },
      { icon: User, label: "Dashboard", href: "/dashboard" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];
    return [
      { icon: User, label: "Dashboard", href: "/dashboard" },
      { icon: Star, label: "My Reviews", href: "/dashboard/reviews" },
      { icon: MessageSquare, label: "My Complaints", href: "/dashboard/complaints" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];
  };

  const getMobileRoleBadge = () => {
    if (hasRole("super_admin")) return { label: "Super Admin", className: "bg-destructive/15 text-destructive border-destructive/30" };
    if (hasRole("content_ops")) return { label: "Content Ops", className: "bg-primary/15 text-primary border-primary/30" };
    if (hasRole("moderator")) return { label: "Moderator", className: "bg-accent/15 text-accent-foreground border-accent/30" };
    if (hasRole("broker")) return { label: "Broker", className: "bg-primary/15 text-primary border-primary/30" };
    if (hasRole("signal_provider")) return { label: "Signal Provider", className: "bg-primary/15 text-primary border-primary/30" };
    if (hasRole("betting_site")) return { label: "Betting Site", className: "bg-primary/15 text-primary border-primary/30" };
    return null;
  };

  const navCms = useSiteSettings<Record<string, any>>("navbar", {});

  const navLinks = useMemo(() => {
    const injectExtras = (items: any[]) => {
      const EXTRAS = [
        { label: t("nav.forum", "Forum"), href: "/forum" },
        { label: t("nav.awards", "NAFT Awards"), href: "/awards" },
      ];
      const out = [...items];
      const moreIdx = out.findIndex(i => /more/i.test(i.label || ""));
      if (moreIdx >= 0) {
        const existing = out[moreIdx].children || [];
        const have = new Set(existing.map((c: any) => c.href));
        out[moreIdx] = {
          ...out[moreIdx],
          children: [...EXTRAS.filter(e => !have.has(e.href)), ...existing],
        };
      } else {
        const haveTop = new Set(out.map(i => i.href));
        EXTRAS.forEach(e => { if (!haveTop.has(e.href)) out.push({ ...e, highlight: true }); });
      }
      return out;
    };

    const items = navCms.menu_items;
    if (Array.isArray(items) && items.length > 0) {
      const mapped = items.map((item: any) => ({
        label: item.label,
        href: item.href || item.url || "#",
        highlight: !!item.highlight,
        children: Array.isArray(item.children) && item.children.length > 0
          ? item.children.map((c: any) => ({ label: c.label, href: c.href || c.url || "#" }))
          : undefined,
      }));
      return injectExtras(mapped);
    }
    return [
      { label: t("nav.brokerReviews", "Broker Reviews"), href: "/brokers" },
      { label: t("nav.propFirms", "Prop Firms"), href: "/prop-firms" },
      { label: t("nav.scamAlerts", "Scam Alerts"), href: "/scam-alerts" },
      { label: t("nav.compare", "Compare"), href: "/compare" },
      { label: t("nav.aiMatch", "AI Match"), href: "/match", highlight: true },
      { label: t("nav.signals"), href: "/signals" },
      { label: t("nav.education"), href: "/education" },
      {
        label: t("nav.more"),
        href: "#",
        children: [
          { label: t("nav.forum", "Forum"), href: "/forum" },
          { label: t("nav.awards", "NAFT Awards"), href: "/awards" },
          { label: "Ask NAFT AI", href: "/ask" },
          { label: t("nav.promotions", "Promotions"), href: "/promotions" },
          { label: t("nav.sports", "Sports"), href: "/sports" },
          { label: "Share Ideas", href: "/ideas" },
          { label: t("nav.calendar", "Calendar"), href: "/calendar" },
          { label: t("nav.news", "News"), href: "/news" },
          { label: t("nav.about", "About Us"), href: "/about" },
          { label: t("nav.contact", "Contact Us"), href: "/contact" },
          { label: t("nav.affiliate", "Become an Affiliate"), href: "/partnership?tab=affiliate" },
          { label: "IB Partnership", href: "/partnership?tab=ib" },
          { label: "Collaboration", href: "/partnership?tab=collab" },
        ],
      },
    ] as any[];
  }, [navCms.menu_items, t]);

  const moreLabel = navCms.more_label || t("nav.more");

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const openLogin = () => { setAuthModalTab("login"); setAuthModalOpen(true); };
  const openSignup = () => { setAuthModalTab("signup"); setAuthModalOpen(true); };

  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const firstName = fullName.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setAuthModalOpen(false); setOpenDropdown(null); setUserDropdownOpen(false); }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const close = () => setUserDropdownOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userDropdownOpen]);

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Flame;
  const themeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Sentinel";

  return (
    <>
      <nav className="fixed top-0 md:top-[34px] left-0 right-0 z-[190] bg-background/80 backdrop-blur-2xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-[48px] md:h-[58px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={theme === "light" ? "/images/naft-candlestick-light-green.svg" : theme === "sentinel" ? "/images/naft-candlestick-dark-red.svg" : "/images/naft-candlestick-dark-lime.svg"}
              alt="NAFT Logo"
              className="w-8 h-8"
            />
            <div className="flex flex-col items-center leading-none">
              <span className="text-lg font-bold tracking-tight text-foreground">
                Not A Fugazi <span className="text-primary">Trader</span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Former Broker Insider
              </span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <button
                    className={`flex items-center gap-1 px-2.5 py-2 text-[13px] transition-colors ${
                      (link as any).highlight
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground font-medium"
                    }`}
                    onClick={() => toggleDropdown(link.label)}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                ) : (
                  <Link to={link.href} className="px-2.5 py-2 text-[13px] text-muted-foreground hover:text-foreground font-medium transition-colors">
                    {link.label}
                  </Link>
                )}
                {link.children && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                    {link.label === moreLabel && link.children.length >= 6 ? (
                      <>
                        <div className="px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Main Menu</div>
                        {link.children.slice(0, 4).map((child) => (
                          <Link key={child.label} to={child.href} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">{child.label}</Link>
                        ))}
                        <div className="border-t border-border my-1" />
                        <div className="px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Partnership</div>
                        {link.children.slice(6).map((child) => (
                          <Link key={child.label} to={child.href} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">{child.label}</Link>
                        ))}
                        <div className="border-t border-border my-1" />
                        {link.children.slice(4, 6).map((child) => (
                          <Link key={child.label} to={child.href} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">{child.label}</Link>
                        ))}
                      </>
                    ) : (
                      link.children.map((child) => (
                        <Link key={child.label} to={child.href}
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg transition-colors">
                          {child.label}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <button onClick={cycleTheme} title={themeLabel}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ThemeIcon className="w-4 h-4" />
            </button>

            <LanguageSelector />

            <button
              onClick={() => (window as any).__openGlobalSearch?.()}
              title="Search (⌘K)"
              className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {user && <NotificationBell />}

            {user ? (
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {initial}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{firstName}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {userDropdownOpen && <UserDropdown onClose={() => setUserDropdownOpen(false)} />}
              </div>
            ) : (
              <>
                <button onClick={openLogin} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg">
                  {t("nav.login")}
                </button>
                <button onClick={openSignup} className="px-4 py-2 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  {t("nav.joinFree")}
                </button>
              </>
            )}
          </div>

          <button className="xl:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="xl:hidden bg-card border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <button onClick={() => toggleDropdown(link.label)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground font-medium">
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                      </button>
                      {openDropdown === link.label && (
                        <div className="pl-6 space-y-1">
                          {link.children.map((child) => (
                            <Link key={child.label} to={child.href}
                              className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                              onClick={() => setMobileOpen(false)}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link to={link.href} className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground font-medium"
                      onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-3 flex items-center gap-2">
                <button onClick={cycleTheme} className="p-2 text-muted-foreground hover:text-foreground">
                  <ThemeIcon className="w-5 h-5" />
                </button>
                <span className="text-xs text-muted-foreground">{themeLabel}</span>
              </div>
              <div className="space-y-2 pt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{initial}</div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground">{firstName}</span>
                        {getMobileRoleBadge() && (
                          <Badge variant="outline" className={`ml-2 text-[10px] px-1.5 py-0 ${getMobileRoleBadge()!.className}`}>
                            {getMobileRoleBadge()!.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {getMobileMenuItems().map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <button onClick={async () => { await signOut(); setMobileOpen(false); }}
                      className="w-full px-4 py-2.5 text-sm font-semibold border border-border text-destructive rounded-lg flex items-center justify-center gap-2 mt-1">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMobileOpen(false); openLogin(); }}
                      className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                      {t("nav.login")}
                    </button>
                    <button onClick={() => { setMobileOpen(false); openSignup(); }}
                      className="w-full px-4 py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg">
                      {t("nav.joinFree")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authModalTab} />
    </>
  );
};

export default Navbar;
