import { Link, useLocation } from "react-router-dom";
import { Home, BarChart3, Sparkles, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/brokers", label: "Brokers", icon: BarChart3 },
  { to: "/match", label: "Match", icon: Sparkles, primary: true },
  { to: "/scam-alerts", label: "Scam", icon: ShieldAlert },
  { to: "/dashboard", label: "Account", icon: User },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed left-0 right-0 z-[180] bg-background/95 backdrop-blur-xl border-t border-border"
      style={{ bottom: "0px" }}
    >
      <ul className="flex items-stretch justify-around h-[58px]">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          if (primary) {
            return (
              <li key={to} className="relative -mt-5">
                <Link
                  to={to}
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.45)] hover:scale-105 transition-transform"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
                <span className="block text-center text-[9px] font-mono text-primary mt-0.5 uppercase tracking-wider">
                  {label}
                </span>
              </li>
            );
          }
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-0.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
