import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import MainLayout from "@/components/layout/MainLayout";
import NoIndex from "@/components/seo/NoIndex";

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
              <header className="h-10 flex items-center mb-4 xl:hidden">
                <SidebarTrigger className="ml-1" />
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
