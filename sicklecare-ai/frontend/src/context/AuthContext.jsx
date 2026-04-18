import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Demo credentials — MVP only, no real Supabase needed
export const DEMO_USERS = {
  patient: {
    id: 'demo-patient-001',
    phone: '+2348000000001',
    name: 'Amara Okafor',
    age: 24,
    gender: 'Female',
    location: 'Lagos, Nigeria',
    genotype: 'SS',
    role: 'patient',
    emergency_contact: '6399861130'
  },
  worker: {
    id: 'demo-worker-001',
    phone: '+2348000000002',
    name: 'Dr. Emeka Nwosu',
    age: 38,
    gender: 'Male',
    location: 'Abuja, Nigeria',
    genotype: 'AS',
    role: 'worker',
    emergency_contact: '6399861130'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore demo session from localStorage
    const demoSession = localStorage.getItem('demo_session');
    if (demoSession) {
      const demoProfile = JSON.parse(demoSession);
      setUser({ id: demoProfile.id, phone: demoProfile.phone, isDemo: true });
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(id) {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    setProfile(data);
  }

  function loginAsDemo(role = 'patient') {
    const demoProfile = DEMO_USERS[role];
    localStorage.setItem('demo_session', JSON.stringify(demoProfile));
    setUser({ id: demoProfile.id, phone: demoProfile.phone, isDemo: true });
    setProfile(demoProfile);
  }

  async function signOut() {
    localStorage.removeItem('demo_session');
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut().catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, fetchProfile, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
