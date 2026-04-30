import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SortOptionLite {
  value: string;
  label: string;
}

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  sort?: string;
  onSortChange?: (v: string) => void;
  sortOptions?: SortOptionLite[];
  rangeStart: number;
  rangeEnd: number;
  totalFiltered: number;
  totalAll: number;
  itemLabel?: string; // e.g. "brokers"
  searchPlaceholder?: string;
  className?: string;
}

export function ListingToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  sortOptions = [],
  rangeStart,
  rangeEnd,
  totalFiltered,
  totalAll,
  itemLabel = "results",
  searchPlaceholder = "Search...",
  className = "",
}: Props) {
  const hasQuery = query.length > 0;
  return (
    <div className={`mb-6 flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 pr-9 h-10"
            aria-label="Search"
          />
          {hasQuery && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary text-muted-foreground"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {sortOptions.length > 0 && onSortChange && (
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[200px] h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span>
          {totalFiltered === 0
            ? `No ${itemLabel} found`
            : `Showing ${rangeStart}\u2013${rangeEnd} of ${totalFiltered} ${itemLabel}`}
          {hasQuery && totalFiltered !== totalAll && ` (filtered from ${totalAll})`}
        </span>
        {hasQuery && totalFiltered === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQueryChange("")}
            className="h-6 text-[11px]"
          >
            Reset search
          </Button>
        )}
      </div>
    </div>
  );
}
