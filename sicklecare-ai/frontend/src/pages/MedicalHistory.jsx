import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHealthLogs } from '../lib/api';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';

export default function MedicalHistory() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (profile.id?.startsWith('demo-')) {
        const offline = JSON.parse(localStorage.getItem('offline_logs') || '[]');
        // Seed some demo logs if none exist
        if (offline.length === 0) {
          const seed = [
            { water: 3, sleep: 7, stress: 4, pain: 2, temperature: 28, symptoms: ['Fatigue'], created_at: new Date(Date.now() - 86400000).toISOString() },
            { water: 1.5, sleep: 5, stress: 8, pain: 5, temperature: 13, symptoms: ['Joint Pain', 'Headache'], created_at: new Date(Date.now() - 172800000).toISOString() }
          ];
          localStorage.setItem('offline_logs', JSON.stringify(seed));
          setLogs(seed);
        } else {
          setLogs(offline);
        }
        setLoading(false);
        return;
      }
      try {
        const { data } = await getHealthLogs(profile.id);
        setLogs(data);
      } catch {
        const offline = JSON.parse(localStorage.getItem('offline_logs') || '[]');
        setLogs(offline);
      }
      setLoading(false);
    }
    if (profile) load();
  }, [profile]);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-5 rounded-b-3xl mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-2xl font-extrabold">📜 Medical History</h2>
        <p className="text-sm opacity-80">Your past health logs</p>
      </div>

      <div className="px-4">
        {loading && <p className="text-center text-gray-400 py-10">Loading...</p>}
        {!loading && logs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500">No logs yet. Start logging daily!</p>
            <button onClick={() => navigate('/health-log')} className="btn-primary mt-4">Log Now</button>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={log.id || i} className="card mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-600">{new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {log.offline && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Offline</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>💧 Water: <strong>{log.water}L</strong></span>
              <span>😴 Sleep: <strong>{log.sleep}h</strong></span>
              <span>😰 Stress: <strong>{log.stress}/10</strong></span>
              <span>🤕 Pain: <strong>{log.pain}/10</strong></span>
              <span>🌡️ Temp: <strong>{log.temperature}°C</strong></span>
            </div>
            {log.symptoms?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {log.symptoms.map(s => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
