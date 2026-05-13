import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket: "logos" | "media" | "avatars";
  folder?: string;
  maxSizeMB?: number;
  label?: string;
  accept?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  bucket,
  folder = "",
  maxSizeMB = 2,
  label = "Image",
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMB}MB`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = folder ? `${folder}/${filename}` : filename;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative w-20 h-20 rounded-md border border-border overflow-hidden bg-muted/30 flex-shrink-0">
            <img loading="lazy" decoding="async" src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0.5 right-0.5 bg-destructive/90 text-destructive-foreground rounded p-0.5"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-md border border-dashed border-border flex items-center justify-center bg-muted/20 flex-shrink-0">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
              {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
          <Input
            placeholder="…or paste image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
