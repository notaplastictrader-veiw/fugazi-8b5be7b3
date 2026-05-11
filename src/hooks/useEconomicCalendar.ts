import { useEffect, useState } from "react";
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
  actual_value: string;
  forecast_value: string;
  previous_value: string;
  ml_prediction?: "Bullish" | "Bearish" | "Neutral";
  specs?: EventSpecs | null;
}

export interface EventSpecs {
  source?: string;
  measures?: string;
  usualEffect?: string;
  frequency?: string;
  nextRelease?: string;
  ffNotes?: string;
  whyTradersCare?: string;
  alsoCalled?: string;
  ffUrl?: string;
}

let sharedEvents: EconomicCalendarEvent[] = [];
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;
let realtimeBound = false;
const subscribers = new Set<() => void>();

function mapRow(r: any): EconomicCalendarEvent {
  const time = r.event_time ? String(r.event_time).slice(0, 5) : null;
  return {
    id: `db-${r.id}`,
    name: r.title,
    title: r.title,
    date: `${r.event_date}T${time ?? "00:00"}:00.000Z`,
    event_date: r.event_date,
    event_time: time,
    impact: (r.impact as any) || "medium",
    currency: (r.currency || "").toUpperCase(),
    category: r.category || "economic",
    description: r.description || "",
    actual: r.actual_value || "",
    forecast: r.forecast_value || "",
    previous: r.previous_value || "",
    actual_value: r.actual_value || "",
    forecast_value: r.forecast_value || "",
    previous_value: r.previous_value || "",
    specs: r.specs && typeof r.specs === "object" ? (r.specs as EventSpecs) : null,
  };
}

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending: true });
      if (error) throw error;
      sharedEvents = (data ?? []).map(mapRow);
      lastFetchedAt = Date.now();
      subscribers.forEach((cb) => cb());
    } catch (err) {
      console.warn("[useEconomicCalendar] fetch failed:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function bindRealtime() {
  if (realtimeBound) return;
  realtimeBound = true;
  supabase
    .channel("calendar_events_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "calendar_events" },
      () => {
        refresh();
      },
    )
    .subscribe();
}

export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicCalendarEvent[]>(sharedEvents);
  const [lastUpdated, setLastUpdated] = useState<number>(lastFetchedAt);
  const [loading, setLoading] = useState<boolean>(sharedEvents.length === 0);

  useEffect(() => {
    const sync = () => {
      setEvents(sharedEvents);
      setLastUpdated(lastFetchedAt);
      setLoading(false);
    };
    subscribers.add(sync);
    bindRealtime();
    if (sharedEvents.length === 0) {
      refresh().then(sync);
    } else {
      sync();
    }
    return () => {
      subscribers.delete(sync);
    };
  }, []);

  return { events, loading, lastUpdated, error: null as string | null, stale: false };
}
