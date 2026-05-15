import { useEffect, useState } from "react";
import { Headphones, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Digest {
  id: string;
  week_of: string;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
}

export default function AudioDigestPlayer() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    supabase
      .from("audio_digests")
      .select("id, week_of, title, audio_url, duration_seconds")
      .eq("status", "ready")
      .order("week_of", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.audio_url) setDigest(data as Digest);
      });
  }, []);

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  if (!digest) return null;

  const toggle = () => {
    if (!audio) {
      const a = new Audio(digest.audio_url);
      a.addEventListener("ended", () => setPlaying(false));
      a.play();
      setAudio(a);
      setPlaying(true);
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const mins = digest.duration_seconds ? Math.round(digest.duration_seconds / 60) : null;

  return (
    <div className="glass-card border border-primary/20 p-4 flex items-center gap-4">
      <Button onClick={toggle} size="icon" className="h-12 w-12 rounded-full flex-shrink-0">
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary mb-1">
          <Headphones className="h-3 w-3" /> NAFT Weekly Digest
          {mins && <span className="text-muted-foreground">· {mins} min</span>}
        </div>
        <p className="text-sm font-medium truncate">{digest.title}</p>
        <p className="text-xs text-muted-foreground">
          Week of {new Date(digest.week_of).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
