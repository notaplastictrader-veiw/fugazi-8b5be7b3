import { useEffect, useState } from "react";
import { Headphones, Play, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AudioDigestsAdmin() {
  const [digests, setDigests] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("audio_digests")
      .select("*")
      .order("week_of", { ascending: false })
      .limit(20);
    setDigests(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const generateNow = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-audio-digest", { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.skipped ? "Already generated this week" : "Audio digest generated");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const removeDigest = async (id: string) => {
    if (!confirm("Delete this digest?")) return;
    const { error } = await supabase.from("audio_digests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-condensed text-3xl uppercase tracking-tight flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" /> Weekly Audio Digest
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ElevenLabs TTS narrates the week's brokers, scams, forecasts, and news.
          </p>
        </div>
        <Button onClick={generateNow} disabled={generating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
          Generate this week
        </Button>
      </div>

      <div className="space-y-3">
        {digests.map((d) => (
          <div key={d.id} className="glass-card border border-border p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="font-semibold">{d.title}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Week of {d.week_of} · {d.status}
                  {d.duration_seconds && ` · ${Math.round(d.duration_seconds / 60)} min`}
                </p>
              </div>
              <div className="flex gap-2">
                {d.audio_url && (
                  <Button size="sm" variant="outline" onClick={() => new Audio(d.audio_url).play()}>
                    <Play className="h-3 w-3 mr-1" /> Play
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => removeDigest(d.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Script</summary>
              <p className="mt-2 whitespace-pre-wrap">{d.script}</p>
            </details>
            {d.error_message && (
              <p className="mt-2 text-xs text-destructive font-mono">⚠ {d.error_message}</p>
            )}
          </div>
        ))}
        {!digests.length && (
          <p className="text-sm text-muted-foreground">No digests yet. Click "Generate this week" to make the first one.</p>
        )}
      </div>
    </div>
  );
}
