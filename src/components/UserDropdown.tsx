import { useState } from "react";
import { X, ChevronDown, User, LogOut, MessageSquare, Star, Bell, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface UserDropdownProps {
  onClose: () => void;
}

const UserDropdown = ({ onClose }: UserDropdownProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const firstName = fullName.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const menuItems = [
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Star, label: "My Reviews", href: "/my-reviews" },
    { icon: MessageSquare, label: "My Complaints", href: "/my-complaints" },
    { icon: Bell, label: "Signal Subscriptions", href: "/subscriptions" },
  ];

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
          <div>
            <p className="text-sm font-semibold text-foreground truncate">{firstName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
