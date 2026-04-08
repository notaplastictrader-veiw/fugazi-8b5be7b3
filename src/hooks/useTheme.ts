import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "dasara";

const THEME_KEY = "napt-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(THEME_KEY) as Theme) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((t) => {
      if (t === "dark") return "light";
      if (t === "light") return "dasara";
      return "dark";
    });
  };

  return { theme, setTheme, cycleTheme };
}
