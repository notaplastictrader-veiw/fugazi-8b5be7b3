import { useEffect } from "react";

/**
 * Injects <meta name="robots" content="noindex, nofollow" /> for the current route.
 * Removes the tag on unmount so other routes remain indexable.
 * Use on private/auth/admin/dashboard/portal pages.
 */
const NoIndex = () => {
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"][data-noindex="route"]');
    if (existing) return;
    const el = document.createElement("meta");
    el.setAttribute("name", "robots");
    el.setAttribute("content", "noindex, nofollow");
    el.setAttribute("data-noindex", "route");
    document.head.appendChild(el);
    return () => {
      el.parentNode?.removeChild(el);
    };
  }, []);
  return null;
};

export default NoIndex;
