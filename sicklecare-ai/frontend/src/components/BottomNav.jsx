import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/health-log', icon: '📋', label: 'Log' },
  { path: '/sos', icon: '🆘', label: 'SOS' },
  { path: '/chat', icon: '🤖', label: 'AI' },
  { path: '/profile', icon: '👤', label: 'Me' }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {tabs.map(t => (
        <button key={t.path} onClick={() => navigate(t.path)}
          className={`flex flex-col items-center px-3 py-1 rounded-xl transition-colors ${pathname === t.path ? 'text-brand' : 'text-gray-400'}`}>
          <span className="text-2xl">{t.icon}</span>
          <span className="text-xs font-semibold">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
