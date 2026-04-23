import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tickerPairs as fallbackPairs } from "@/data/brokers";

export interface TickerPair {
  pair: string;
  price: string;
  change: string;
  up: boolean;
}

// Module-level cache shared across all instances so multiple tickers
// (TickerBar + BottomTicker) only trigger a single fetch every 60s.
let sharedPairs: TickerPair[] = fallbackPairs;
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

const REFRESH_MS = 60_000;

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-live-prices");
      if (error) throw error;
      if (data?.prices && Array.isArray(data.prices) && data.prices.length > 0) {
        sharedPairs = data.prices as TickerPair[];
        lastFetchedAt = Date.now();
        subscribers.forEach((cb) => cb());
      }
    } catch (err) {
      console.warn("[useLivePrices] fetch failed, keeping last value:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useLivePrices() {
  const [pairs, setPairs] = useState<TickerPair[]>(sharedPairs);
  const [lastUpdated, setLastUpdated] = useState<number>(lastFetchedAt);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setPairs(sharedPairs);
      setLastUpdated(lastFetchedAt);
    };
    subscribers.add(sync);

    // Trigger fetch if cache is stale
    if (Date.now() - lastFetchedAt > REFRESH_MS) {
      refresh();
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

  return { pairs, lastUpdated };
}
