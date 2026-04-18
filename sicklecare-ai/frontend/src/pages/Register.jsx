import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', age: '', gender: '', location: '', genotype: '', role: 'patient', emergency_contact: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function handleSubmit() {
    if (!form.name) return setError('Name is required');
    setLoading(true);
    const { error } = await supabase.from('users').insert([{
      id: user.id,
      phone: user.phone,
      ...form,
      age: parseInt(form.age) || null
    }]);
    setLoading(false);
    if (error) return setError(error.message);
    await fetchProfile(user.id);
    navigate('/dashboard');
  }

  const genders = ['Male', 'Female', 'Other'];
  const genotypes = ['AA', 'AS', 'SS', 'SC', 'CC'];

  return (
    <div className="flex flex-col min-h-screen px-6 py-10 bg-white">
      <h2 className="text-3xl font-extrabold text-brand mb-6 text-center">Create Profile</h2>

      {[['name', 'Full Name', 'text'], ['age', 'Age', 'number'], ['location', 'City / Location', 'text'], ['emergency_contact', 'Emergency Contact Phone', 'tel']].map(([field, label, type]) => (
        <div key={field} className="mb-4">
          <label className="text-gray-600 font-semibold mb-1 block">{label}</label>
          <input className="input-field" type={type} value={form[field]} onChange={e => update(field, e.target.value)} />
        </div>
      ))}

      <label className="text-gray-600 font-semibold mb-1 block">Gender</label>
      <div className="flex gap-3 mb-4">
        {genders.map(g => (
          <button key={g} onClick={() => update('gender', g)}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold ${form.gender === g ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600'}`}>
            {g}
          </button>
        ))}
      </div>

      <label className="text-gray-600 font-semibold mb-1 block">Genotype</label>
      <div className="flex gap-2 mb-4 flex-wrap">
        {genotypes.map(g => (
          <button key={g} onClick={() => update('genotype', g)}
            className={`px-4 py-2 rounded-xl border-2 font-semibold ${form.genotype === g ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600'}`}>
            {g}
          </button>
        ))}
      </div>

      <label className="text-gray-600 font-semibold mb-1 block">Role</label>
      <div className="flex gap-3 mb-6">
        {['patient', 'worker'].map(r => (
          <button key={r} onClick={() => update('role', r)}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold capitalize ${form.role === r ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600'}`}>
            {r === 'patient' ? '🤒 Patient' : '👨‍⚕️ Health Worker'}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile ✅'}
      </button>
    </div>
  );
}
