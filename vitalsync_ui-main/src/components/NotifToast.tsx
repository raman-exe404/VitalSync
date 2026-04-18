import { useNotif } from '@/hooks/useNotif';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const bg: Record<string, string> = {
  HIGH:   'bg-destructive text-white',
  MEDIUM: 'bg-warning text-white',
  LOW:    'bg-success text-white',
};

const icon: Record<string, string> = { HIGH: '🚨', MEDIUM: '⚠️', LOW: '✅' };

export default function NotifToast() {
  const { toast, dismissToast } = useNotif();
  const navigate = useNavigate();

  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92vw] max-w-sm rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3 animate-fade-in cursor-pointer ${bg[toast.risk_level]}`}
      onClick={() => { navigate('/alerts'); dismissToast(); }}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon[toast.risk_level]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm">{toast.risk_level} RISK ALERT</p>
        <p className="text-xs opacity-90 font-body leading-snug line-clamp-2">{toast.message}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); dismissToast(); }}
        className="flex-shrink-0 opacity-80 hover:opacity-100 mt-0.5"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
