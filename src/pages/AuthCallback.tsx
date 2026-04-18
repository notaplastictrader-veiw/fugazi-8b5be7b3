import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/**
 * /auth/callback
 *
 * Supabase email confirmation links land here. The Supabase JS client
 * automatically processes the URL hash (access_token / refresh_token) on
 * page load via `detectSessionInUrl: true`. We just wait for the resulting
 * session, then route the user to their dashboard.
 *
 * Also handles error states (expired link, invalid token) returned in the
 * URL hash by Supabase auth.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    // Surface auth errors that Supabase encodes in the hash
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.slice(1));
      const errDesc = params.get("error_description") || params.get("error") || "Verification link is invalid or expired.";
      toast.error(decodeURIComponent(errDesc.replace(/\+/g, " ")));
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    const finish = async (userId?: string) => {
      if (cancelled) return;
      toast.success("Email verified! You're signed in.");

      // Role-based redirect
      try {
        if (userId) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

          const roleSet = new Set((roles ?? []).map((r) => r.role));
          if (roleSet.has("super_admin") || roleSet.has("content_ops") || roleSet.has("moderator")) {
            navigate("/admin", { replace: true });
            return;
          }
          if (roleSet.has("broker")) { navigate("/portal/broker", { replace: true }); return; }
          if (roleSet.has("signal_provider")) { navigate("/portal/signal", { replace: true }); return; }
          if (roleSet.has("betting_site")) { navigate("/portal/betting", { replace: true }); return; }
        }
      } catch {
        // fall through to default
      }
      navigate("/dashboard", { replace: true });
    };

    // Listen for the SIGNED_IN event triggered after Supabase processes the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        finish(session.user.id);
      }
    });

    // Also check if a session is already established (some flows resolve sync)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish(session.user.id);
    });

    // Safety timeout — if nothing happens after 8s, send to login
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      setMessage("Taking longer than expected…");
      window.setTimeout(() => {
        if (!cancelled) navigate("/login", { replace: true });
      }, 2000);
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{message}</h1>
        <p className="text-sm text-muted-foreground">Please wait while we sign you in.</p>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6 mx-auto" />
          <Skeleton className="h-3 w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
