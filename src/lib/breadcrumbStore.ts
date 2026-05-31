// Tiny pub/sub so pages can override the auto-generated last breadcrumb label
// (e.g. /brokers/exness → "Brokers > Exness" using the real broker name from DB
// instead of the slug). Pages call setBreadcrumbLabel on mount/data-load and
// clear it on unmount; MainLayout subscribes via useSyncExternalStore.

import { useSyncExternalStore } from "react";

let currentLabel: string | null = null;
const subscribers = new Set<() => void>();

export const setBreadcrumbLabel = (label: string | null) => {
  if (currentLabel === label) return;
  currentLabel = label;
  subscribers.forEach((cb) => cb());
};

const subscribe = (cb: () => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};

export const useBreadcrumbLabel = (): string | null =>
  useSyncExternalStore(
    subscribe,
    () => currentLabel,
    () => null
  );
