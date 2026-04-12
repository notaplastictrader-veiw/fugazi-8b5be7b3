import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "sentinel";

const THEME_KEY = "naft-theme";

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
      if (t === "light") return "sentinel";
      return "dark";
    });
  };

  return { theme, setTheme, cycleTheme };
}
