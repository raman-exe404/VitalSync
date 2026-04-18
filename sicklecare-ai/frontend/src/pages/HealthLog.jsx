import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveHealthLog } from '../lib/api';
import BottomNav from '../components/BottomNav';

function Slider({ icon, label, value, onChange, min = 0, max = 10, step = 0.5 }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <label className="font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-2xl">{icon}</span> {label}
        </label>
        <span className="text-brand font-bold text-lg">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand h-3 rounded-full" />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

const SYMPTOMS = ['Fatigue', 'Joint Pain', 'Chest Pain', 'Headache', 'Fever', 'Swelling', 'Shortness of Breath', 'Nausea'];

export default function HealthLog() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ water: 2, sleep: 7, stress: 3, pain: 2, temperature: 25 });
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function toggleSymptom(s) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      // Demo mode: run risk logic client-side
      if (profile.id?.startsWith('demo-')) {
        const { water, stress, temperature } = form;
        let level, message;
        if (water < 2 && stress > 7 && temperature < 15) {
          level = 'HIGH'; message = 'High crisis risk: very low hydration, high stress, and cold temperature detected.';
        } else if (water < 3 || stress > 5) {
          level = 'MEDIUM'; message = 'Moderate risk: low water intake or elevated stress. Drink more water and rest.';
        } else {
          level = 'LOW'; message = 'Low risk: your vitals look stable today. Keep it up!';
        }
        const logs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
        logs.unshift({ ...form, symptoms, created_at: new Date().toISOString() });
        localStorage.setItem('offline_logs', JSON.stringify(logs.slice(0, 50)));
        navigate('/risk-result', { state: { risk: { level, message } } });
        setLoading(false);
        return;
      }

      const { data } = await saveHealthLog({ user_id: profile.id, ...form, symptoms });
      // Save offline backup
      const logs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
      logs.unshift({ ...form, symptoms, created_at: new Date().toISOString() });
      localStorage.setItem('offline_logs', JSON.stringify(logs.slice(0, 50)));
      navigate('/risk-result', { state: { risk: data.risk } });
    } catch (err) {
      // Offline fallback
      const logs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
      logs.unshift({ ...form, symptoms, created_at: new Date().toISOString(), offline: true });
      localStorage.setItem('offline_logs', JSON.stringify(logs.slice(0, 50)));
      setError('Saved offline. Will sync when connected.');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-5 rounded-b-3xl mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-2xl font-extrabold">Daily Health Log 📋</h2>
        <p className="text-sm opacity-80">How are you feeling today?</p>
      </div>

      <div className="px-6">
        <Slider icon="💧" label="Water (litres)" value={form.water} onChange={v => update('water', v)} min={0} max={5} />
        <Slider icon="😴" label="Sleep (hours)" value={form.sleep} onChange={v => update('sleep', v)} min={0} max={12} />
        <Slider icon="😰" label="Stress Level" value={form.stress} onChange={v => update('stress', v)} min={0} max={10} />
        <Slider icon="🤕" label="Pain Level" value={form.pain} onChange={v => update('pain', v)} min={0} max={10} />
        <Slider icon="🌡️" label="Temperature (°C)" value={form.temperature} onChange={v => update('temperature', v)} min={10} max={45} />

        <h3 className="font-bold text-gray-700 mb-3">Symptoms</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {SYMPTOMS.map(s => (
            <button key={s} onClick={() => toggleSymptom(s)}
              className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${symptoms.includes(s) ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600'}`}>
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-yellow-600 bg-yellow-50 rounded-xl p-3 mb-3 text-sm">{error}</p>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Submit Log 📤'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
