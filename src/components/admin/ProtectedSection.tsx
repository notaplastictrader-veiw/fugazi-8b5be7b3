import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedSectionProps {
  requiredRoles: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedSection = ({ requiredRoles, children, fallback = null }: ProtectedSectionProps) => {
  const { hasAnyRole, loading } = useUserRole();
  if (loading) return null;
  if (!hasAnyRole(requiredRoles)) return <>{fallback}</>;
  return <>{children}</>;
};

export default ProtectedSection;
