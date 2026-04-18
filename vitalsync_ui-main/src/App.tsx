import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotifProvider } from "@/context/NotifContext";
import NotifToast from "@/components/NotifToast";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DigitalTwin from "./pages/DigitalTwin";
import EmergencySOS from "./pages/EmergencySOS";
import MedicalRecords from "./pages/MedicalRecords";
import Alerts from "./pages/Alerts";
import AIAssistant from "./pages/AIAssistant";
import DoctorDashboard from "./pages/DoctorDashboard";
import StrokeHistory from "./pages/StrokeHistory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm px-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-muted" />
          <div className="w-32 h-6 bg-muted rounded-full" />
        </div>
        <div className="clay-card p-5 space-y-3">
          <div className="w-3/4 h-5 bg-muted rounded-full" />
          <div className="w-full h-4 bg-muted rounded-full" />
          <div className="w-2/3 h-4 bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="clay-card h-24 bg-muted/50" />)}
        </div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  // User authenticated but no profile yet (e.g. Google OAuth first login)
  if (!profile) return <Navigate to="/register" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotifProvider>
            <NotifToast />
            <PWAInstallPrompt />
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwin /></ProtectedRoute>} />
            <Route path="/sos" element={<ProtectedRoute><EmergencySOS /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/stroke-history" element={<ProtectedRoute><StrokeHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotifProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
