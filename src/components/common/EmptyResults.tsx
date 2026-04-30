import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  query?: string;
  onReset?: () => void;
  message?: string;
}

export function EmptyResults({ query, onReset, message }: Props) {
  return (
    <div className="text-center py-16 glass-card rounded-2xl">
      <SearchX className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
      <p className="text-foreground font-semibold mb-1">
        {message || (query ? `No results for "${query}"` : "No results found")}
      </p>
      <p className="text-xs text-muted-foreground mb-4">Try a different keyword or clear the search.</p>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset search
        </Button>
      )}
    </div>
  );
}
