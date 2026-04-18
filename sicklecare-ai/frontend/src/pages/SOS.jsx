import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendSOS } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function SOS() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');

  async function handleSOS() {
    setStatus('sending');
    try {
      const getLocation = () => new Promise((res, rej) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(p => res(p.coords), () => res(null))
          : res(null)
      );
      const coords = await getLocation();
      await sendSOS({
        user_id: profile.id,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
      setStatus('sent');
      setMessage(`SOS sent to ${profile.emergency_contact || 'your emergency contact'}`);
    } catch (err) {
      setStatus('error');
      setMessage('Failed to send SOS. Please call emergency services directly.');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <div className="bg-danger text-white px-6 pt-10 pb-6 rounded-b-3xl mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-3xl font-extrabold">🆘 Emergency SOS</h2>
        <p className="text-sm opacity-80 mt-1">Send alert to your emergency contact</p>
      </div>

      <div className="px-6 flex flex-col items-center">
        <div className="card w-full text-center mb-6 py-4">
          <p className="text-gray-500 text-sm">Emergency Contact</p>
          <p className="text-xl font-bold text-gray-800">{profile?.emergency_contact || 'Not set — update in Profile'}</p>
        </div>

        {status === 'idle' && (
          <button onClick={handleSOS}
            className="w-48 h-48 rounded-full bg-danger text-white text-2xl font-extrabold shadow-2xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">🆘</span>
            SEND SOS
          </button>
        )}

        {status === 'sending' && (
          <div className="text-center">
            <div className="text-6xl animate-pulse mb-4">📡</div>
            <p className="text-xl font-bold text-gray-700">Sending alert...</p>
          </div>
        )}

        {status === 'sent' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-bold text-green-600">SOS Sent!</p>
            <p className="text-gray-500 mt-2">{message}</p>
            <button onClick={() => setStatus('idle')} className="btn-secondary mt-6">Send Again</button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl font-bold text-danger">Failed</p>
            <p className="text-gray-500 mt-2">{message}</p>
            <button onClick={() => setStatus('idle')} className="btn-primary mt-6">Try Again</button>
          </div>
        )}

        <div className="card w-full mt-8">
          <h3 className="font-bold text-gray-700 mb-3">Emergency Numbers 📞</h3>
          {[['Ambulance', '112'], ['Police', '199'], ['Fire', '150']].map(([name, num]) => (
            <a key={name} href={`tel:${num}`}
              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <span className="font-semibold text-gray-700">{name}</span>
              <span className="text-brand font-bold text-lg">{num}</span>
            </a>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
