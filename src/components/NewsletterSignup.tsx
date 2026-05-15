import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";

const emailSchema = z.string().trim().email().max(255);

interface Props {
  source?: string;
  compact?: boolean;
}

const NewsletterSignup = ({ source = "footer", compact = false }: Props) => {
  const { locale } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data, source, locale });
    setLoading(false);
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      toast.error("Could not subscribe — try again");
      return;
    }
    setDone(true);
    toast.success("You're on the list. Check your inbox soon.");
  };

  if (done) {
    return (
      <div className={`flex items-center gap-2 text-sm text-primary font-mono ${compact ? "" : "py-3"}`}>
        <Check className="w-4 h-4" /> Subscribed — welcome aboard.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`flex w-full ${compact ? "" : "max-w-md"} gap-2`}>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          maxLength={255}
          className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-10 px-4 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
      </button>
    </form>
  );
};

export default NewsletterSignup;
