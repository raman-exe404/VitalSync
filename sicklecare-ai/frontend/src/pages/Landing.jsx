import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand px-6 text-white">
      <div className="text-6xl mb-4">🩸</div>
      <h1 className="text-4xl font-extrabold mb-2 text-center">SickleCare AI</h1>
      <p className="text-lg text-center mb-10 opacity-90">Your daily health companion for sickle cell care</p>
      <button className="w-full py-4 rounded-2xl bg-white text-brand text-xl font-bold mb-4 active:scale-95 transition-transform"
        onClick={() => navigate('/login')}>
        Get Started
      </button>
      <button className="w-full py-4 rounded-2xl border-2 border-white text-white text-xl font-bold active:scale-95 transition-transform"
        onClick={() => navigate('/login')}>
        Sign In
      </button>
      <p className="mt-6 text-white/60 text-sm text-center">No account? Use Demo Login on the next screen</p>
    </div>
  );
}
