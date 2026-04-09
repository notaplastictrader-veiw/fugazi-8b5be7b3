import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _role: "super_admin",
      });
      setIsAdmin(!!data && !error);
      setLoading(false);
    };

    checkRole();
  }, [user, authLoading]);

  return { isAdmin, loading, user };
};
