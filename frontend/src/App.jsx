import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import HostelExplorer from './pages/HostelExplorer';
import HostelDetail from './pages/HostelDetail';
import LogisticsBooking from './pages/LogisticsBooking';
import EssentialsMarketplace from './pages/EssentialsMarketplace';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PartnerLoginPage from './pages/PartnerLoginPage';
import HostelDashboard from './pages/HostelDashboard';

// 1. Protected Route Guard for Student Dashboard
const StudentRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Loading session...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (user?.role === 'hostel_owner') {
    return <Navigate to="/hostel-dashboard" replace />;
  }
  return children;
};

// 2. Protected Route Guard for Admin Portal
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Verifying admin access...
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// 3. Protected Route Guard for Hostel Admin Portal
const HostelRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Verifying hostel admin access...
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'hostel_owner') {
    return <Navigate to="/hostel-login" replace />;
  }
  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans relative">
      {/* Main Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<LandingPage />} />

          {/* Public Navigation Links */}
          <Route path="/hostels" element={<HostelExplorer />} />
          <Route path="/hostels/:id" element={<HostelDetail />} />
          <Route path="/luggage-shipping" element={<LogisticsBooking />} />
          <Route path="/shipping" element={<Navigate to="/luggage-shipping" replace />} />
          <Route path="/luggage-packs" element={<EssentialsMarketplace />} />
          <Route path="/packs" element={<Navigate to="/luggage-packs" replace />} />

          {/* Student Auth & Dashboard */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />

          {/* Hostel Admin Portal (Separate Login & Dashboard) */}
          <Route path="/hostel-login" element={<PartnerLoginPage />} />
          <Route
            path="/hostel-dashboard"
            element={
              <HostelRoute>
                <HostelDashboard />
              </HostelRoute>
            }
          />

          {/* Super Admin Portal (Separate Login & Dashboard) */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Backward compatibility redirects */}
          <Route path="/app/login" element={<Navigate to="/login" replace />} />
          <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/hostels" element={<Navigate to="/hostels" replace />} />
          <Route path="/app/hostels/:id" element={<HostelDetail />} />
          <Route path="/app/logistics" element={<Navigate to="/luggage-shipping" replace />} />
          <Route path="/app/essentials" element={<Navigate to="/luggage-packs" replace />} />
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
          <Route path="/partner/login" element={<Navigate to="/hostel-login" replace />} />

          {/* Any unknown URL redirects to /home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <JourneyProvider>
          <AppContent />
        </JourneyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
