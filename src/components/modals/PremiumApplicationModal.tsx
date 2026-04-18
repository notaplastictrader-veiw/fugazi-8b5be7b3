import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PremiumApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

const countries = [
  "United Kingdom", "India", "Pakistan", "Bangladesh", "UAE", "Saudi Arabia",
  "United States", "Canada", "Australia", "Nigeria", "South Africa", "Malaysia",
  "Singapore", "Philippines", "Indonesia", "Sri Lanka", "Nepal", "Kenya",
  "Ghana", "Egypt", "Turkey", "Germany", "France", "Netherlands", "Spain",
];

const PremiumApplicationModal = ({ open, onClose }: PremiumApplicationModalProps) => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [method, setMethod] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  const [profile, setProfile] = useState<{ full_name?: string | null; phone?: string | null; country?: string | null } | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, country")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data ?? null);
      if (data?.full_name) setFullName(data.full_name);
      if (data?.country) setCountry(data.country);
    })();
    return () => { cancelled = true; };
  }, [open, user]);

  // Prefill contact field when method changes
  useEffect(() => {
    if (!method) { setContactValue(""); setPrefilled(false); return; }
    let value = "";
    if (method === "email") value = user?.email ?? "";
    else if (method === "whatsapp" || method === "phone") value = profile?.phone ?? "";
    // telegram → leave empty
    setContactValue(value);
    setPrefilled(Boolean(value));
  }, [method, profile, user]);

  if (!open) return null;

  const inputClass =
    "w-full px-4 py-3 text-sm font-sans text-foreground bg-[rgba(255,255,255,0.04)] border border-border rounded-[9px] outline-none transition-colors focus:border-primary/40 placeholder:text-muted-foreground";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setAgreed(false);
    setMethod("");
    setContactValue("");
    setPrefilled(false);
    onClose();
  };

  const contactFieldConfig: Record<string, { type: string; placeholder: string; label: string }> = {
    telegram: { type: "text", placeholder: "@yourhandle or https://t.me/yourhandle", label: "Telegram username or link" },
    whatsapp: { type: "tel", placeholder: "e.g. +44 7700 900123", label: "WhatsApp number (with country code)" },
    email: { type: "email", placeholder: "you@example.com", label: "Email address" },
    phone: { type: "tel", placeholder: "e.g. +44 7700 900123", label: "Phone number (with country code)" },
  };

  const contactField = method ? contactFieldConfig[method] : null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-[20px] w-full max-w-[460px] p-9 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-extrabold text-foreground mb-2">
              Application Received
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              We review every application within 24 hours. If approved, you'll receive a payment link and onboarding instructions via email.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-2.5 text-sm font-semibold border border-border text-foreground rounded-[9px] hover:bg-secondary/50 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-display font-extrabold text-foreground mb-1">
              Apply for Premium Access
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              We review every application personally. Serious traders only.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
              <select
                required
                className={`${inputClass} bg-card text-foreground`}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">{c}</option>
                ))}
              </select>
              <select required className={`${inputClass} bg-card text-foreground`} defaultValue="">
                <option value="" disabled className="bg-card text-foreground">Trading Experience</option>
                <option value="beginner" className="bg-card text-foreground">Beginner (&lt;1 year)</option>
                <option value="intermediate" className="bg-card text-foreground">Intermediate (1–3 years)</option>
                <option value="advanced" className="bg-card text-foreground">Advanced (3+ years)</option>
                <option value="professional" className="bg-card text-foreground">Professional (5+ years)</option>
              </select>
              <input
                type="text"
                placeholder="Which broker are you currently trading with?"
                required
                className={inputClass}
              />
              <select required className={`${inputClass} bg-card text-foreground`} defaultValue="">
                <option value="" disabled className="bg-card text-foreground">Investment Capacity</option>
                <option value="under-500" className="bg-card text-foreground">Under $500</option>
                <option value="500-2000" className="bg-card text-foreground">$500 – $2,000</option>
                <option value="2000-10000" className="bg-card text-foreground">$2,000 – $10,000</option>
                <option value="10000-50000" className="bg-card text-foreground">$10,000 – $50,000</option>
                <option value="50000-plus" className="bg-card text-foreground">$50,000+</option>
              </select>
              <input
                type="text"
                placeholder="What do you do for a living? (Profession)"
                required
                className={inputClass}
              />
              <select
                required
                className={`${inputClass} bg-card text-foreground`}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="" disabled className="bg-card text-foreground">Preferred Communication Method</option>
                <option value="telegram" className="bg-card text-foreground">Telegram</option>
                <option value="whatsapp" className="bg-card text-foreground">WhatsApp</option>
                <option value="email" className="bg-card text-foreground">Email</option>
                <option value="phone" className="bg-card text-foreground">Phone Call</option>
              </select>

              {contactField && (
                <div className="space-y-1.5">
                  <input
                    type={contactField.type}
                    placeholder={contactField.placeholder}
                    required
                    value={contactValue}
                    onChange={(e) => { setContactValue(e.target.value); setPrefilled(false); }}
                    className={inputClass}
                    aria-label={contactField.label}
                  />
                  {prefilled && (
                    <p className="text-[11px] text-muted-foreground px-1">
                      Prefilled from your profile — edit if needed.
                    </p>
                  )}
                </div>
              )}

              <textarea
                placeholder="Tell us about your trading background and what you're looking for..."
                required
                rows={4}
                className={`${inputClass} resize-none`}
              />
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I understand premium access is a paid subscription
                </span>
              </label>
              <button
                type="submit"
                disabled={!agreed}
                className="w-full py-3 text-sm font-display font-bold bg-primary text-primary-foreground rounded-[9px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Application →
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumApplicationModal;
