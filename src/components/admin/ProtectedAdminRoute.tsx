import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";
import AccessDenied from "@/pages/admin/AccessDenied";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Props {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
}

const ProtectedAdminRoute = ({ children }: Props) => {
  const { hasRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Only super_admin can access /admin
  if (!hasRole("super_admin")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
