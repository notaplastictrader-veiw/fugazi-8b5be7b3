import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EconomicCalendarEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  impact: "high" | "medium" | "low";
  currency: string;
  category: string;
  actual_value: string;
  forecast_value: string;
  previous_value: string;
}

let sharedEvents: EconomicCalendarEvent[] = [];
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

const REFRESH_MS = 15 * 60_000; // 15 minutes

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-economic-calendar");
      if (error) throw error;
      if (data?.events && Array.isArray(data.events)) {
        sharedEvents = data.events as EconomicCalendarEvent[];
        lastFetchedAt = Date.now();
        subscribers.forEach((cb) => cb());
      }
    } catch (err) {
      console.warn("[useEconomicCalendar] fetch failed:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicCalendarEvent[]>(sharedEvents);
  const [lastUpdated, setLastUpdated] = useState<number>(lastFetchedAt);
  const [loading, setLoading] = useState<boolean>(sharedEvents.length === 0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setEvents(sharedEvents);
      setLastUpdated(lastFetchedAt);
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

  return { events, loading, lastUpdated };
}
