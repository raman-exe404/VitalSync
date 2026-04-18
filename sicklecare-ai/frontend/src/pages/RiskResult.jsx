import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const config = {
  HIGH: { color: 'bg-red-50 border-danger', textColor: 'text-danger', icon: '🚨', advice: 'Seek medical attention immediately. Stay hydrated and rest.' },
  MEDIUM: { color: 'bg-yellow-50 border-warn', textColor: 'text-warn', icon: '⚠️', advice: 'Drink more water, reduce stress, and monitor your symptoms.' },
  LOW: { color: 'bg-green-50 border-safe', textColor: 'text-safe', icon: '✅', advice: 'Great job! Keep up your healthy habits.' }
};

export default function RiskResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const risk = state?.risk || { level: 'LOW', message: 'No data available.' };
  const c = config[risk.level] || config.LOW;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24 px-6 pt-10">
      <button onClick={() => navigate('/dashboard')} className="text-brand mb-6">← Dashboard</button>

      <div className={`card border-2 ${c.color} text-center py-10 mb-6`}>
        <div className="text-7xl mb-4">{c.icon}</div>
        <h2 className={`text-4xl font-extrabold mb-2 ${c.textColor}`}>{risk.level} RISK</h2>
        <p className="text-gray-600 text-base">{risk.message}</p>
      </div>

      <div className="card mb-4">
        <h3 className="font-bold text-gray-700 mb-2">💡 What to do</h3>
        <p className="text-gray-600">{c.advice}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/sos')} className="flex-1 py-4 rounded-2xl bg-danger text-white font-bold text-lg active:scale-95 transition-transform">
          🆘 SOS
        </button>
        <button onClick={() => navigate('/health-log')} className="flex-1 py-4 rounded-2xl bg-brand text-white font-bold text-lg active:scale-95 transition-transform">
          📋 Log Again
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
