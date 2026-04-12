import { useLocation } from "react-router-dom";
import { useEffect } from "react";
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img src={logoSrc} alt="NAFT" className="w-16 h-16 drop-shadow-[0_0_16px_hsl(var(--primary)/0.3)]" />
        </div>
        <h1 className="mb-4 text-6xl font-display font-black text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-flex px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
