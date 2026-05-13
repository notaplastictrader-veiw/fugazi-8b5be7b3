import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import PromoTicker from "@/components/sections/PromoTicker";
import TickerBar from "@/components/sections/TickerBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import ExitIntentModal from "@/components/ExitIntentModal";

const routeNames: Record<string, string> = {
  brokers: "Broker Reviews",
  "prop-firms": "Prop Firms",
  "scam-alerts": "Scam Alerts",
  signals: "Signals",
  about: "About",
  contact: "Contact",
  compare: "Compare",
  education: "Education",
  promotions: "Promotions",
  news: "News",
  calendar: "Calendar",
  sports: "Sports",
  ideas: "Ideas",
  partnership: "Partnership",
  terms: "Terms",
  privacy: "Privacy",
  cookies: "Cookies",
  advertise: "Advertise",
  forecasts: "Forecasts",
  login: "Login",
  signup: "Sign Up",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  dashboard: "Dashboard",
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isHome = pathSegments.length === 0;
  const isDashboard = pathSegments[0] === "dashboard";

  const getPageName = () => {
    if (pathSegments.length === 0) return "";
    const first = pathSegments[0];
    return routeNames[first] || first.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed top system: promo (34px) + nav (58px) = 92px */}
      <div className="fixed top-0 left-0 right-0 z-[200]">
        <PromoTicker />
      </div>
      <Navbar />
      <main className="flex-1 pb-[90px] md:pb-[32px]" style={{ paddingTop: "92px" }}>
        {!isHome && (
          <div className="bg-secondary/40 backdrop-blur-sm border-b border-border/50">
            <div className="container mx-auto px-4 flex items-center gap-2 h-8 text-xs">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <span className="text-border">|</span>
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-foreground font-medium">{getPageName()}</span>
            </div>
          </div>
        )}
        {children}
      </main>
      {!isDashboard && <Footer />}
      {/* Fixed bottom ticker */}
      <div className="fixed bottom-0 left-0 right-0 z-[200]">
        <TickerBar />
      </div>
      {!isDashboard && <MobileBottomNav />}
      {!isDashboard && <ExitIntentModal />}
    </div>
  );
};

export default MainLayout;
