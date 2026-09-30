import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Sparkles, Building2, ShieldAlert, X, ChevronUp, ChevronDown } from 'lucide-react';

const DemoRoleSwitcher = () => {
  const { user, demoModeEnabled, demoLogin } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);

  // STRICT GATING: Only render if DEMO_MODE is true on backend
  if (!demoModeEnabled) {
    return null;
  }

  const handleRoleSwitch = async (role, redirectPath) => {
    try {
      setLoadingRole(role);
      await demoLogin(role);
      await refreshJourney();
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Demo role switch error:", err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Expanded Popover Panel */}
      {isOpen && (
        <div className="mb-2 w-80 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl p-4 space-y-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Demo Mode Panel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20">
            For development & review only (<code className="text-indigo-300">DEMO_MODE=true</code>). Isolated from real authentication forms.
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Quick Role Simulation
            </span>

            {/* Student */}
            <button
              onClick={() => handleRoleSwitch('student', '/app/dashboard')}
              disabled={loadingRole === 'student'}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                user?.role === 'student'
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>Student (Aarav Sharma)</span>
              </div>
              {user?.role === 'student' && <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            {/* Parent */}
            <button
              onClick={() => handleRoleSwitch('parent', '/app/dashboard')}
              disabled={loadingRole === 'parent'}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                user?.role === 'parent'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Parent View (Rajesh)</span>
              </div>
              {user?.role === 'parent' && <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            {/* Hostel Owner */}
            <button
              onClick={() => handleRoleSwitch('hostel_owner', '/app/hostels')}
              disabled={loadingRole === 'hostel_owner'}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                user?.role === 'hostel_owner'
                  ? 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Hostel Partner (Venkata Rao)</span>
              </div>
              {user?.role === 'hostel_owner' && <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            {/* Admin */}
            <button
              onClick={() => handleRoleSwitch('admin', '/admin/dashboard')}
              disabled={loadingRole === 'admin'}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                user?.role === 'admin'
                  ? 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
                <span>Admin Ops</span>
              </div>
              {user?.role === 'admin' && <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded">Active</span>}
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 shadow-xl backdrop-blur-md transition-all hover:scale-105 text-xs font-semibold"
        title="Developer preview simulation panel"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Demo Mode</span>
        <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded capitalize">
          {user?.role ? user.role.replace('_', ' ') : 'Guest'}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default DemoRoleSwitcher;
