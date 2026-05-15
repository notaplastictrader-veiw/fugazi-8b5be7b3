import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProviderSidebar } from "./ProviderSidebar";
import NoIndex from "@/components/seo/NoIndex";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Props {
  requiredRole: AppRole;
}

function ProviderLayout({ requiredRole }: Props) {
  const { user } = useAuth();
  const { hasRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(requiredRole) && !hasRole("super_admin")) return <Navigate to="/dashboard" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProviderSidebar role={requiredRole} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50">
            <SidebarTrigger className="mr-3" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              {requiredRole === "broker" ? "Broker Portal" : requiredRole === "signal_provider" ? "Signal Provider Portal" : "Betting Site Portal"}
            </span>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default ProviderLayout;
