import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ADMIN_ROLES: AppRole[] = ["super_admin", "content_ops", "moderator"];
const ALL_DASHBOARD_ROLES: AppRole[] = ["super_admin", "content_ops", "moderator", "broker", "signal_provider", "betting_site"];

const PERMISSION_MATRIX: Record<string, AppRole[]> = {
  dashboard: ["super_admin", "content_ops", "moderator", "broker", "signal_provider"],
  brokers: ["super_admin", "content_ops"],
  signals: ["super_admin", "content_ops"],
  reviews: ["super_admin", "content_ops", "moderator"],
  complaints: ["super_admin", "content_ops", "moderator"],
  "scam-alerts": ["super_admin", "content_ops"],
  approvals: ["super_admin", "content_ops", "moderator"],
  users: ["super_admin"],
  revenue: ["super_admin"],
  settings: ["super_admin"],
  promotions: ["super_admin", "content_ops", "moderator"],
  news: ["super_admin", "content_ops", "moderator"],
  calendar: ["super_admin", "content_ops", "moderator"],
  sports: ["super_admin", "content_ops", "moderator"],
  "broker-dashboard": ["super_admin", "broker"],
  "signal-dashboard": ["super_admin", "signal_provider"],
  "sports-dashboard": ["super_admin", "content_ops"],
  "user-dashboard": ["super_admin"],
  "audit-log": ["super_admin"],
  forecasts: ["super_admin", "content_ops"],
  "site-content": ["super_admin"],
};

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!error && data) {
        setRoles(data.map((r) => r.role));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user, authLoading]);

  const hasRole = (role: AppRole) => roles.includes(role);

  const hasAnyRole = (checkRoles: AppRole[]) =>
    checkRoles.some((r) => roles.includes(r));

  const isAdmin = hasAnyRole(ADMIN_ROLES);

  const canAccessAdmin = hasAnyRole([...ADMIN_ROLES, "broker", "signal_provider"]);

  const canAccess = (section: string): boolean => {
    if (hasRole("super_admin")) return true;
    const allowed = PERMISSION_MATRIX[section];
    if (!allowed) return false;
    return hasAnyRole(allowed);
  };

  return { roles, loading, user, hasRole, hasAnyRole, isAdmin, canAccessAdmin, canAccess };
};
