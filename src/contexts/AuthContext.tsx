import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(false);

        // Process pending broker claim after login/signup
        if (session?.user && _event === "SIGNED_IN") {
          const pendingBrokerId = sessionStorage.getItem("pending-broker-claim");
          if (pendingBrokerId) {
            sessionStorage.removeItem("pending-broker-claim");
            try {
              await supabase.from("user_roles").upsert(
                { user_id: session.user.id, role: "broker" as any },
                { onConflict: "user_id,role" }
              );
              const { data: existing } = await supabase.from("broker_profiles").select("id").eq("broker_id", pendingBrokerId).maybeSingle();
              if (existing) {
                await supabase.from("broker_profiles").update({ claim_status: "claimed", claimed_by: session.user.id }).eq("broker_id", pendingBrokerId);
              } else {
                await supabase.from("broker_profiles").insert({ broker_id: pendingBrokerId, claim_status: "claimed", claimed_by: session.user.id, tier: "basic" });
              }
              await supabase.from("profile_claims").insert({
                profile_id: pendingBrokerId,
                profile_type: "broker",
                claimed_by: session.user.id,
                status: "approved",
              });
            } catch (err) {
              console.error("Auto broker claim failed:", err);
            }
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
