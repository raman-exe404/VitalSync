import { useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/hooks/useNotif";
import { AppAlert } from "@/context/NotifContext";
import { getAlerts, markAlertRead } from "@/lib/api";

const riskStyle = (r: string) =>
  r === "HIGH"   ? "text-destructive bg-destructive/10 border-destructive/20"
  : r === "MEDIUM" ? "text-warning bg-warning/10 border-warning/20"
  : "text-success bg-success/10 border-success/20";

const Alerts = () => {
  const { profile } = useAuth();
  const { alerts, unreadCount, markRead, addAlert } = useNotif();

  useEffect(() => {
    if (!profile) return;
    getAlerts(profile.id).then(({ data }) => {
      (data as AppAlert[] || []).forEach((a) => addAlert(a));
    }).catch(() => {});
  }, [profile?.id]);

  async function handleMarkRead(id: string) {
    markRead(id);
    await markAlertRead(id).catch(() => {});
  }

  const counts = {
    HIGH:   alerts.filter((a) => a.risk_level === "HIGH").length,
    MEDIUM: alerts.filter((a) => a.risk_level === "MEDIUM").length,
    LOW:    alerts.filter((a) => a.risk_level === "LOW").length,
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Alerts & Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold font-body border border-destructive/20">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {([["HIGH", "🚨", "text-destructive"], ["MEDIUM", "⚠️", "text-warning"], ["LOW", "✅", "text-success"]] as const).map(([level, icon, color]) => (
            <div key={level} className="clay-card p-5 flex items-center gap-3">
              <div className="clay-card p-3 rounded-full bg-muted">
                <AlertTriangle className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">{icon} {level}</p>
                <p className="font-heading text-2xl font-bold text-foreground">{counts[level]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div className="clay-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-foreground">Recent Alerts</h2>
          </div>
          {alerts.length === 0 && (
            <p className="text-muted-foreground font-body text-sm">No alerts yet. Log your health daily!</p>
          )}
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id}
                className={`clay-card p-4 flex items-start gap-3 border-l-4 transition-opacity ${
                  a.risk_level === "HIGH" ? "border-destructive" : a.risk_level === "MEDIUM" ? "border-warning" : "border-success"
                } ${a.is_read ? "opacity-50" : ""}`}>
                <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold font-body border ${riskStyle(a.risk_level)}`}>
                  {a.risk_level}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-body">{a.message}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                {!a.is_read && (
                  <button onClick={() => handleMarkRead(a.id)}
                    className="clay-card p-2 rounded-full flex-shrink-0 hover:scale-110 transition-transform"
                    aria-label="Mark as read">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Alerts;
