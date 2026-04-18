import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  async function handleSendOTP() {
    if (!phone) return setError('Enter your phone number');
    setLoading(true);
    setError('');
    const formatted = phone.startsWith('+') ? phone : `+${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (error) return setError(error.message);
    navigate('/verify', { state: { phone: formatted } });
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 bg-white">
      <div className="text-5xl mb-6 text-center">🩸</div>
      <h2 className="text-3xl font-extrabold text-brand mb-2 text-center">SickleCare AI</h2>
      <p className="text-center text-gray-500 mb-10">Enter your phone number to continue</p>

      <label className="text-gray-600 font-semibold mb-2">Phone Number</label>
      <input
        className="input-field mb-2"
        type="tel"
        placeholder="+234 800 000 0000"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

      <button className="btn-primary mt-4" onClick={handleSendOTP} disabled={loading}>
        {loading ? 'Sending...' : 'Send OTP 📲'}
      </button>

      {/* Demo login section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium">or try demo</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { loginAsDemo('patient'); navigate('/dashboard'); }}
            className="flex-1 py-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold text-sm active:scale-95 transition-transform flex flex-col items-center gap-1">
            <span className="text-2xl">🤒</span>
            Demo Patient
          </button>
          <button
            onClick={() => { loginAsDemo('worker'); navigate('/dashboard'); }}
            className="flex-1 py-4 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700 font-bold text-sm active:scale-95 transition-transform flex flex-col items-center gap-1">
            <span className="text-2xl">👨‍⚕️</span>
            Demo Worker
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">Demo mode — no account needed</p>
      </div>
    </div>
  );
}
