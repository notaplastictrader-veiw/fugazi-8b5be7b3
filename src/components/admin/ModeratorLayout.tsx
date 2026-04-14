import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeratorSidebar } from "./ModeratorSidebar";
import { Shield } from "lucide-react";

const ModeratorLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background hud-grid-bg">
        <ModeratorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center px-4 border-b border-[hsl(210,100%,50%)]/10 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-[hsl(210,100%,50%)] transition-colors" />
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" style={{ color: "hsl(210, 100%, 50%)" }} />
              <h1 className="text-sm font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-widest">
                Moderator Panel
              </h1>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ModeratorLayout;
