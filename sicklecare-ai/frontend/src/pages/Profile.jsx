import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const { profile, fetchProfile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: profile?.name || '', age: profile?.age || '', location: profile?.location || '', emergency_contact: profile?.emergency_contact || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(f, v) { setForm(p => ({ ...p, [f]: v })); }

  async function handleSave() {
    setSaving(true);
    await supabase.from('users').update({ ...form, age: parseInt(form.age) || null }).eq('id', user.id);
    await fetchProfile(user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-5 rounded-b-3xl mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-2xl font-extrabold">👤 My Profile</h2>
      </div>

      <div className="px-6">
        <div className="card mb-4 text-center py-6">
          <div className="text-6xl mb-2">{profile?.role === 'worker' ? '👨‍⚕️' : '🤒'}</div>
          <p className="font-bold text-xl">{profile?.name}</p>
          <p className="text-gray-500 text-sm">{profile?.phone}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-brand text-white text-xs font-bold capitalize">{profile?.role}</span>
        </div>

        {[['name', 'Full Name', 'text'], ['age', 'Age', 'number'], ['location', 'Location', 'text'], ['emergency_contact', 'Emergency Contact', 'tel']].map(([field, label, type]) => (
          <div key={field} className="mb-4">
            <label className="text-gray-600 font-semibold mb-1 block">{label}</label>
            <input className="input-field" type={type} value={form[field]} onChange={e => update(field, e.target.value)} />
          </div>
        ))}

        <div className="card mb-4">
          <p className="text-sm text-gray-500">Genotype: <strong>{profile?.genotype || '—'}</strong></p>
        </div>

        <button className="btn-primary mb-3" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
        </button>
        <button className="btn-secondary" onClick={signOut}>Sign Out</button>
      </div>

      <BottomNav />
    </div>
  );
}
