import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { useTheme } from "@/hooks/useTheme";

const NotFound = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const logoSrc = theme === "light"
    ? "/images/naft-candlestick-light-green.svg"
    : theme === "sentinel"
      ? "/images/naft-candlestick-dark-red.svg"
      : "/images/naft-candlestick-dark-lime.svg";

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" />
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="text-center max-w-xl">
          <div className="flex justify-center mb-6">
            <img src={logoSrc} alt="NAFT" className="w-16 h-16 drop-shadow-[0_0_16px_hsl(var(--primary)/0.3)]" />
          </div>
          <h1 className="mb-3 text-7xl font-display font-black text-foreground tracking-tight">404</h1>
          <p className="mb-2 text-lg text-foreground font-semibold">This page is a Fugazi.</p>
          <p className="mb-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
          <p className="mb-8 text-xs text-muted-foreground/60 font-mono break-all">{location.pathname}</p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link to="/" className="inline-flex px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
              Return to Home
            </Link>
            <button
              onClick={() => (window as any).__openGlobalSearch?.("")}
              className="inline-flex px-6 py-3 text-sm font-bold border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition"
            >
              Search the site
            </button>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-[10px] font-mono text-muted-foreground mb-3 tracking-widest uppercase">// Popular destinations</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link to="/brokers" className="px-3 py-2 text-xs font-semibold border border-border/50 rounded-lg hover:border-primary/40 hover:text-primary transition-colors">Brokers</Link>
              <Link to="/scam-alerts" className="px-3 py-2 text-xs font-semibold border border-border/50 rounded-lg hover:border-destructive/40 hover:text-destructive transition-colors">Scam Alerts</Link>
              <Link to="/signals" className="px-3 py-2 text-xs font-semibold border border-border/50 rounded-lg hover:border-primary/40 hover:text-primary transition-colors">Signals</Link>
              <Link to="/calendar" className="px-3 py-2 text-xs font-semibold border border-border/50 rounded-lg hover:border-accent/40 hover:text-accent transition-colors">Calendar</Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
