import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-accent/20 text-accent-foreground border-accent/30",
  published: "bg-primary/20 text-primary border-primary/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant="outline" className={statusStyles[status] || statusStyles.draft}>
    {status}
  </Badge>
);
