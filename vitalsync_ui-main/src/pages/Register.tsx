import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, MapPin, Phone, ArrowRight, ArrowLeft, HeartPulse, Stethoscope } from "lucide-react";
import ClayBlobs from "@/components/ClayBlobs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
type Step = "account" | "profile";
const GENOTYPES = ["AA", "AS", "SS", "SC", "CC"];
const GENDERS = ["Male", "Female", "Other"];

export default function Register() {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();

  // If already authenticated (e.g. Google OAuth), skip to profile step
  const [step, setStep] = useState<Step>(user ? "profile" : "account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(user?.id ?? "");

  const [form, setForm] = useState({
    name: "", age: "", gender: "Male",
    location: "", genotype: "SS",
    role: "patient" as "patient" | "worker",
    emergency_contact: "",
  });
  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  // Step 1 — create auth account
  async function handleCreateAccount() {
    if (!email.trim()) return setError("Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true); setError("");

    const { data, error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) return setError(err.message);

    // autoconfirm is on — user is immediately available in session
    const uid = data.user?.id ?? data.session?.user?.id;
    if (!uid) return setError("Sign up failed. Try again.");
    setUserId(uid);
    setStep("profile");
  }

  async function handleGoogle() {
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (err) setError(err.message);
  }

  // Step 2 — save profile
  async function handleSaveProfile() {
    if (!form.name.trim()) return setError("Full name is required");
    if (!form.emergency_contact.trim()) return setError("Emergency contact is required");
    setLoading(true); setError("");

    // Fallback: get uid from active session (covers Google OAuth flow)
    let uid = userId;
    if (!uid) {
      const { data: { session } } = await supabase.auth.getSession();
      uid = session?.user?.id ?? "";
    }
    if (!uid) { setLoading(false); return setError("Session expired. Please sign in again."); }

    const { error: err } = await supabase.from("users").upsert([{
      id: uid,
      email: email || undefined,
      name: form.name.trim(),
      age: parseInt(form.age) || null,
      gender: form.gender,
      location: form.location.trim(),
      genotype: form.genotype,
      role: form.role,
      emergency_contact: form.emergency_contact.trim(),
    }]);

    setLoading(false);
    if (err) return setError(err.message);
    // Refresh profile in context so ProtectedRoute sees it before we navigate
    await fetchProfile(uid);
    navigate(form.role === "worker" ? "/doctor" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <ClayBlobs />
      <div className="clay-card p-8 md:p-10 w-full max-w-sm relative z-10 animate-fade-in">

        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/logo.png" alt="VitalSync" className="w-16 h-16 rounded-2xl object-cover shadow" />
          <h1 className="font-heading text-2xl font-bold text-foreground">VitalSync</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div key={n} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${n <= (step === "account" ? 1 : 2) ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* ── STEP 1: Account ── */}
        {step === "account" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="font-heading text-xl font-bold text-foreground">Create Account</h2>
              <p className="text-sm text-muted-foreground font-body mt-1">Sign up to get started</p>
            </div>

            {/* Google */}
            <button onClick={handleGoogle}
              className="clay-card w-full py-3 flex items-center justify-center gap-3 font-body font-semibold text-foreground hover:scale-[1.02] transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-body">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="clay-input w-full pl-11 pr-4 py-3.5 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder="you@example.com" autoFocus />
              </div>
            </div>

            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreateAccount()}
                  className="clay-input w-full pl-11 pr-4 py-3.5 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder="Min. 6 characters" />
              </div>
            </div>

            {error && <p className="text-sm text-destructive font-body">{error}</p>}

            <button onClick={handleCreateAccount} disabled={loading}
              className="clay-btn w-full py-3.5 text-base font-body font-bold flex items-center justify-center gap-2">
              {loading ? "Creating..." : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-center text-sm text-muted-foreground font-body">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: Profile ── */}
        {step === "profile" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="font-heading text-xl font-bold text-foreground">Complete Your Profile</h2>
              <p className="text-sm text-muted-foreground font-body mt-1">Tell us about yourself</p>
            </div>

            {/* Role */}
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-2 block">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {(["patient", "worker"] as const).map(r => (
                  <button key={r} onClick={() => update("role", r)}
                    className={`clay-card p-4 flex flex-col items-center gap-2 border-2 transition-all ${form.role === r ? "border-primary bg-primary/5" : "border-transparent"}`}>
                    {r === "patient"
                      ? <HeartPulse className={`w-6 h-6 ${form.role === r ? "text-primary" : "text-muted-foreground"}`} />
                      : <Stethoscope className={`w-6 h-6 ${form.role === r ? "text-primary" : "text-muted-foreground"}`} />}
                    <span className={`font-body text-sm font-semibold ${form.role === r ? "text-primary" : "text-muted-foreground"}`}>
                      {r === "patient" ? "Patient" : "Health Worker"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)}
                  className="clay-input w-full pl-11 pr-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder="John Doe" />
              </div>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Age</label>
                <input type="number" value={form.age} onChange={e => update("age", e.target.value)}
                  className="clay-input w-full px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder="25" />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Gender</label>
                <select value={form.gender} onChange={e => update("gender", e.target.value)}
                  className="clay-input w-full px-4 py-3 font-body text-foreground">
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">City / Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={form.location} onChange={e => update("location", e.target.value)}
                  className="clay-input w-full pl-11 pr-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder="Mumbai, India" />
              </div>
            </div>

            {/* Genotype */}
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-2 block">Genotype</label>
              <div className="flex gap-2 flex-wrap">
                {GENOTYPES.map(g => (
                  <button key={g} onClick={() => update("genotype", g)}
                    className={`px-4 py-2 rounded-xl font-body text-sm font-semibold transition-all ${form.genotype === g ? "clay-btn" : "clay-card text-muted-foreground"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Emergency Contact *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="tel" value={form.emergency_contact} onChange={e => update("emergency_contact", e.target.value)}
                  className="clay-input w-full pl-11 pr-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder="+91 99999 99999" />
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">This number receives SOS alerts</p>
            </div>

            {error && <p className="text-sm text-destructive font-body">{error}</p>}

            <button onClick={handleSaveProfile} disabled={loading}
              className="clay-btn w-full py-3.5 text-base font-body font-bold">
              {loading ? "Creating account..." : "Create Account 🎉"}
            </button>

            <button onClick={() => { setStep("account"); setError(""); }}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
