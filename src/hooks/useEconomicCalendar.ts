import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EconomicCalendarEvent {
  id: string;
  name: string;
  title: string;
  date: string; // ISO UTC
  event_date: string;
  event_time: string | null;
  impact: "high" | "medium" | "low";
  currency: string;
  category: string;
  description: string;
  actual: string;
  forecast: string;
  previous: string;
  // legacy aliases used by existing UI
  actual_value: string;
  forecast_value: string;
  previous_value: string;
  ml_prediction?: "Bullish" | "Bearish" | "Neutral";
}

let sharedEvents: EconomicCalendarEvent[] = [];
let lastFetchedAt = 0;
let lastError: string | null = null;
let lastStale = false;
let inflight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

const REFRESH_MS = 12 * 60 * 60_000; // 12h — match server cache

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-economic-calendar",
      );
      if (error) throw error;
      if (data?.events && Array.isArray(data.events)) {
        sharedEvents = data.events as EconomicCalendarEvent[];
        lastFetchedAt = Date.now();
        lastError = data?.error ?? null;
        lastStale = Boolean(data?.stale);
        subscribers.forEach((cb) => cb());
      }
    } catch (err) {
      console.warn("[useEconomicCalendar] fetch failed:", err);
      lastError = "fetch_failed";
      subscribers.forEach((cb) => cb());
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicCalendarEvent[]>(sharedEvents);
  const [lastUpdated, setLastUpdated] = useState<number>(lastFetchedAt);
  const [error, setError] = useState<string | null>(lastError);
  const [stale, setStale] = useState<boolean>(lastStale);
  const [loading, setLoading] = useState<boolean>(sharedEvents.length === 0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setEvents(sharedEvents);
      setLastUpdated(lastFetchedAt);
      setError(lastError);
      setStale(lastStale);
      setLoading(false);
    };
    subscribers.add(sync);

    if (Date.now() - lastFetchedAt > REFRESH_MS || sharedEvents.length === 0) {
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

  return { events, loading, lastUpdated, error, stale };
}
