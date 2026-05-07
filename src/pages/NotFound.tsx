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
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src={logoSrc} alt="NAFT" className="w-16 h-16 drop-shadow-[0_0_16px_hsl(var(--primary)/0.3)]" />
          </div>
          <h1 className="mb-4 text-6xl font-display font-black text-foreground">404</h1>
          <p className="mb-2 text-lg text-muted-foreground">Oops! Page not found</p>
          <p className="mb-6 text-sm text-muted-foreground/70 font-mono break-all max-w-md">{location.pathname}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="inline-flex px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
              Return to Home
            </Link>
            <Link to="/brokers" className="inline-flex px-6 py-3 text-sm font-bold border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition">
              Browse Brokers
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
