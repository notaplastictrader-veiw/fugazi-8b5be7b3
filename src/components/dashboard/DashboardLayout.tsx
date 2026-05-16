import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import MainLayout from "@/components/layout/MainLayout";
import NoIndex from "@/components/seo/NoIndex";
import { Home } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <NoIndex />
      <div className="pt-24 pb-20">
        <SidebarProvider>
          <div className="min-h-[calc(100vh-8rem)] flex w-full max-w-7xl mx-auto px-4">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-auto">
              <header className="h-10 flex items-center justify-between mb-4 gap-2">
                <SidebarTrigger className="ml-1 xl:hidden" />
                <Link
                  to="/"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-card hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Back to Home</span>
                </Link>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </MainLayout>
  );
};

export default DashboardLayout;
