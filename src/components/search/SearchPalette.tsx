import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Radio, Newspaper, AlertTriangle, BarChart3, Gift } from "lucide-react";
import { useGlobalSearch, SearchResult } from "@/hooks/useGlobalSearch";

const typeIcons: Record<string, typeof TrendingUp> = {
  broker: TrendingUp,
  signal: Radio,
  news: Newspaper,
  scam_alert: AlertTriangle,
  forecast: BarChart3,
  promotion: Gift,
};

const typeLabels: Record<string, string> = {
  broker: "Broker",
  signal: "Signal",
  news: "News",
  scam_alert: "Scam Alert",
  forecast: "Forecast",
  promotion: "Promotion",
};

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SearchPalette = ({ open, onClose, initialQuery = "" }: SearchPaletteProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { results, loading } = useGlobalSearch(query);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialQuery]);

  useEffect(() => setSelectedIndex(0), [results]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.url);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIndex]) { handleSelect(results[selectedIndex]); }
    else if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    if (open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search brokers, news, signals..."
            className="flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded mr-2">ESC</kbd>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {loading && <div className="px-4 py-6 text-sm text-muted-foreground text-center">Searching...</div>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">No results found for "{query}"</div>
          )}
          {!loading && results.length > 0 && (
            <ul className="py-1">
              {results.map((r, i) => {
                const Icon = typeIcons[r.type] || Search;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => handleSelect(r)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === selectedIndex ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{r.title}</span>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">{typeLabels[r.type]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && query.length < 2 && (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPalette;
