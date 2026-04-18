import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import OTPVerify from './pages/OTPVerify';
import Register from './pages/Register';
import Landing from './pages/Landing';
import PatientDashboard from './pages/PatientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import HealthLog from './pages/HealthLog';
import RiskResult from './pages/RiskResult';
import SOS from './pages/SOS';
import NearbyHospitals from './pages/NearbyHospitals';
import BloodSupport from './pages/BloodSupport';
import AIChat from './pages/AIChat';
import MedicalHistory from './pages/MedicalHistory';
import Profile from './pages/Profile';
import Offline from './pages/Offline';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-brand text-2xl">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function DashboardRoute() {
  const { profile } = useAuth();
  if (!profile) return null;
  return profile.role === 'worker' ? <WorkerDashboard /> : <PatientDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<OTPVerify />} />
          <Route path="/register" element={<Register />} />
          <Route path="/offline" element={<Offline />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
          <Route path="/health-log" element={<ProtectedRoute><HealthLog /></ProtectedRoute>} />
          <Route path="/risk-result" element={<ProtectedRoute><RiskResult /></ProtectedRoute>} />
          <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute><NearbyHospitals /></ProtectedRoute>} />
          <Route path="/blood-support" element={<ProtectedRoute><BloodSupport /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
