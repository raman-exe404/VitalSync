import { useEffect, useState } from "react";
import { Users, AlertTriangle, Bell } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface PatientAlert { id: string; risk_level: string; message: string; created_at: string; users?: { name: string; phone: string; }; }

const riskColor = (r: string) =>
  r === "LOW" ? "text-success bg-success/10" : r === "MEDIUM" ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";

const DoctorDashboard = () => {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase.from("alerts").select("*, users(name, phone)").order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => { setAlerts((data as PatientAlert[]) || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [profile]);

  const stats = {
    total: alerts.length,
    high: alerts.filter((a) => a.risk_level === "HIGH").length,
    active: alerts.filter((a) => a.risk_level !== "LOW").length,
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Doctor Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Total Patients", value: stats.total, color: "text-secondary" },
            { icon: AlertTriangle, label: "High Risk", value: stats.high, color: "text-destructive" },
            { icon: Bell, label: "Active Alerts", value: stats.active, color: "text-warning" },
          ].map((s) => (
            <div key={s.label} className="clay-card p-5 flex items-center gap-4">
              <div className="clay-card p-3 rounded-full bg-muted">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">{s.label}</p>
                <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Patient list */}
        <div className="clay-card p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Patient Alerts</h2>
          {loading && <p className="text-muted-foreground font-body text-sm">Loading...</p>}
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="clay-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="clay-card w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-primary text-sm">
                    {a.users?.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground text-sm">{a.users?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground font-body">{a.message.slice(0, 60)}...</p>
                    <p className="text-xs text-muted-foreground font-body">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-body ${riskColor(a.risk_level)}`}>
                  {a.risk_level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DoctorDashboard;
