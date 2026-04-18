import { useState, useEffect } from "react";
import { Save, Droplets, Moon, Thermometer } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { saveHealthLog, getWeather } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const SYMPTOMS = ["Fatigue", "Joint Pain", "Chest Pain", "Headache", "Fever", "Swelling", "Shortness of Breath", "Nausea"];

const STRESS_LEVELS = [
  { value: 2,  label: "Low",    icon: "😌", color: "border-success bg-success/10 text-success" },
  { value: 5,  label: "Medium", icon: "😰", color: "border-warning bg-warning/10 text-warning" },
  { value: 9,  label: "High",   icon: "😫", color: "border-destructive bg-destructive/10 text-destructive" },
];

function Slider({ icon: Icon, label, value, onChange, min = 0, max = 10, step = 0.5, unit = "" }: {
  icon: React.ElementType; label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="font-body text-sm font-medium text-foreground flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" /> {label}
        </label>
        <span className="font-heading font-bold text-primary">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary h-2 rounded-full cursor-pointer" />
      <div className="flex justify-between text-xs text-muted-foreground font-body">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

const DigitalTwin = () => {
  const { profile, fetchProfile, user } = useAuth();
  const [tab, setTab] = useState<"log" | "profile">("log");
  const [log, setLog] = useState({ water: 2, sleep: 7, stress: 2, pain: 0, temperature: 25 });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [riskResult, setRiskResult] = useState<{ level: string; message: string; source?: string } | null>(null);
  const [logLoading, setLogLoading] = useState(false);
  const [weatherCity, setWeatherCity] = useState<string | null>(null);

  // Auto-fill temperature from surrounding weather
  useEffect(() => {
    async function fetchWeather(lat: number, lng: number) {
      try {
        const { data } = await getWeather(lat, lng);
        setLog((l) => ({ ...l, temperature: Math.round(data.temperature) }));
        setWeatherCity(data.city);
      } catch {}
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        async () => {
          // GPS denied — fall back to IP location
          try {
            const res = await fetch('https://ipapi.co/json/');
            const ip = await res.json();
            if (ip.latitude && ip.longitude) fetchWeather(ip.latitude, ip.longitude);
          } catch {}
        },
        { timeout: 5000 }
      );
    } else {
      // No geolocation API — use IP
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(ip => { if (ip.latitude) fetchWeather(ip.latitude, ip.longitude); })
        .catch(() => {});
    }
  }, []);

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || "", age: String(profile?.age || ""),
    location: profile?.location || "", emergency_contact: profile?.emergency_contact || "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync profileForm when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        age: String(profile.age || ""),
        location: profile.location || "",
        emergency_contact: profile.emergency_contact || "",
      });
    }
  }, [profile?.id]);

  function updateLog(field: string, val: number) { setLog((l) => ({ ...l, [field]: val })); }
  function toggleSymptom(s: string) { setSymptoms((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }

  async function handleLogSubmit() {
    setLogLoading(true);
    setRiskResult(null);
    try {
      const coords = await new Promise<GeolocationCoordinates | null>((res) =>
        navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => res(p.coords), () => res(null)) : res(null)
      );
      const { data } = await saveHealthLog({
        user_id: profile?.id,
        ...log,
        symptoms,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      setRiskResult(data.risk);
      // Offline backup
      const offline = JSON.parse(localStorage.getItem("offline_logs") || "[]");
      offline.unshift({ ...log, symptoms, created_at: new Date().toISOString() });
      localStorage.setItem("offline_logs", JSON.stringify(offline.slice(0, 50)));
    } catch {
      const offline = JSON.parse(localStorage.getItem("offline_logs") || "[]");
      offline.unshift({ ...log, symptoms, created_at: new Date().toISOString(), offline: true });
      localStorage.setItem("offline_logs", JSON.stringify(offline.slice(0, 50)));
      setRiskResult({ level: "UNKNOWN", message: "Saved offline. Will sync when connected." });
    }
    setLogLoading(false);
  }

  async function handleProfileSave() {
    if (!user) return;
    await supabase.from("users").update({ ...profileForm, age: parseInt(profileForm.age) || null }).eq("id", user.id);
    await fetchProfile(user.id);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  const riskColors: Record<string, string> = {
    HIGH: "text-destructive bg-destructive/10 border-destructive/30",
    MEDIUM: "text-warning bg-warning/10 border-warning/30",
    LOW: "text-success bg-success/10 border-success/30",
    UNKNOWN: "text-muted-foreground bg-muted border-border",
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Digital Twin</h1>

        {/* Tabs */}
        <div className="flex gap-3">
          {(["log", "profile"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-xl font-body text-sm font-medium capitalize transition-all ${tab === t ? "clay-btn" : "clay-card text-muted-foreground"}`}>
              {t === "log" ? "📋 Health Log" : "👤 Profile"}
            </button>
          ))}
        </div>

        {tab === "log" && (
          <div className="clay-card p-6 md:p-8 space-y-6">

            {/* Water — 0 to 10L */}
            <Slider icon={Droplets} label="Water Intake" value={log.water}
              onChange={(v) => updateLog("water", v)} min={0} max={10} step={0.5} unit="L" />

            {/* Sleep — 0 to 24h */}
            <Slider icon={Moon} label="Sleep Duration" value={log.sleep}
              onChange={(v) => updateLog("sleep", v)} min={0} max={24} step={0.5} unit="h" />

            {/* Stress — icon buttons */}
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground block">Stress Level</label>
              <div className="grid grid-cols-3 gap-3">
                {STRESS_LEVELS.map((s) => (
                  <button key={s.value} onClick={() => updateLog("stress", s.value)}
                    className={`clay-card py-4 flex flex-col items-center gap-2 border-2 transition-all duration-200 ${
                      log.stress === s.value ? s.color : "border-transparent text-muted-foreground"
                    }`}>
                    <span className="text-3xl">{s.icon}</span>
                    <span className="font-body text-sm font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Surrounding Temperature — auto-detected, read-only display */}
            <div className="clay-card p-4 bg-muted/30 flex items-center gap-4">
              <div className="clay-card p-3 rounded-full bg-secondary/10">
                <Thermometer className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-medium text-foreground">Surrounding Temperature</p>
                {weatherCity
                  ? <p className="font-heading font-bold text-xl text-foreground mt-0.5">{log.temperature}°C <span className="text-sm font-body text-muted-foreground font-normal">— {weatherCity}</span></p>
                  : <p className="text-sm text-muted-foreground font-body mt-0.5">Detecting your location...</p>
                }
              </div>
              {weatherCity && (
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-body font-semibold">Auto</span>
              )}
            </div>

            <div>
              <p className="font-body text-sm font-medium text-foreground mb-3">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className={`px-3 py-2 rounded-xl text-sm font-body font-medium transition-all ${symptoms.includes(s) ? "clay-btn" : "clay-card text-muted-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {riskResult && (
              <div className={`clay-card p-4 border ${riskColors[riskResult.level] || riskColors.UNKNOWN}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-heading font-bold text-lg">
                    {riskResult.level === "HIGH" ? "🚨" : riskResult.level === "MEDIUM" ? "⚠️" : "✅"} {riskResult.level} RISK
                  </p>
                  {riskResult.source && (
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {riskResult.source === 'ml' ? '🤖 AI Model' : '📏 Rule-based'}
                    </span>
                  )}
                </div>
                <p className="text-sm font-body">{riskResult.message}</p>
              </div>
            )}

            <button onClick={handleLogSubmit} disabled={logLoading} className="clay-btn w-full py-3.5 flex items-center justify-center gap-2 text-base">
              {logLoading ? "Saving..." : "Submit Health Log 📤"}
            </button>
          </div>
        )}

        {tab === "profile" && (
          <div className="clay-card p-6 md:p-8 space-y-5">
            {[
              { label: "Full Name", field: "name", type: "text", placeholder: "John Doe" },
              { label: "Age", field: "age", type: "number", placeholder: "25" },
              { label: "Location", field: "location", type: "text", placeholder: "Lagos, Nigeria" },
              { label: "Emergency Contact", field: "emergency_contact", type: "tel", placeholder: "+234 800 000 0000" },
            ].map((f) => (
              <div key={f.field}>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">{f.label}</label>
                <input type={f.type} value={(profileForm as any)[f.field]}
                  onChange={(e) => setProfileForm((p) => ({ ...p, [f.field]: e.target.value }))}
                  className="clay-input w-full px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
                  placeholder={f.placeholder} />
              </div>
            ))}
            <div className="clay-card p-3 bg-muted/50">
              <p className="text-sm font-body text-muted-foreground">Genotype: <strong className="text-foreground">{profile?.genotype || "—"}</strong></p>
              <p className="text-sm font-body text-muted-foreground mt-1">Role: <strong className="text-foreground capitalize">{profile?.role}</strong></p>
            </div>
            <button onClick={handleProfileSave} className="clay-btn w-full py-3.5 flex items-center justify-center gap-2 text-base">
              <Save className="w-5 h-5" /> {profileSaved ? "Saved! ✅" : "Save Profile"}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DigitalTwin;
