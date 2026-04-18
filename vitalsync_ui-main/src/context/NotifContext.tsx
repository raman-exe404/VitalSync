import { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface AppAlert {
  id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotifContextType {
  alerts: AppAlert[];
  unreadCount: number;
  toast: AppAlert | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addAlert: (a: AppAlert) => void;
  dismissToast: () => void;
}

const NotifContext = createContext<NotifContextType | null>(null);
export { NotifContext };

export function NotifProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [toast, setToast] = useState<AppAlert | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset alerts on user change
  useEffect(() => {
    setAlerts([]);
  }, [profile?.id]);

  function addAlert(a: AppAlert) {
    setAlerts(prev => {
      // Avoid duplicates
      if (prev.find(x => x.id === a.id)) return prev;
      return [a, ...prev];
    });
    showToast(a);
  }

  function showToast(a: AppAlert) {
    setToast(a);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }

  function dismissToast() {
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }

  function markRead(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  }

  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  }

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <NotifContext.Provider value={{ alerts, unreadCount, toast, markRead, markAllRead, addAlert, dismissToast }}>
      {children}
    </NotifContext.Provider>
  );
}

// useNotif hook → src/hooks/useNotif.ts
