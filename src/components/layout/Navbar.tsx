import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  User,
  Building2,
  ShieldCheck,
  Signal,
  BarChart3,
} from "lucide-react";

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
    children: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Partnership", href: "/partnership" },
      { label: "Advertise", href: "/advertise" },
      { label: "Ideas", href: "/ideas" },
      { label: "Forecasts — Forex", href: "/forecasts?tab=forex" },
      { label: "Forecasts — Sports", href: "/forecasts?tab=sports" },
    ],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Sun className="w-4 h-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Globe className="w-4 h-4" />
          </button>

          {/* Login Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setLoginOpen(!loginOpen); setJoinOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              Log In
              <ChevronDown className="w-3 h-3" />
            </button>
            {loginOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-xl">
                <Link to="/login/user" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-t-lg">
                  <User className="w-4 h-4" /> User Login
                </Link>
                <Link to="/login/broker" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                  <Building2 className="w-4 h-4" /> Broker Login
                </Link>
                <Link to="/login/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-b-lg">
                  <ShieldCheck className="w-4 h-4" /> Admin Login
                </Link>
              </div>
            )}
          </div>

          {/* Join Free Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setJoinOpen(!joinOpen); setLoginOpen(false); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Join Free
              <ChevronDown className="w-3 h-3" />
            </button>
            {joinOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl">
                <Link to="/join/broker" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-t-lg">
                  <Building2 className="w-4 h-4" /> Broker Listing
                </Link>
                <Link to="/join/signal" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-b-lg">
                  <Signal className="w-4 h-4" /> Signal Group
                </Link>
              </div>
            )}
          </div>
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
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              <Link to="/login/user" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Log In — User
              </Link>
              <Link to="/login/broker" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Log In — Broker
              </Link>
              <button className="w-full px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg">
                Join Free
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
