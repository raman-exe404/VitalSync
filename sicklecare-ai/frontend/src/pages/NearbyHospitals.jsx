import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyHospitals } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function NearbyHospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await getNearbyHospitals(coords.latitude, coords.longitude);
          setHospitals(data);
        } catch {
          setError('Could not load hospitals. Check your connection.');
        }
        setLoading(false);
      },
      () => { setError('Location access denied.'); setLoading(false); }
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-5 rounded-b-3xl mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-2xl font-extrabold">🏥 Nearby Hospitals</h2>
        <p className="text-sm opacity-80">Hospitals within 5km of you</p>
      </div>

      <div className="px-4">
        {loading && (
          <div className="text-center py-16">
            <div className="text-5xl animate-pulse mb-3">📍</div>
            <p className="text-gray-500">Finding hospitals near you...</p>
          </div>
        )}
        {error && <p className="text-red-500 text-center py-8">{error}</p>}
        {hospitals.map((h, i) => (
          <div key={i} className="card mb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{h.name}</h3>
                <p className="text-sm text-gray-500 mt-1">📍 {h.address}</p>
                {h.rating && <p className="text-sm text-yellow-500 mt-1">⭐ {h.rating}</p>}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${h.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {h.open === null ? '' : h.open ? 'Open' : 'Closed'}
              </span>
            </div>
            <a href={`https://maps.google.com/?q=${h.lat},${h.lng}`} target="_blank" rel="noreferrer"
              className="mt-3 block text-center py-2 rounded-xl bg-brand text-white font-semibold text-sm">
              Get Directions 🗺️
            </a>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
