import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UpcomingMatch {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  status: string;
}

export interface ResultMatch extends UpcomingMatch {
  homeScore: number | null;
  awayScore: number | null;
}

interface SportsPayload {
  upcoming: UpcomingMatch[];
  results: ResultMatch[];
  stale: boolean;
  fetchedAt: number;
}

let sharedUpcoming: UpcomingMatch[] = [];
let sharedResults: ResultMatch[] = [];
let sharedStale = false;
let lastFetchedAt = 0;
let inflight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

const REFRESH_MS = 10 * 60_000; // 10 minutes

async function refresh() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-sports-data");
      if (error) throw error;
      const payload = data as SportsPayload;
      if (payload && Array.isArray(payload.upcoming) && Array.isArray(payload.results)) {
        sharedUpcoming = payload.upcoming;
        sharedResults = payload.results;
        sharedStale = Boolean(payload.stale);
        lastFetchedAt = Date.now();
        subscribers.forEach((cb) => cb());
      }
    } catch (err) {
      console.warn("[useSportsSchedule] fetch failed:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useSportsSchedule() {
  const [upcoming, setUpcoming] = useState<UpcomingMatch[]>(sharedUpcoming);
  const [results, setResults] = useState<ResultMatch[]>(sharedResults);
  const [stale, setStale] = useState(sharedStale);
  const [lastFetched, setLastFetched] = useState(lastFetchedAt);
  const [loading, setLoading] = useState(sharedUpcoming.length === 0 && sharedResults.length === 0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setUpcoming(sharedUpcoming);
      setResults(sharedResults);
      setStale(sharedStale);
      setLastFetched(lastFetchedAt);
      setLoading(false);
    };
    subscribers.add(sync);

    if (Date.now() - lastFetchedAt > REFRESH_MS || (sharedUpcoming.length === 0 && sharedResults.length === 0)) {
      refresh().then(sync);
    } else {
      sync();
    }

    intervalRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetchedAt > REFRESH_MS) {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      subscribers.delete(sync);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    upcoming,
    results,
    stale,
    lastFetched,
    loading,
    refresh: () => refresh(),
  };
}
