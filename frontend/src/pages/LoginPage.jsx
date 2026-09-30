import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { LogIn, GraduationCap, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { user, isAuthenticated, login, loginWithRole } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as student, go to dashboard
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'student' || user?.role === 'parent')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      await refreshJourney();

      if (loggedInUser.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (loggedInUser.role === 'hostel_owner') {
        navigate('/hostel-dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudentLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithRole('student', {
        full_name: 'Aditya Sharma',
        email: 'student@easystay.com',
        target_university: 'KL University, Hyderabad',
        target_city: 'Hyderabad',
      });
      await refreshJourney();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("Demo student login error:", err);
      setError("Unable to log in as demo student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 items-center justify-center text-brand-400 mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Student Login
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sign in to view your hostel booking, track luggage, and check your move-in checklist.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5">
          
          {/* Quick Demo Login Button for Easy Evaluation */}
          <button
            type="button"
            onClick={handleDemoStudentLogin}
            disabled={loading}
            className="w-full p-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Click here for 1-Click Student Demo Login</span>
          </button>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Signing In..." : "Sign In"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="font-bold text-brand-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
