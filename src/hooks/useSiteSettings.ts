import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache: Record<string, any> = {};

export function useSiteSettings<T = any>(key: string, fallback: T): T {
  const [value, setValue] = useState<T>(() => cache[key] ?? fallback);

  useEffect(() => {
    if (cache[key] !== undefined) {
      setValue(cache[key]);
      return;
    }
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          cache[key] = data.value;
          setValue(data.value as T);
        }
      });
  }, [key]);

  return value;
}
