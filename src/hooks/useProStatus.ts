import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProStatus() {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setIsPro(false);
      setLoading(false);
      setSubscription(null);
      return;
    }
    supabase
      .from("pro_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setSubscription(data);
        const active =
          !!data &&
          ["active", "trial"].includes(data.status) &&
          (!data.expires_at || new Date(data.expires_at) > new Date());
        setIsPro(active);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  return { isPro, loading, subscription };
}
