import { useNavigate } from 'react-router-dom';

export default function Offline() {
  const navigate = useNavigate();
  const offlineLogs = JSON.parse(localStorage.getItem('offline_logs') || '[]');

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📵</div>
        <h2 className="text-2xl font-extrabold text-gray-800">You're Offline</h2>
        <p className="text-gray-500 mt-2">No internet connection. Your logs are saved locally.</p>
      </div>

      <div className="card mb-4 bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-700 font-semibold">
          📦 {offlineLogs.length} log(s) saved offline — will sync when you reconnect.
        </p>
      </div>

      <h3 className="font-bold text-gray-700 mb-3">Offline Logs</h3>
      {offlineLogs.length === 0 && <p className="text-gray-400 text-sm">No offline logs.</p>}
      {offlineLogs.map((log, i) => (
        <div key={i} className="card mb-2">
          <p className="text-xs text-gray-400 mb-1">{new Date(log.created_at).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span>💧 {log.water}L</span>
            <span>😴 {log.sleep}h</span>
            <span>😰 Stress: {log.stress}</span>
            <span>🤕 Pain: {log.pain}</span>
          </div>
        </div>
      ))}

      <button onClick={() => navigate('/')} className="btn-primary mt-6">
        Try Again
      </button>
    </div>
  );
}
