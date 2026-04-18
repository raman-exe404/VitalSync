import { useEffect, useState } from "react";
import { Download, Droplets, Moon, Thermometer, CalendarDays, Clock, AlertTriangle, Link as LinkIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { getHealthLogs } from "@/lib/api";
import { exportMedicalPDF } from "@/lib/exportPdf";

interface HealthLog {
  id?: string; water: number; sleep: number; stress: number;
  temperature: number; symptoms?: string[]; created_at: string; offline?: boolean;
}

const STRESS_LABEL: Record<number, { label: string; icon: string; color: string }> = {
  2: { label: "Low",    icon: "😌", color: "text-success" },
  5: { label: "Medium", icon: "😰", color: "text-warning" },
  9: { label: "High",   icon: "😫", color: "text-destructive" },
};

function stressDisplay(val: number) {
  const entry = STRESS_LABEL[val] ?? (val <= 3 ? STRESS_LABEL[2] : val <= 6 ? STRESS_LABEL[5] : STRESS_LABEL[9]);
  return entry;
}

const MedicalRecords = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  // Default: last 30 days
  const todayStr = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [exportFrom, setExportFrom] = useState(thirtyDaysAgo);
  const [exportTo, setExportTo] = useState(todayStr);

  const strokeDate = (profile as any)?.last_stroke_date;
  const strokeNotes = (profile as any)?.stroke_notes;
  const daysSince = strokeDate
    ? Math.floor((Date.now() - new Date(strokeDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  function handleExportPDF() {
    const from = new Date(exportFrom);
    const to = new Date(exportTo);
    to.setHours(23, 59, 59);
    exportMedicalPDF(profile as any, logs, from, to);
    setShowExportModal(false);
  }

  useEffect(() => {
    if (!profile) return;
    getHealthLogs(profile.id)
      .then(({ data }) => { setLogs(data || []); setLoading(false); })
      .catch(() => {
        const offline = JSON.parse(localStorage.getItem("offline_logs") || "[]");
        setLogs(offline);
        setLoading(false);
      });
  }, [profile?.id]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Medical Records</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Your complete health history</p>
            </div>
            <button onClick={() => setShowExportModal(true)}
              className="clay-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-bold flex-shrink-0">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* ── STROKE HISTORY ── */}
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-destructive" /> Stroke History
            </h2>
            <Link to="/stroke-history"
              className="clay-btn px-4 py-2 text-xs font-body font-bold rounded-xl flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Edit
            </Link>
          </div>

          {strokeDate ? (
            <div className={`clay-card p-4 border-2 ${
              daysSince! < 30  ? "border-destructive/40 bg-destructive/5" :
              daysSince! < 180 ? "border-warning/40 bg-warning/5" :
                                 "border-success/40 bg-success/5"
            }`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  {daysSince! < 30 ? "🚨" : daysSince! < 180 ? "⚠️" : "✅"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-heading font-bold text-foreground">
                      {new Date(strokeDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <span className={`text-xs font-body font-bold px-2 py-0.5 rounded-full ${
                      daysSince! < 30  ? "bg-destructive/10 text-destructive" :
                      daysSince! < 180 ? "bg-warning/10 text-warning" :
                                         "bg-success/10 text-success"
                    }`}>
                      {daysSince} days ago
                    </span>
                  </div>
                  {strokeNotes && (
                    <p className="text-sm text-muted-foreground font-body mt-1">{strokeNotes}</p>
                  )}
                  {daysSince! < 30 && (
                    <p className="text-xs text-destructive font-body mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Recent event — consult your doctor
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last recorded
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground font-body text-sm mb-3">No stroke history recorded yet.</p>
              <Link to="/stroke-history" className="clay-btn inline-block px-5 py-2 text-sm font-body font-bold rounded-xl">
                Add Stroke History →
              </Link>
            </div>
          )}
        </div>

        {/* ── HEALTH LOG HISTORY ── */}
        <div className="clay-card p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Health Log History</h2>
          {loading && (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="clay-card p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-4 bg-muted rounded-full" />
                    <div className="flex-1 h-4 bg-muted rounded-full" />
                    <div className="w-20 h-4 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && logs.length === 0 && (
            <p className="text-muted-foreground font-body text-sm">No logs yet. Use Digital Twin to log your health daily.</p>
          )}
          <div className="space-y-3">
            {logs.map((log, i) => {
              const stress = stressDisplay(log.stress);
              return (
                <div key={log.id || i} className="clay-card p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-heading font-bold text-sm text-foreground">
                      {new Date(log.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {log.offline && <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-body">Offline</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Water */}
                    <div className="clay-card p-2 text-center bg-muted/30">
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-secondary" />
                      <p className="text-xs text-muted-foreground font-body">Water</p>
                      <p className="font-heading font-bold text-xs text-foreground">{log.water}L</p>
                    </div>
                    {/* Sleep */}
                    <div className="clay-card p-2 text-center bg-muted/30">
                      <Moon className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground font-body">Sleep</p>
                      <p className="font-heading font-bold text-xs text-foreground">{log.sleep}h</p>
                    </div>
                    {/* Stress */}
                    <div className="clay-card p-2 text-center bg-muted/30">
                      <span className="text-lg block mb-0.5">{stress.icon}</span>
                      <p className="text-xs text-muted-foreground font-body">Stress</p>
                      <p className={`font-heading font-bold text-xs ${stress.color}`}>{stress.label}</p>
                    </div>
                    {/* Temperature */}
                    <div className="clay-card p-2 text-center bg-muted/30 col-span-3 sm:col-span-1">
                      <Thermometer className="w-4 h-4 mx-auto mb-1 text-accent" />
                      <p className="text-xs text-muted-foreground font-body">Temp</p>
                      <p className="font-heading font-bold text-xs text-foreground">{log.temperature}°C</p>
                    </div>
                  </div>

                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {log.symptoms.map((s) => (
                        <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-body">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Export PDF Modal ── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="clay-card p-6 w-full max-w-sm animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-foreground">Export Medical Report</h3>
              <button onClick={() => setShowExportModal(false)} className="clay-card p-2 rounded-full hover:scale-105 transition-transform">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground font-body">
              Select the time period to include in your PDF report.
            </p>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Last 7 days",  days: 7 },
                { label: "Last 30 days", days: 30 },
                { label: "Last 3 months",days: 90 },
                { label: "Last 6 months",days: 180 },
                { label: "All time",     days: 3650 },
              ].map(p => (
                <button key={p.label} onClick={() => {
                  setExportTo(todayStr);
                  setExportFrom(new Date(Date.now() - p.days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
                }}
                  className="clay-card px-3 py-1.5 text-xs font-body font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-xs font-medium text-foreground mb-1 block">From</label>
                <input type="date" value={exportFrom} max={exportTo}
                  onChange={e => setExportFrom(e.target.value)}
                  className="clay-input w-full px-3 py-2 font-body text-sm text-foreground" />
              </div>
              <div>
                <label className="font-body text-xs font-medium text-foreground mb-1 block">To</label>
                <input type="date" value={exportTo} min={exportFrom} max={todayStr}
                  onChange={e => setExportTo(e.target.value)}
                  className="clay-input w-full px-3 py-2 font-body text-sm text-foreground" />
              </div>
            </div>

            <div className="clay-card p-3 bg-muted/40 rounded-xl">
              <p className="text-xs text-muted-foreground font-body">
                📄 Report will include: patient info, stroke history, and{" "}
                <strong className="text-foreground">
                  {logs.filter(l => {
                    const d = new Date(l.created_at);
                    return d >= new Date(exportFrom) && d <= new Date(exportTo);
                  }).length} health log(s)
                </strong>{" "}in this period.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)}
                className="flex-1 clay-card py-3 text-sm font-body font-semibold text-muted-foreground">
                Cancel
              </button>
              <button onClick={handleExportPDF}
                className="flex-1 clay-btn py-3 text-sm font-body font-bold flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MedicalRecords;
