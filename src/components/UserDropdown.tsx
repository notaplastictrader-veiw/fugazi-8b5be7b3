import { User, LogOut, MessageSquare, Star, Shield, LayoutDashboard, Building2, Radio, Settings, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

interface UserDropdownProps {
  onClose: () => void;
}

const UserDropdown = ({ onClose }: UserDropdownProps) => {
  const { user, signOut } = useAuth();
  const { hasRole, hasAnyRole } = useUserRole();
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const firstName = fullName.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const getRoleBadge = () => {
    if (hasRole("super_admin")) return { label: "Super Admin", className: "bg-destructive/15 text-destructive border-destructive/30" };
    if (hasRole("content_ops")) return { label: "Content Ops", className: "bg-primary/15 text-primary border-primary/30" };
    if (hasRole("moderator")) return { label: "Moderator", className: "bg-accent/15 text-accent-foreground border-accent/30" };
    if (hasRole("broker")) return { label: "Broker", className: "bg-primary/15 text-primary border-primary/30" };
    if (hasRole("signal_provider")) return { label: "Signal Provider", className: "bg-primary/15 text-primary border-primary/30" };
    if (hasRole("betting_site")) return { label: "Betting Site", className: "bg-primary/15 text-primary border-primary/30" };
    return null;
  };

  const getMenuItems = () => {
    if (hasRole("super_admin")) {
      return [
        { icon: Shield, label: "Admin Panel", href: "/admin" },
        { icon: User, label: "Dashboard", href: "/dashboard" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      ];
    }
    if (hasRole("broker")) {
      return [
        { icon: Building2, label: "Broker Portal", href: "/portal/broker" },
        { icon: User, label: "Dashboard", href: "/dashboard" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      ];
    }
    if (hasRole("signal_provider")) {
      return [
        { icon: Radio, label: "Signal Portal", href: "/portal/signal" },
        { icon: User, label: "Dashboard", href: "/dashboard" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      ];
    }
    if (hasRole("betting_site")) {
      return [
        { icon: Trophy, label: "Betting Portal", href: "/portal/betting" },
        { icon: User, label: "Dashboard", href: "/dashboard" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      ];
    }
    return [
      { icon: User, label: "Dashboard", href: "/dashboard" },
      { icon: Star, label: "My Reviews", href: "/dashboard/reviews" },
      { icon: MessageSquare, label: "My Complaints", href: "/dashboard/complaints" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];
  };

  const roleBadge = getRoleBadge();
  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  return (
    <div className="absolute top-full right-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl z-50">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{firstName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {roleBadge && (
              <Badge variant="outline" className={`mt-1 text-[10px] px-1.5 py-0 ${roleBadge.className}`}>
                {roleBadge.label}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="py-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="border-t border-border py-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
