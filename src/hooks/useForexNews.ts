import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ForexNewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number; // unix seconds
}

let sharedArticles: ForexNewsArticle[] = [];
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

const REFRESH_MS = 5 * 60_000; // 5 minutes

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-forex-news");
      if (error) throw error;
      if (data?.articles && Array.isArray(data.articles)) {
        sharedArticles = data.articles as ForexNewsArticle[];
        lastFetchedAt = Date.now();
        subscribers.forEach((cb) => cb());
      }
    } catch (err) {
      console.warn("[useForexNews] fetch failed:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useForexNews() {
  const [articles, setArticles] = useState<ForexNewsArticle[]>(sharedArticles);
  const [lastUpdated, setLastUpdated] = useState<number>(lastFetchedAt);
  const [loading, setLoading] = useState<boolean>(sharedArticles.length === 0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setArticles(sharedArticles);
      setLastUpdated(lastFetchedAt);
      setLoading(false);
    };
    subscribers.add(sync);

    if (Date.now() - lastFetchedAt > REFRESH_MS || sharedArticles.length === 0) {
      refresh().then(sync);
    } else {
      sync();
    }

    intervalRef.current = window.setInterval(() => {
      refresh();
    }, REFRESH_MS);

    return () => {
      subscribers.delete(sync);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return { articles, loading, lastUpdated };
}
