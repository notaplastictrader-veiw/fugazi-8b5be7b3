import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";
import AccessDenied from "@/pages/admin/AccessDenied";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Props {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
}

const ProtectedAdminRoute = ({ children, requiredRoles }: Props) => {
  const { canAccessAdmin, hasAnyRole, hasRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole("super_admin") && !hasAnyRole(requiredRoles)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
