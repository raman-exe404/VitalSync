import { useEffect, useState } from "react";
import { CalendarDays, Clock, Save, AlertTriangle, CheckCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function StrokeHistory() {
  const { profile, user, fetchProfile } = useAuth();
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from existing profile data
  useEffect(() => {
    if (profile) {
      setDate((profile as any).last_stroke_date || "");
      setNotes((profile as any).stroke_notes || "");
    }
  }, [profile?.id]);

  async function handleSave() {
    if (!date) return setError("Please select a date");
    setSaving(true); setError("");
    const { error } = await supabase
      .from("users")
      .update({ last_stroke_date: date, stroke_notes: notes.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return setError(error.message);
    await fetchProfile(user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Days since last stroke
  const daysSince = date
    ? Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const urgencyColor =
    daysSince === null ? "" :
    daysSince < 30  ? "bg-destructive/10 border-destructive/40 text-destructive" :
    daysSince < 180 ? "bg-warning/10 border-warning/40 text-warning" :
                      "bg-success/10 border-success/40 text-success";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Stroke History</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Record your most recent sickle cell crisis or stroke event</p>
        </div>

        {/* Days since card */}
        {daysSince !== null && (
          <div className={`clay-card p-5 border-2 ${urgencyColor}`}>
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                {daysSince < 30 ? "🚨" : daysSince < 180 ? "⚠️" : "✅"}
              </div>
              <div>
                <p className="font-heading font-bold text-2xl">{daysSince} days</p>
                <p className="font-body text-sm">since last recorded stroke / crisis</p>
              </div>
            </div>
            {daysSince < 30 && (
              <p className="font-body text-sm mt-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Recent event — please consult your doctor and monitor closely.
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <div className="clay-card p-6 space-y-5">
          <div>
            <label className="font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-2 block">
              <CalendarDays className="w-4 h-4 text-primary" />
              Date of Last Stroke / Crisis *
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => setDate(e.target.value)}
              className="clay-input w-full px-4 py-3 font-body text-foreground"
            />
            {date && (
              <p className="text-xs text-muted-foreground font-body mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                {daysSince !== null && ` · ${daysSince} days ago`}
              </p>
            )}
          </div>

          <div>
            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="clay-input w-full px-4 py-3 font-body text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="e.g. Admitted to hospital, treated with IV fluids, pain in chest and joints..."
            />
          </div>

          {error && <p className="text-sm text-destructive font-body">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="clay-btn w-full py-3.5 flex items-center justify-center gap-2 text-base font-body font-bold">
            {saving ? "Saving..." : saved
              ? <><CheckCircle className="w-5 h-5" /> Saved!</>
              : <><Save className="w-5 h-5" /> Save Stroke History</>
            }
          </button>
        </div>

        {/* Info card */}
        <div className="clay-card p-5 bg-muted/30">
          <h3 className="font-heading font-bold text-foreground mb-3">Why this matters</h3>
          <div className="space-y-2">
            {[
              "Helps your doctor track crisis frequency",
              "Used by the AI model to improve risk predictions",
              "Alerts health workers when a recent event is detected",
              "Keeps your medical history complete and accessible",
            ].map((tip, i) => (
              <p key={i} className="text-sm font-body text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span> {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
