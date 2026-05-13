import { supabase } from "@/integrations/supabase/client";

interface ErrorPayload {
  message: string;
  stack?: string;
  route?: string;
  severity?: "error" | "warning" | "info";
}

const APP_VERSION = "1.0.0";
const recentlyLogged = new Set<string>();

export async function reportClientError(payload: ErrorPayload) {
  try {
    const key = (payload.message || "").slice(0, 200);
    if (recentlyLogged.has(key)) return;
    recentlyLogged.add(key);
    setTimeout(() => recentlyLogged.delete(key), 60_000);

    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("client_error_log").insert({
      user_id: userData.user?.id ?? null,
      message: (payload.message || "Unknown error").slice(0, 2000),
      stack: (payload.stack || "").slice(0, 8000),
      route: payload.route ?? (typeof window !== "undefined" ? window.location.pathname : ""),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : "",
      app_version: APP_VERSION,
      severity: payload.severity ?? "error",
    });
  } catch {
    /* swallow — never let logging break the app */
  }
}

export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;
  if ((window as any).__naft_error_handlers_installed) return;
  (window as any).__naft_error_handlers_installed = true;

  window.addEventListener("error", (e) => {
    reportClientError({
      message: e.message || "window.error",
      stack: e.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason: any = e.reason;
    reportClientError({
      message: reason?.message || String(reason || "unhandledrejection"),
      stack: reason?.stack,
    });
  });
}
