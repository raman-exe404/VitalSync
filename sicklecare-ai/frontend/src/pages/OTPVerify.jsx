import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OTPVerify() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone || '';

  async function handleVerify() {
    if (!otp) return setError('Enter the OTP code');
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (error) return setError(error.message);

    // Check if user profile exists
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    navigate(profile ? '/dashboard' : '/register');
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 bg-white">
      <button className="text-brand text-2xl mb-6" onClick={() => navigate('/login')}>← Back</button>
      <div className="text-5xl mb-4 text-center">📲</div>
      <h2 className="text-3xl font-extrabold text-brand mb-2 text-center">Verify OTP</h2>
      <p className="text-center text-gray-500 mb-8">Code sent to <strong>{phone}</strong></p>

      <label className="text-gray-600 font-semibold mb-2">Enter 6-digit code</label>
      <input
        className="input-field text-center text-3xl tracking-widest mb-2"
        type="number"
        maxLength={6}
        placeholder="000000"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

      <button className="btn-primary mt-4" onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify ✅'}
      </button>
    </div>
  );
}
