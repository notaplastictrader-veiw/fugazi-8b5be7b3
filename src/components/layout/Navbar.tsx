import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Sun, Moon, Flame, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/modals/AuthModal";
import LanguageSelector from "@/components/LanguageSelector";
import UserDropdown from "@/components/UserDropdown";

const navLinks = [
  {
    label: "Brokers",
    href: "#",
    children: [
      { label: "CFD / Forex Brokers", href: "/brokers" },
      { label: "Crypto Exchanges", href: "/brokers?type=crypto" },
      { label: "Binary Options", href: "/brokers?type=binary" },
      { label: "ECN Brokers", href: "/brokers?type=ecn" },
      { label: "Broker Comparison", href: "/compare" },
    ],
  },
  { label: "Prop Firms", href: "/prop-firms" },
  { label: "Betting", href: "/betting" },
  { label: "Signals", href: "/signals" },
  { label: "Promotions", href: "/promotions" },
  {
    label: "Partnership",
    href: "#",
    children: [
      { label: "Become an Affiliate", href: "/partnership?tab=affiliate" },
      { label: "IB Partnership", href: "/partnership?tab=ib" },
      { label: "Collaboration", href: "/partnership?tab=collab" },
    ],
  },
  { label: "Education", href: "/education" },
  { label: "Share Ideas", href: "/ideas" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { theme, cycleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
  const themeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Dasara";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[190] bg-background/80 backdrop-blur-2xl border-b border-border" style={{ top: "34px" }}>
        <div className="max-w-7xl mx-auto px-4 h-[58px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none shrink-0">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Not A Plastic <span className="text-primary">Trader</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
              Global Trading Hub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <button
                    className="flex items-center gap-1 px-2.5 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => toggleDropdown(link.label)}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                ) : (
                  <Link to={link.href} className="px-2.5 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                )}
                {link.children && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {link.children.map((child) => (
                      <Link key={child.label} to={child.href}
                        className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg transition-colors">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden xl:flex items-center gap-2">
            <button onClick={cycleTheme} title={themeLabel}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ThemeIcon className="w-4 h-4" />
            </button>

            <LanguageSelector />

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
                  Log In
                </button>
                <button onClick={openSignup} className="px-4 py-2 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  Join Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="xl:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-card border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <button onClick={() => toggleDropdown(link.label)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
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
                    <Link to={link.href} className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
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
                      <span className="text-sm font-medium text-foreground">{firstName}</span>
                    </div>
                    <button onClick={async () => { await signOut(); setMobileOpen(false); }}
                      className="w-full px-4 py-2.5 text-sm font-semibold border border-border text-foreground rounded-lg flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMobileOpen(false); openLogin(); }}
                      className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                      Log In
                    </button>
                    <button onClick={() => { setMobileOpen(false); openSignup(); }}
                      className="w-full px-4 py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg">
                      Join Free
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
