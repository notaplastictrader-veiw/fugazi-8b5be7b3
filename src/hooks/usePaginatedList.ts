import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type SortOption<T> = {
  value: string;
  label: string;
  /** Comparator: positive => a after b, negative => a before b. */
  compare: (a: T, b: T) => number;
};

export interface UsePaginatedListOptions<T> {
  /** Property names searched (case-insensitive substring) when query is non-empty. */
  searchKeys?: Array<keyof T | string>;
  /** Custom search predicate; overrides searchKeys when provided. */
  searchFn?: (item: T, query: string) => boolean;
  /** Sort options shown in the toolbar dropdown. First entry is the default. */
  sortOptions?: SortOption<T>[];
  /** Items per page. Defaults to 12. */
  pageSize?: number;
  /** URL param namespace (useful when two paginated lists live on the same route). */
  paramPrefix?: string;
}

export interface UsePaginatedListResult<T> {
  visibleItems: T[];
  filteredItems: T[];
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
  totalFiltered: number;
  totalAll: number;
  pageSize: number;
  query: string;
  setQuery: (q: string) => void;
  sort: string;
  setSort: (s: string) => void;
  sortOptions: SortOption<T>[];
  reset: () => void;
  rangeStart: number; // 1-indexed first item shown
  rangeEnd: number;   // 1-indexed last item shown
}

/**
 * Client-side pagination + search + sort with URL sync (?page, ?q, ?sort).
 * Designed to be a drop-in replacement for `items.map(...)` in listing pages.
 */
export function usePaginatedList<T>(
  items: T[],
  options: UsePaginatedListOptions<T> = {},
): UsePaginatedListResult<T> {
  const {
    searchKeys = [],
    searchFn,
    sortOptions = [],
    pageSize = 12,
    paramPrefix = "",
  } = options;

  const [params, setParams] = useSearchParams();
  const k = (name: string) => (paramPrefix ? `${paramPrefix}_${name}` : name);

  const query = params.get(k("q")) ?? "";
  const sort = params.get(k("sort")) ?? sortOptions[0]?.value ?? "";
  const pageParam = parseInt(params.get(k("page")) ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const setQuery = (q: string) => {
    const next = new URLSearchParams(params);
    if (!q) next.delete(k("q"));
    else next.set(k("q"), q);
    next.delete(k("page")); // reset to page 1 on new search
    setParams(next, { replace: true });
  };

  const setSort = (s: string) => {
    const next = new URLSearchParams(params);
    if (!s) next.delete(k("sort"));
    else next.set(k("sort"), s);
    next.delete(k("page"));
    setParams(next, { replace: true });
  };

  const setPage = (n: number) => {
    updateParam(k("page"), n > 1 ? String(n) : null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const reset = () => {
    const next = new URLSearchParams(params);
    next.delete(k("q"));
    next.delete(k("page"));
    next.delete(k("sort"));
    setParams(next, { replace: true });
  };

  const filteredItems = useMemo(() => {
    let list = items;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        if (searchFn) return searchFn(item, q);
        return searchKeys.some((key) => {
          const v = (item as any)?.[key as string];
          if (v == null) return false;
          if (Array.isArray(v)) return v.some((x) => String(x).toLowerCase().includes(q));
          return String(v).toLowerCase().includes(q);
        });
      });
    }
    const sortDef = sortOptions.find((o) => o.value === sort);
    if (sortDef) list = [...list].sort(sortDef.compare);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, sort]);

  const totalFiltered = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // If the active page falls outside the new range (e.g. after filtering),
  // snap back to the last valid page silently.
  useEffect(() => {
    if (page > totalPages) {
      updateParam(k("page"), totalPages > 1 ? String(totalPages) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visibleItems = filteredItems.slice(start, start + pageSize);

  return {
    visibleItems,
    filteredItems,
    page: safePage,
    setPage,
    totalPages,
    totalFiltered,
    totalAll: items.length,
    pageSize,
    query,
    setQuery,
    sort,
    setSort,
    sortOptions,
    reset,
    rangeStart: totalFiltered === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, totalFiltered),
  };
}
