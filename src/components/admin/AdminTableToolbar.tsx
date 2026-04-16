import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AdminTableToolbarProps {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onExport: () => void;
  exportLabel?: string;
}

const AdminTableToolbar = ({ fromDate, toDate, onFromChange, onToChange, onExport, exportLabel = "Download Excel" }: AdminTableToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
        <Input type="date" value={fromDate} onChange={e => onFromChange(e.target.value)} className="w-40" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
        <Input type="date" value={toDate} onChange={e => onToChange(e.target.value)} className="w-40" />
      </div>
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="w-4 h-4 mr-1" />
        {exportLabel}
      </Button>
    </div>
  );
};

export default AdminTableToolbar;
