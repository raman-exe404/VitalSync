import { useEffect, useState } from "react";
import { Save, User, MapPin, Phone, LogOut } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { profile, fetchProfile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", age: "", location: "", emergency_contact: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        age: String(profile.age || ""),
        location: profile.location || "",
        emergency_contact: profile.emergency_contact || "",
      });
    }
  }, [profile?.id]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from("users")
      .update({ ...form, age: parseInt(form.age) || null })
      .eq("id", user.id);
    await fetchProfile(user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const initials = profile?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const fields = [
    { label: "Full Name",          field: "name",              type: "text", icon: User,  placeholder: "John Doe" },
    { label: "Age",                 field: "age",               type: "number", icon: null, placeholder: "25" },
    { label: "Location",            field: "location",          type: "text", icon: MapPin, placeholder: "Mumbai, India" },
    { label: "Emergency Contact",   field: "emergency_contact", type: "tel",  icon: Phone, placeholder: "+91 99999 99999" },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
          <button onClick={handleSignOut}
            className="clay-card flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Avatar card */}
        <div className="clay-card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-heading font-bold text-xl text-foreground">{profile?.name || "—"}</p>
            <p className="text-sm text-muted-foreground font-body">{profile?.phone || "—"}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-semibold capitalize">
                {profile?.role || "patient"}
              </span>
              {profile?.genotype && (
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-body font-semibold">
                  {profile.genotype}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="clay-card p-6 space-y-5">
          <h2 className="font-heading font-bold text-foreground">Edit Details</h2>

          {fields.map(({ label, field, type, icon: Icon, placeholder }) => (
            <div key={field}>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">{label}</label>
              <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                <input
                  type={type}
                  value={(form as any)[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  className={`clay-input w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 font-body text-foreground placeholder:text-muted-foreground`}
                  placeholder={placeholder}
                />
              </div>
            </div>
          ))}

          {/* Read-only fields */}
          <div className="clay-card p-4 bg-muted/40 space-y-2">
            <p className="text-sm font-body text-muted-foreground">
              Genotype: <strong className="text-foreground">{profile?.genotype || "—"}</strong>
            </p>
            <p className="text-sm font-body text-muted-foreground">
              Role: <strong className="text-foreground capitalize">{profile?.role || "—"}</strong>
            </p>
            <p className="text-xs text-muted-foreground font-body">Genotype and role cannot be changed here.</p>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="clay-btn w-full py-3.5 flex items-center justify-center gap-2 text-base font-body font-bold">
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : saved ? "Saved! ✅" : "Save Changes"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
