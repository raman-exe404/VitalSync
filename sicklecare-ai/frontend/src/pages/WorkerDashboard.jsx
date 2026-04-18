import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';

export default function WorkerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });

  useEffect(() => {
    fetchAllAlerts();
  }, []);

  async function fetchAllAlerts() {
    if (profile?.id?.startsWith('demo-')) {
      const mock = [
        { id: '1', risk_level: 'HIGH', message: 'High crisis risk: very low hydration, high stress, and cold temperature.', created_at: new Date().toISOString(), users: { name: 'Amara Okafor', phone: '+2348000000001' } },
        { id: '2', risk_level: 'MEDIUM', message: 'Moderate risk: low water intake detected.', created_at: new Date(Date.now() - 3600000).toISOString(), users: { name: 'Chidi Eze', phone: '+2348000000003' } },
        { id: '3', risk_level: 'LOW', message: 'Low risk: vitals stable.', created_at: new Date(Date.now() - 86400000).toISOString(), users: { name: 'Ngozi Adeyemi', phone: '+2348000000004' } }
      ];
      setAlerts(mock);
      setStats({ total: mock.length, high: 1, medium: 1, low: 1 });
      return;
    }
    const { data } = await supabase
      .from('alerts')
      .select('*, users(name, phone)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setAlerts(data);
      setStats({
        total: data.length,
        high: data.filter(a => a.risk_level === 'HIGH').length,
        medium: data.filter(a => a.risk_level === 'MEDIUM').length,
        low: data.filter(a => a.risk_level === 'LOW').length
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-6 rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Health Worker 👨‍⚕️</p>
            <h1 className="text-2xl font-extrabold">{profile?.name || 'Worker'}</h1>
          </div>
          <button onClick={signOut} className="text-white opacity-70 text-sm">Sign out</button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[['HIGH', stats.high, 'bg-red-50 text-danger'], ['MEDIUM', stats.medium, 'bg-yellow-50 text-warn'], ['LOW', stats.low, 'bg-green-50 text-safe']].map(([l, v, c]) => (
            <div key={l} className={`card text-center ${c}`}>
              <p className="text-3xl font-extrabold">{v}</p>
              <p className="text-xs font-bold">{l}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={() => navigate('/hospitals')} className="flex-1 card text-center py-4 text-blue-600 font-bold active:scale-95 transition-transform">
            🏥 Hospitals
          </button>
          <button onClick={() => navigate('/chat')} className="flex-1 card text-center py-4 text-purple-600 font-bold active:scale-95 transition-transform">
            🤖 AI Chat
          </button>
        </div>

        <h3 className="font-bold text-gray-700 mb-2">Patient Alerts</h3>
        {alerts.map(a => (
          <div key={a.id} className={`card mb-2 border-l-4 ${a.risk_level === 'HIGH' ? 'border-danger' : a.risk_level === 'MEDIUM' ? 'border-warn' : 'border-safe'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">{a.users?.name || 'Unknown'}</span>
              <RiskBadge level={a.risk_level} />
            </div>
            <p className="text-xs text-gray-500">{a.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
