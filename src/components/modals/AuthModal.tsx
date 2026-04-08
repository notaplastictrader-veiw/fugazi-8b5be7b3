import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

const countries = [
  "United Kingdom", "India", "Pakistan", "Bangladesh", "UAE", "Saudi Arabia",
  "United States", "Canada", "Australia", "Nigeria", "South Africa", "Malaysia",
  "Singapore", "Philippines", "Indonesia", "Sri Lanka", "Nepal", "Kenya",
  "Ghana", "Egypt", "Turkey", "Germany", "France", "Netherlands", "Spain",
];

const AuthModal = ({ open, onClose, defaultTab = "login" }: AuthModalProps) => {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupCountry, setSignupCountry] = useState("United Kingdom");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      onClose();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: signupName, country: signupCountry },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to verify your account!");
      onClose();
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent!");
      setShowForgot(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 text-sm font-sans text-foreground bg-[rgba(255,255,255,0.04)] border border-border rounded-[9px] outline-none transition-colors focus:border-primary/40 placeholder:text-muted-foreground";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-[20px] w-full max-w-[460px] p-9 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {showForgot ? (
          /* Forgot Password View */
          <div>
            <h3 className="text-xl font-display font-extrabold text-foreground mb-2">
              Reset Password
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-display font-bold bg-primary text-primary-foreground rounded-[9px] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <button
              onClick={() => setShowForgot(false)}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Log In
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-8 border-b border-border">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
                    tab === t
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "login" ? "Log In" : "Sign Up"}
                  {tab === t && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={inputClass}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-display font-bold bg-primary text-primary-foreground rounded-[9px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full py-3 text-sm font-semibold border border-border text-foreground rounded-[9px] hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={signupCountry}
                  onChange={(e) => setSignupCountry(e.target.value)}
                  className={inputClass}
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-display font-bold bg-primary text-primary-foreground rounded-[9px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  By signing up you agree to our{" "}
                  <a href="/terms" className="text-primary hover:underline">Terms</a> and{" "}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
