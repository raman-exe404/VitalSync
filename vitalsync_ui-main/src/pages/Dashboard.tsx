import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, AlertTriangle, FileText, Bell, Bot, Droplets, Wind, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/hooks/useNotif";
import { getAlerts, getWeather } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface Weather { temperature: number; humidity: number; description: string; city: string; }

const RISK_CONFIG = {
  HIGH: {
    bg: "bg-destructive/10 border-destructive/40",
    text: "text-destructive",
    bar: "bg-destructive",
    icon: "🚨",
    label: "HIGH RISK",
    barWidth: "w-full",
    advice: "Seek medical attention immediately. Stay hydrated and rest.",
    trend: TrendingUp,
  },
  MEDIUM: {
    bg: "bg-warning/10 border-warning/40",
    text: "text-warning",
    bar: "bg-warning",
    icon: "⚠️",
    label: "MEDIUM RISK",
    barWidth: "w-2/3",
    advice: "Drink more water, reduce stress, and monitor your symptoms.",
    trend: Minus,
  },
  LOW: {
    bg: "bg-success/10 border-success/40",
    text: "text-success",
    bar: "bg-success",
    icon: "✅",
    label: "LOW RISK",
    barWidth: "w-1/4",
    advice: "Your vitals look stable. Keep up the healthy habits!",
    trend: TrendingDown,
  },
};

export default function Dashboard() {
  const { profile } = useAuth();
  const { alerts, addAlert } = useNotif();
  const [weather, setWeather] = useState<Weather | null>(null);

  const latestAlert = alerts[0] ?? null;
  const latestRisk = latestAlert?.risk_level ?? null;
  const riskCfg = latestRisk ? RISK_CONFIG[latestRisk as keyof typeof RISK_CONFIG] : null;

  // Count risk levels from last 7 alerts
  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  alerts.slice(0, 7).forEach((a) => { if (a.risk_level in riskCounts) riskCounts[a.risk_level as keyof typeof riskCounts]++; });

  useEffect(() => {
    if (!profile) return;
    loadWeather();

    getAlerts(profile.id).then(({ data }: any) => {
      (data || []).forEach((a: any) => addAlert(a));
    }).catch(() => {});

    const channel = supabase.channel("vs-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts", filter: `user_id=eq.${profile.id}` },
        (payload: any) => addAlert(payload.new))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  async function loadWeather() {
    async function fetchWeather(lat: number, lng: number) {
      try {
        const { data } = await getWeather(lat, lng);
        setWeather(data);
      } catch {}
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        async () => {
          try {
            const res = await fetch('https://ipapi.co/json/');
            const ip = await res.json();
            if (ip.latitude) fetchWeather(ip.latitude, ip.longitude);
          } catch {}
        },
        { timeout: 5000 }
      );
    } else {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const ip = await res.json();
        if (ip.latitude) fetchWeather(ip.latitude, ip.longitude);
      } catch {}
    }
  }

  const cards = [
    { icon: User,          title: "Digital Twin",    desc: "Log health & get AI prediction", link: "/digital-twin", color: "text-secondary" },
    { icon: FileText,      title: "Medical Records", desc: "View health history",             link: "/records",      color: "text-accent" },
    { icon: Bell,          title: "Alerts",          desc: "Reminders & notifications",       link: "/alerts",       color: "text-warning" },
    { icon: Bot,           title: "AI Assistant",    desc: "Ask health questions",            link: "/ai-assistant", color: "text-primary" },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">

        {/* Header */}
        <div>
          <p className="text-muted-foreground font-body text-sm">Good day 👋</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{profile?.name || "Welcome"}</h1>
          {profile?.genotype && (
            <p className="text-sm text-muted-foreground font-body mt-0.5">
              Genotype: <strong className="text-foreground">{profile.genotype}</strong>
            </p>
          )}
        </div>

        {/* ── CRISIS RISK PANEL ── */}
        <div className={`clay-card p-5 border-2 ${riskCfg ? riskCfg.bg : "bg-muted/30 border-border"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${riskCfg ? riskCfg.text : "text-muted-foreground"}`} />
              <h2 className="font-heading font-bold text-foreground">Crisis Risk Status</h2>
            </div>
            {riskCfg && (
              <Link to="/alerts" className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-body border ${riskCfg.bg} ${riskCfg.text}`}>
                {riskCfg.icon} {riskCfg.label}
              </Link>
            )}
          </div>

          {riskCfg ? (
            <>
              {/* Risk bar */}
              <div className="w-full bg-muted rounded-full h-3 mb-3 overflow-hidden">
                <div className={`h-3 rounded-full transition-all duration-700 ${riskCfg.bar} ${riskCfg.barWidth}`} />
              </div>

              {/* Advice */}
              <p className={`text-sm font-body ${riskCfg.text} font-medium mb-3`}>{riskCfg.advice}</p>

              {/* 7-day mini history */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-body">Last 7 logs:</span>
                <div className="flex gap-1">
                  {alerts.slice(0, 7).map((a, i) => (
                    <div key={i} title={a.risk_level}
                      className={`w-3 h-6 rounded-sm ${a.risk_level === "HIGH" ? "bg-destructive" : a.risk_level === "MEDIUM" ? "bg-warning" : "bg-success"}`} />
                  ))}
                  {alerts.length === 0 && <span className="text-xs text-muted-foreground font-body italic">No logs yet</span>}
                </div>
              </div>

              {/* Risk breakdown */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {(["HIGH", "MEDIUM", "LOW"] as const).map((level) => (
                  <div key={level} className={`clay-card p-2 text-center ${RISK_CONFIG[level].bg}`}>
                    <p className={`font-heading font-bold text-lg ${RISK_CONFIG[level].text}`}>{riskCounts[level]}</p>
                    <p className={`text-xs font-body ${RISK_CONFIG[level].text}`}>{RISK_CONFIG[level].icon} {level}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground font-body text-sm">No risk data yet.</p>
              <Link to="/digital-twin" className="clay-btn inline-block mt-3 px-5 py-2 text-sm font-body font-bold rounded-xl">
                Log Health Now →
              </Link>
            </div>
          )}
        </div>

        {/* Weather + SOS row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weather && (
            <div className="clay-card p-4 flex items-center gap-3">
              <div className="clay-card p-3 rounded-full bg-secondary/10">
                <Wind className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-foreground text-sm">{weather.temperature}°C — {weather.city}</p>
                <p className="text-xs text-muted-foreground font-body capitalize">{weather.description}</p>
              </div>
              <div className="flex items-center gap-1 text-secondary">
                <Droplets className="w-4 h-4" />
                <span className="text-sm font-bold font-body">{weather.humidity}%</span>
              </div>
            </div>
          )}
          <Link to="/sos"
            className="clay-btn-danger flex items-center justify-center gap-3 py-5 text-xl font-heading font-extrabold relative overflow-hidden rounded-2xl">
            <span className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping opacity-20" />
            <AlertTriangle className="w-6 h-6" /> EMERGENCY SOS
          </Link>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link key={card.title} to={card.link} className="clay-card p-5 text-center block">
              <div className="clay-card w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-muted">
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="font-heading text-sm font-bold text-foreground">{card.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground font-body">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent alerts */}
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-foreground">Recent Alerts</h2>
            <Link to="/alerts" className="text-xs text-primary font-body underline">View all</Link>
          </div>
          {alerts.length === 0 && (
            <p className="text-muted-foreground font-body text-sm">No alerts yet. Log your health daily!</p>
          )}
          <div className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className={`clay-card p-4 flex items-center gap-3 border-l-4 ${
                a.risk_level === "HIGH" ? "border-destructive" : a.risk_level === "MEDIUM" ? "border-warning" : "border-success"
              }`}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-body ${
                  RISK_CONFIG[a.risk_level as keyof typeof RISK_CONFIG]?.bg
                } ${RISK_CONFIG[a.risk_level as keyof typeof RISK_CONFIG]?.text}`}>
                  {RISK_CONFIG[a.risk_level as keyof typeof RISK_CONFIG]?.icon} {a.risk_level}
                </span>
                <p className="flex-1 text-sm text-foreground font-body line-clamp-1">{a.message}</p>
                <span className="text-xs text-muted-foreground font-body whitespace-nowrap">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
