import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Sun, Moon, Flame, Globe, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/modals/AuthModal";

const navLinks = [
  {
    label: "Brokers",
    href: "#",
    children: [
      { label: "CFD / Forex", href: "/brokers" },
      { label: "Binary Options", href: "/brokers?type=binary" },
      { label: "Crypto Exchanges", href: "/brokers?type=crypto" },
    ],
  },
  { label: "Prop Firms", href: "/prop-firms" },
  { label: "Betting", href: "/betting" },
  { label: "Signals", href: "/signals" },
  { label: "Promotions", href: "/promotions" },
  { label: "Education", href: "/education" },
  {
    label: "More",
    href: "#",
    highlight: true,
    children: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Partnership", href: "/partnership" },
      { label: "Advertise", href: "/advertise" },
      { label: "Share Ideas", href: "/ideas" },
      { label: "Forecasts — Forex", href: "/forecasts?tab=forex" },
      { label: "Forecasts — Sports", href: "/forecasts?tab=sports" },
    ],
  },
];

const regions = [
  { flag: "🇬🇧", name: "United Kingdom", code: "UK" },
  { flag: "🇮🇳", name: "India", code: "IN" },
  { flag: "🇵🇰", name: "Pakistan", code: "PK" },
  { flag: "🇦🇪", name: "UAE", code: "AE" },
  { flag: "🌐", name: "Global", code: "GL" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [regionOpen, setRegionOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("napt-region");
      return regions.find((r) => r.code === saved) || regions[0];
    }
    return regions[0];
  });
  const { theme, cycleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const openLogin = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthModalTab("signup");
    setAuthModalOpen(true);
  };

  const handleRegionSelect = (region: typeof regions[0]) => {
    setSelectedRegion(region);
    localStorage.setItem("napt-region", region.code);
    setRegionOpen(false);
  };

  // Close dropdowns on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAuthModalOpen(false);
        setRegionOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close region dropdown on outside click
  useEffect(() => {
    if (!regionOpen) return;
    const handleClick = () => setRegionOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [regionOpen]);

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Flame;
  const themeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Dasara";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[190] bg-background/80 backdrop-blur-2xl border-b border-border" style={{ top: "34px" }}>
        <div className="max-w-7xl mx-auto px-4 h-[58px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Not A Plastic <span className="text-primary">Trader</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
              Brokers Review
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                      link.highlight
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => toggleDropdown(link.label)}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
                {link.children && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              title={themeLabel}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ThemeIcon className="w-4 h-4" />
            </button>

            {/* Region selector */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setRegionOpen(!regionOpen); }}
                className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-lg"
                title={selectedRegion.name}
              >
                {selectedRegion.flag}
              </button>
              {regionOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                  {regions.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => handleRegionSelect(r)}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedRegion.code === r.code
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-lg">{r.flag}</span>
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </span>
                <button
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg"
                >
                  Log In / Sign Up
                </button>
                <button
                  onClick={openSignup}
                  className="px-4 py-2 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Join Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-card border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(link.label)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === link.label && (
                        <div className="pl-6 space-y-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
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
                    <span className="block px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</span>
                    <button
                      onClick={async () => { await signOut(); setMobileOpen(false); }}
                      className="w-full px-4 py-2.5 text-sm font-semibold border border-border text-foreground rounded-lg"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); openLogin(); }}
                      className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Log In / Sign Up
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); openSignup(); }}
                      className="w-full px-4 py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg"
                    >
                      Join Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Navbar;
