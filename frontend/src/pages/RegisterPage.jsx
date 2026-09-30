import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { UserPlus, GraduationCap, Users, AlertCircle, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [targetUniversity, setTargetUniversity] = useState('KL University Hyderabad');
  const [targetCity, setTargetCity] = useState('Hyderabad');
  const [originCity, setOriginCity] = useState('Visakhapatnam');
  const [moveInDate, setMoveInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [studentLinkCode, setStudentLinkCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const universities = [
    'KL University, Hyderabad',
    'KL University, Vijayawada',
    'COEP Technological University, Pune',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        email,
        full_name: fullName,
        phone,
        password,
        role,
        city: targetCity,
        target_university: role === 'student' ? targetUniversity : null,
        target_city: role === 'student' ? targetCity : null,
        origin_city: role === 'student' ? originCity : null,
        move_in_date: role === 'student' ? moveInDate : null,
        student_link_code: role === 'parent' ? studentLinkCode : null,
      };

      await register(payload);
      await refreshJourney();
      navigate('/dashboard');
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.detail || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 items-center justify-center text-white shadow-lg shadow-brand-600/30 mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Create Your EzeeStayy Account
          </h2>
          <p className="text-xs text-slate-400">
            Join thousands of collegiate students relocating with 100% peace of mind.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'student'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>I am a Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'parent'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>I am a Parent</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'student' ? 'Aarav Sharma' : 'Rajesh Sharma'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create secure password (min 6 chars)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Origin Hometown City
                    </label>
                    <input
                      type="text"
                      required
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      placeholder="e.g. Visakhapatnam, Patna, Delhi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target University Campus
                  </label>
                  <select
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {universities.map((u) => (
                      <option key={u} value={u} className="bg-slate-900">
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Parent Specific Fields */}
            {role === 'parent' && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <label className="block text-xs font-semibold text-emerald-300">
                  Student 6-Digit Link Code (Optional)
                </label>
                <input
                  type="text"
                  value={studentLinkCode}
                  onChange={(e) => setStudentLinkCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EZ7891"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono uppercase tracking-widest text-sm focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Ask your son/daughter for their 6-digit link code shown on their student dashboard.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-brand-400 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
