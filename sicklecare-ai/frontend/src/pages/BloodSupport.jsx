import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodSupport() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-5 rounded-b-3xl mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-2xl font-extrabold">🩸 Blood Support</h2>
        <p className="text-sm opacity-80">Find donors and blood banks</p>
      </div>

      <div className="px-4">
        <div className="card mb-4 bg-red-50 border border-red-200">
          <h3 className="font-bold text-danger mb-2">🚨 Need Blood Urgently?</h3>
          <p className="text-sm text-gray-600 mb-3">Contact your nearest blood bank or hospital immediately.</p>
          <a href="tel:112" className="block text-center py-3 rounded-xl bg-danger text-white font-bold">
            Call Emergency: 112
          </a>
        </div>

        <h3 className="font-bold text-gray-700 mb-3">Blood Types</h3>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {bloodTypes.map(b => (
            <div key={b} className="card text-center py-4 bg-red-50">
              <span className="font-extrabold text-danger text-lg">{b}</span>
            </div>
          ))}
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-3">💡 Blood Donation Tips</h3>
          {[
            'Drink plenty of water before donating',
            'Eat a healthy meal 2 hours before',
            'Avoid alcohol 24 hours before',
            'Rest for 10–15 minutes after donating',
            'Sickle cell patients (SS) should NOT donate'
          ].map((tip, i) => (
            <p key={i} className="text-sm text-gray-600 py-2 border-b border-gray-100 last:border-0">
              {i + 1}. {tip}
            </p>
          ))}
        </div>

        <button onClick={() => navigate('/hospitals')} className="btn-primary">
          🏥 Find Nearby Blood Banks
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
