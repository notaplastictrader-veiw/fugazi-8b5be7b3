import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isForexOpen } from "@/lib/marketHours";

export interface TickerPair {
  pair: string;
  price: string;
  change: string;
  up: boolean;
  type?: "forex" | "crypto";
  closed?: boolean;
}

let sharedPairs: TickerPair[] = [];
let sharedRateLimited = false;
let sharedForexOpen = isForexOpen();
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

const REFRESH_MS = 300_000;
const RATE_LIMIT_RETRY_MS = 300_000;

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-live-prices");
      if (error) throw error;
      if (typeof data?.forex_open === "boolean") {
        sharedForexOpen = data.forex_open;
      } else {
        sharedForexOpen = isForexOpen();
      }
      if (data?.prices && Array.isArray(data.prices) && data.prices.length > 0) {
        sharedPairs = data.prices as TickerPair[];
        sharedRateLimited = false;
        lastFetchedAt = Date.now();
      } else if (data?.rate_limited) {
        sharedRateLimited = true;
        sharedPairs = [];
      } else {
        sharedRateLimited = true;
        sharedPairs = [];
      }
      subscribers.forEach((cb) => cb());
    } catch (err) {
      console.warn("[useLivePrices] fetch failed:", err);
      sharedRateLimited = true;
      sharedPairs = [];
      subscribers.forEach((cb) => cb());
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useLivePrices() {
  const [pairs, setPairs] = useState<TickerPair[]>(sharedPairs);
  const [rateLimited, setRateLimited] = useState<boolean>(sharedRateLimited);
  const [lastUpdated, setLastUpdated] = useState<number>(lastFetchedAt);
  const [forexOpen, setForexOpen] = useState<boolean>(sharedForexOpen);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setPairs(sharedPairs);
      setRateLimited(sharedRateLimited);
      setLastUpdated(lastFetchedAt);
      setForexOpen(sharedForexOpen);
    };
    subscribers.add(sync);

    if (sharedPairs.length === 0 || Date.now() - lastFetchedAt > REFRESH_MS) {
      refresh();
    } else {
      sync();
    }

    const tick = () => {
      const ms = sharedRateLimited ? RATE_LIMIT_RETRY_MS : REFRESH_MS;
      intervalRef.current = window.setTimeout(async () => {
        await refresh();
        tick();
      }, ms);
    };
    tick();

    return () => {
      subscribers.delete(sync);
      if (intervalRef.current) window.clearTimeout(intervalRef.current);
    };
  }, []);

  return { pairs, lastUpdated, rateLimited, forexOpen };
}
