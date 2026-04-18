import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getWeather } from '../lib/api';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';

export default function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [latestRisk, setLatestRisk] = useState(null);

  useEffect(() => {
    if (!profile) return;
    fetchAlerts();
    fetchWeather();

    // Skip realtime subscription for demo users
    if (profile.id?.startsWith('demo-')) return;

    // Realtime alerts subscription
    const channel = supabase
      .channel('alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts', filter: `user_id=eq.${profile.id}` },
        payload => setAlerts(prev => [payload.new, ...prev]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile]);

  async function fetchAlerts() {
    if (profile.id?.startsWith('demo-')) {
      const mock = [
        { id: '1', risk_level: 'MEDIUM', message: 'Moderate risk: low water intake detected. Drink more water and rest.', created_at: new Date().toISOString() },
        { id: '2', risk_level: 'LOW', message: 'Low risk: your vitals look stable today. Keep it up!', created_at: new Date(Date.now() - 86400000).toISOString() }
      ];
      setAlerts(mock);
      setLatestRisk(mock[0].risk_level);
      return;
    }
    const { data } = await supabase.from('alerts').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5);
    setAlerts(data || []);
    if (data?.length) setLatestRisk(data[0].risk_level);
  }

  async function fetchWeather() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const { data } = await getWeather(coords.latitude, coords.longitude);
        setWeather(data);
      } catch {}
    });
  }

  const quickActions = [
    { icon: '📋', label: 'Log Health', path: '/health-log', color: 'bg-blue-50 text-blue-600' },
    { icon: '🏥', label: 'Hospitals', path: '/hospitals', color: 'bg-green-50 text-green-600' },
    { icon: '🩸', label: 'Blood', path: '/blood-support', color: 'bg-red-50 text-red-600' },
    { icon: '📜', label: 'History', path: '/history', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-brand text-white px-6 pt-10 pb-6 rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Good day 👋</p>
            <h1 className="text-2xl font-extrabold">{profile?.name || 'Patient'}</h1>
            <p className="text-sm opacity-80 mt-1">Genotype: {profile?.genotype || '—'}</p>
          </div>
          <button onClick={signOut} className="text-white opacity-70 text-sm">Sign out</button>
        </div>

        {weather && (
          <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="text-2xl">🌡️</span>
            <div>
              <p className="font-bold">{weather.temperature}°C — {weather.city}</p>
              <p className="text-xs opacity-80 capitalize">{weather.description} · Humidity {weather.humidity}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        {/* Risk Status */}
        {latestRisk && (
          <div className="card mb-4 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-gray-500 text-sm">Latest Risk Level</p>
              <RiskBadge level={latestRisk} />
            </div>
          </div>
        )}

        {/* SOS Button */}
        <button onClick={() => navigate('/sos')}
          className="w-full py-5 rounded-2xl bg-danger text-white text-2xl font-extrabold mb-4 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
          🆘 EMERGENCY SOS
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickActions.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className={`card flex flex-col items-center py-5 gap-2 active:scale-95 transition-transform ${a.color}`}>
              <span className="text-4xl">{a.icon}</span>
              <span className="font-bold text-sm">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Alerts */}
        <h3 className="font-bold text-gray-700 mb-2">Recent Alerts</h3>
        {alerts.length === 0 && <p className="text-gray-400 text-sm">No alerts yet. Log your health daily!</p>}
        {alerts.map(a => (
          <div key={a.id} className={`card mb-2 border-l-4 ${a.risk_level === 'HIGH' ? 'border-danger' : a.risk_level === 'MEDIUM' ? 'border-warn' : 'border-safe'}`}>
            <div className="flex justify-between items-center mb-1">
              <RiskBadge level={a.risk_level} />
              <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-600">{a.message}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
