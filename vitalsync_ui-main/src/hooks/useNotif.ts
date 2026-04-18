import { useContext } from 'react';
import { NotifContext } from '@/context/NotifContext';

export function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif must be used within NotifProvider');
  return ctx;
}
