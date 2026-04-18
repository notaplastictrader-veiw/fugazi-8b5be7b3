import { useState } from "react";
import { X, Check } from "lucide-react";

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
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-[20px] w-full max-w-[460px] p-9 relative"
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
                className={inputClass}
              />
              <select required className={`${inputClass} bg-card text-foreground`} defaultValue="United Kingdom">
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
              <select required className={`${inputClass} bg-card text-foreground`} defaultValue="">
                <option value="" disabled className="bg-card text-foreground">Preferred Communication Method</option>
                <option value="telegram" className="bg-card text-foreground">Telegram</option>
                <option value="whatsapp" className="bg-card text-foreground">WhatsApp</option>
                <option value="email" className="bg-card text-foreground">Email</option>
                <option value="phone" className="bg-card text-foreground">Phone Call</option>
              </select>
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
