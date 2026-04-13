import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmissionStatus } from "@/data/tradingIdeas";
import { toast } from "sonner";

const statusColors: Record<SubmissionStatus, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  read: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  done: "bg-green-500/15 text-green-400 border-green-500/30",
  wont_do: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<SubmissionStatus, string> = {
  new: "New", read: "Read", in_progress: "In Progress", done: "Done", wont_do: "Won't Do",
};

const sampleSubmissions = [
  { id: "s1", userId: "u1", username: "TraderMike", category: "bug" as const, title: "Chart not loading on mobile Safari", body: "The chart component fails to render on Safari iOS 17. Getting a blank white area.", status: "new" as SubmissionStatus, createdAt: "2025-07-10T10:00:00Z" },
  { id: "s2", userId: "u2", username: "FXQueen", category: "feature" as const, title: "Add social login with Apple", body: "Would love to sign in with my Apple ID instead of email.", status: "read" as SubmissionStatus, createdAt: "2025-07-09T14:30:00Z" },
  { id: "s3", userId: "u3", username: "CryptoKhan", category: "content" as const, title: "Add Bybit review", body: "Bybit is very popular in the crypto space. Would be great to have a full review.", status: "in_progress" as SubmissionStatus, createdAt: "2025-07-08T09:15:00Z" },
  { id: "s4", userId: "u4", username: "ScalpMaster", category: "bug" as const, title: "Notification bell count wrong", body: "Shows 5 notifications but only 3 are visible when I click.", status: "done" as SubmissionStatus, createdAt: "2025-07-07T16:00:00Z" },
];

const SubmissionsAdmin = () => {
  const [submissions, setSubmissions] = useState(sampleSubmissions);
  const [filterCategory, setFilterCategory] = useState("all");

  const updateStatus = (id: string, status: SubmissionStatus) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success(`Status updated to "${statusLabels[status]}"`);
  };

  const filtered = filterCategory === "all" ? submissions : submissions.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Private Submissions</h1>
          <p className="text-sm text-muted-foreground">Bug reports, feature requests & content suggestions</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "bug", "feature", "content"].map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === c ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(sub => (
          <Card key={sub.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] capitalize">{sub.category}</Badge>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[sub.status]}`}>
                      {statusLabels[sub.status]}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{sub.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{sub.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    by {sub.username} · {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Select value={sub.status} onValueChange={v => updateStatus(sub.id, v as SubmissionStatus)}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(statusLabels) as [SubmissionStatus, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubmissionsAdmin;
