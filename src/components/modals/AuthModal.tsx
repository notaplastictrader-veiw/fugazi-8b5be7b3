import { useState, useEffect } from "react";
import { X, Check, ChevronDown, Loader2, User, Radio, Building2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { countries } from "@/data/countries";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";


interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
  defaultRole?: SignupRole;
}

type SignupRole = "user" | "signal_provider" | "broker" | "betting_site";

const roleLabels: Record<SignupRole, string> = {
  user: "Trader",
  signal_provider: "Signal Provider",
  broker: "Broker",
  betting_site: "Betting Site",
};

const roleHelpers: Record<SignupRole, { icon: typeof User; text: string }> = {
  user: { icon: User, text: "Join as a Trader — review brokers, share experiences, build reputation." },
  signal_provider: { icon: Radio, text: "Join as a Signal Provider — list your channel and reach traders. Application reviewed in 24–48h." },
  broker: { icon: Building2, text: "Join as a Broker — claim or list your brokerage. Application reviewed in 24–48h." },
  betting_site: { icon: Trophy, text: "Join as a Betting Site — list your sportsbook. Application reviewed in 24–48h." },
};

const AuthModal = ({ open, onClose, defaultTab = "login" }: AuthModalProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showUnderReview, setShowUnderReview] = useState(false);
  

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup common
  const [signupRole, setSignupRole] = useState<SignupRole>("user");
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === "GB") || countries[0]);
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Role-specific fields
  const [telegramLink, setTelegramLink] = useState("");
  const [description, setDescription] = useState("");
  const [trackRecord, setTrackRecord] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [regulation, setRegulation] = useState("");
  const [license, setLicense] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Forgot
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  if (!open) return null;

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch)
  );

  const redirectAfterLogin = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r) => r.role));

    if (roleSet.has("super_admin") || roleSet.has("content_ops") || roleSet.has("moderator")) {
      onClose(); navigate("/admin"); return;
    }
    if (roleSet.has("broker")) { onClose(); navigate("/portal/broker"); return; }
    if (roleSet.has("signal_provider")) { onClose(); navigate("/portal/signal"); return; }
    if (roleSet.has("betting_site")) { onClose(); navigate("/portal/betting"); return; }
    onClose();
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(loginEmail)) {
      toast.error("Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      setLoading(false);
      if (error.message?.toLowerCase().includes("email not confirmed")) {
        toast.error("Please verify your email to complete your sign up. Check your inbox.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Logged in!");
    if (data.user) {
      await redirectAfterLogin(data.user.id);
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(signupEmail)) {
      toast.error("Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    if (!acceptedTerms) { toast.error("You must accept the Terms & Conditions"); return; }
    if (signupPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName, country: selectedCountry.code, country_name: selectedCountry.name, phone: `${selectedCountry.dialCode}${phone}` },
      },
    });
    
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

      // Profile is created by the database trigger with all signup data

    if (data.user) {
      if (signupRole !== "user") {
        const appData: Record<string, string> = {};
        if (signupRole === "signal_provider") {
          appData.telegram_link = telegramLink;
          appData.description = description;
          appData.track_record = trackRecord;
        } else if (signupRole === "broker") {
          appData.company_name = companyName;
          appData.website = website;
          appData.regulation = regulation;
          appData.license = license;
          appData.contact_person = contactPerson;
        } else if (signupRole === "betting_site") {
          appData.platform_name = companyName;
          appData.website = website;
          appData.license = license;
        }

        const { error: appError } = await supabase.rpc("submit_application" as any, {
          _user_id: data.user.id,
          _role: signupRole,
          _application_data: appData,
          _contact_email: signupEmail,
          _contact_phone: `${selectedCountry.dialCode}${phone}`,
          _contact_telegram: telegramLink || null,
        });

        if (appError) {
          console.error("Application submission failed:", appError);
          toast.error(appError.message || "Failed to submit application. Please try again or contact support.");
          setLoading(false);
          return;
        }

        // Admin notification is handled by database trigger
        setLoading(false);
        setShowUnderReview(true);
        return;
      }
    }

    if (data.user) {
      const refCode = sessionStorage.getItem("ref-tracked-code");
      if (refCode) {
        const { data: ownerId } = await supabase.rpc("convert_referral" as any, { code_text: refCode });
        if (ownerId) {
          await supabase.from("notifications").insert({
            user_id: ownerId,
            type: "referral",
            title: "New Referral Conversion!",
            message: "Someone you referred just signed up. Keep sharing!",
            link: "/dashboard/referrals",
          });
        }
        sessionStorage.removeItem("ref-tracked-code");
      }
    }

    // Force sign out to prevent auto-login before email verification
    await supabase.auth.signOut();
    setLoading(false);
    toast.success("Check your email to verify your account!");
    onClose();
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Reset link sent!"); setShowForgot(false); }
  };

  const inputClass = "w-full px-4 py-3 text-sm text-foreground bg-[rgba(255,255,255,0.04)] border border-border rounded-xl outline-none transition-colors focus:border-primary/40 placeholder:text-muted-foreground";

  // Under review screen
  if (showUnderReview) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
        <div className="bg-card border border-border rounded-2xl w-full max-w-md p-9 relative text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Application Submitted!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your <span className="text-primary font-semibold">{roleLabels[signupRole]}</span> account is under review. We'll contact you within 24-48 hours.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Need faster response? Contact us via{" "}
            <a href="https://t.me/notaplastictrader" target="_blank" rel="noopener" className="text-primary hover:underline">Telegram</a>
          </p>
          <button onClick={() => { setShowUnderReview(false); onClose(); }} className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>

        {/* Brand Logo */}
        <div className="flex justify-center mb-5">
          <img
            src={theme === "light" ? "/images/naft-candlestick-light-green.svg" : theme === "sentinel" ? "/images/naft-candlestick-dark-red.svg" : "/images/naft-candlestick-dark-lime.svg"}
            alt="NAFT"
            className="w-10 h-10"
          />
        </div>

        {showForgot ? (
          <div>
            <h3 className="text-xl font-display font-extrabold text-foreground mb-2">Reset Password</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleForgot} className="space-y-4">
              <input type="email" placeholder="Email address" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputClass} />
              <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <button onClick={() => setShowForgot(false)} className="mt-4 text-xs text-muted-foreground hover:text-foreground">← Back to Log In</button>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-4 border-b border-border">
              {(["login", "signup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t === "login" ? "Log In" : "Sign Up"}
                  {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Sign in to your account — we'll route you to the right dashboard.
                </p>

                <input type="email" placeholder="Email address" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
                <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} />
                <div className="flex justify-end">
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all bg-primary text-primary-foreground">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Log In"}
                </button>
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" />
                </div>
                <button type="button" onClick={handleGoogle} className="w-full py-3 text-sm font-semibold border border-border text-foreground rounded-xl hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Role Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-secondary/50 rounded-xl">
                  {(Object.keys(roleLabels) as SignupRole[]).map((role) => (
                    <button key={role} type="button" onClick={() => setSignupRole(role)}
                      className={`px-2 py-2 text-[11px] font-semibold rounded-lg transition-colors ${signupRole === role ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>

                {/* Role helper message */}
                {(() => {
                  const { icon: HelperIcon, text } = roleHelpers[signupRole];
                  return (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <HelperIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  );
                })()}

                {/* Common Fields */}
                <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                <input type="email" placeholder="Email address" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={inputClass} />
                <input type="password" placeholder="Password (min 6 characters)" required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className={inputClass} />

                {/* Phone with country code */}
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="flex items-center gap-1 px-3 py-3 text-sm border border-border rounded-xl bg-[rgba(255,255,255,0.04)] text-foreground min-w-[100px]">
                      <span>{selectedCountry.flag}</span>
                      <span className="text-xs">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                        <div className="sticky top-0 bg-card p-2 border-b border-border">
                          <input type="text" placeholder="Search country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none" />
                        </div>
                        {filteredCountries.map((c) => (
                          <button key={c.code + c.dialCode} type="button" onClick={() => { setSelectedCountry(c); setCountryDropdownOpen(false); setCountrySearch(""); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                            <span>{c.flag}</span>
                            <span className="flex-1 text-left">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} flex-1`} />
                </div>

                {/* Country */}
                <div className="relative">
                  <select value={selectedCountry.code} onChange={(e) => { const c = countries.find(cc => cc.code === e.target.value); if (c) setSelectedCountry(c); }} className={`${inputClass} bg-card text-foreground`}>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code} className="bg-card text-foreground">{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Signal Provider Fields */}
                {signupRole === "signal_provider" && (
                  <>
                    <input type="url" placeholder="Telegram channel/group link" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} className={inputClass} />
                    <textarea placeholder="Brief description of your signal service" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
                    <input type="text" placeholder="Track record (e.g. 2 years, 78% win rate)" value={trackRecord} onChange={(e) => setTrackRecord(e.target.value)} className={inputClass} />
                  </>
                )}

                {/* Broker Fields */}
                {signupRole === "broker" && (
                  <>
                    <input type="text" placeholder="Company name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                    <input type="url" placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Regulation (e.g. FCA, CySEC)" value={regulation} onChange={(e) => setRegulation(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="License number" value={license} onChange={(e) => setLicense(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Contact person name" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputClass} />
                  </>
                )}

                {/* Betting Site Fields */}
                {signupRole === "betting_site" && (
                  <>
                    <input type="text" placeholder="Platform name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                    <input type="url" placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="License / regulation" value={license} onChange={(e) => setLicense(e.target.value)} className={inputClass} />
                  </>
                )}

                {/* T&C Checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border accent-primary" />
                  <span className="text-xs text-muted-foreground">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</a>
                    {" "}and{" "}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>
                  </span>
                </label>

                <button type="submit" disabled={loading || !acceptedTerms}
                  className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : signupRole === "user" ? "Create Account" : "Submit Application"}
                </button>

                {/* Google signup for users only */}
                {signupRole === "user" && (
                  <>
                    <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
                    <button type="button" onClick={handleGoogle} className="w-full py-3 text-sm font-semibold border border-border text-foreground rounded-xl hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Continue with Google
                    </button>
                  </>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
