import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingApi, adminApi } from '../services/api';
import {
  ShieldAlert,
  Building,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  Users,
  Bed,
  CreditCard,
  Send,
  LogOut,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'hostels' | 'risk_board'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Data states
  const [bookings, setBookings] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [pendingHostels, setPendingHostels] = useState([]);
  const [riskJourneys, setRiskJourneys] = useState([]);

  // Filtering states
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [bookingsRes, kpisRes, hostelsRes, riskRes] = await Promise.allSettled([
        bookingApi.getOwnerRequests(),
        adminApi.getKPIs(),
        adminApi.getVerificationQueue(),
        adminApi.getRiskBoard(),
      ]);

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.data || []);
      }
      if (kpisRes.status === 'fulfilled') {
        setKpis(kpisRes.value.data || null);
      }
      if (hostelsRes.status === 'fulfilled') {
        setPendingHostels(hostelsRes.value.data || []);
      }
      if (riskRes.status === 'fulfilled') {
        setRiskJourneys(riskRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId, newStatus, defaultNotes = '') => {
    try {
      setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
      const notes = prompt(
        `Enter status notes for this booking (${newStatus.toUpperCase()}):`,
        defaultNotes || (newStatus === 'confirmed' ? 'Room allocated & booking confirmed by Ops' : 'Booking unavailable')
      );

      if (notes === null) {
        setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
        return;
      }

      await bookingApi.updateStatus(bookingId, {
        status: newStatus,
        response_notes: notes,
      });

      setStatusMessage({
        type: 'success',
        text: `Booking ${bookingId} has been marked as ${newStatus.toUpperCase()} successfully!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);

      await fetchData();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update booking status.',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleVerifyHostel = async (hostelId, status) => {
    try {
      setActionLoading((prev) => ({ ...prev, [hostelId]: true }));
      await adminApi.verifyHostel(hostelId, {
        status,
        audit_notes: status === 'verified' ? 'Passed physical audit & safety inspection' : 'Audit rejected',
        trust_score: status === 'verified' ? 95 : 40,
      });

      setStatusMessage({
        type: 'success',
        text: `Hostel ${hostelId} marked as ${status.toUpperCase()}!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);

      await fetchData();
    } catch (err) {
      console.error('Failed to verify hostel:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update hostel verification status.',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [hostelId]: false }));
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingFilter === 'all' || b.status === bookingFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.student_name?.toLowerCase().includes(query) ||
      b.booking_reference?.toLowerCase().includes(query) ||
      b.hostel_name?.toLowerCase().includes(query) ||
      b.student_email?.toLowerCase().includes(query) ||
      b.hostel_city?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Banner */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-900/40 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Control Panel</span>
            </span>
            <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
              Role: ADMIN
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Review student bookings, approve hostel verifications, and monitor system activity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>{refreshing ? 'Syncing DB...' : 'Refresh Records'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Bookings</span>
            <Bed className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {bookings.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] pt-1">
            <span className="text-amber-400 font-bold">{pendingCount} Pending</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">{confirmedCount} Confirmed</span>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verified Hostels</span>
            <Building className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {kpis?.hostels_stats?.verified ?? '--'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            {kpis?.hostels_stats?.pending_verification ?? 0} waiting for audit
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Student Moves</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {kpis?.total_student_journeys ?? '--'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Hyderabad & Amaravati Hubs
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {kpis?.average_readiness_score ?? 0}%
          </div>
          <div className="text-[11px] text-emerald-400 pt-1 font-medium">
            Migration Health Tracking
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Student Bookings</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-mono">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hostels')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'hostels'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Hostel Audit Queue</span>
          {pendingHostels.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-mono">
              {pendingHostels.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('risk_board')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'risk_board'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Student Risk Board</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-mono">
            {riskJourneys.length}
          </span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto overflow-x-auto">
              {[
                { label: 'All Requests', val: 'all', count: bookings.length },
                { label: 'Pending', val: 'pending', count: pendingCount },
                { label: 'Confirmed', val: 'confirmed', count: confirmedCount },
                { label: 'Cancelled', val: 'cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.val}
                  onClick={() => setBookingFilter(tab.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    bookingFilter === tab.val
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, ref code, hostel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading platform bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Bed className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Bookings Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No bookings matched your filter criteria. When students book a hostel room through the explorer, their reservation requests will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const isPending = b.status === 'pending';
                const isConfirmed = b.status === 'confirmed';
                const isCancelled = b.status === 'cancelled';

                return (
                  <div
                    key={b.id}
                    className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80 bg-slate-900/50 hover:border-purple-900/50 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                          {b.booking_reference || b.id}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1 ${
                            isConfirmed
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isCancelled && <XCircle className="w-3 h-3" />}
                          <span>{b.status}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Requested: {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Student Info */}
                      <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Student Candidate
                        </span>
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <User className="w-4 h-4 text-brand-400 shrink-0" />
                          <span>{b.student_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{b.student_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{b.student_phone}</span>
                        </div>
                      </div>

                      {/* Hostel & Room Details */}
                      <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Property Reserved
                        </span>
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <Building className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="truncate">{b.hostel_name}</span>
                        </div>
                        <div className="text-slate-400">
                          Room Type: <strong className="text-slate-200">{b.room_type}</strong>
                        </div>
                        <div className="text-slate-400">
                          City: <span className="text-slate-200">{b.hostel_locality || b.hostel_city}</span>
                        </div>
                      </div>

                      {/* Pricing & Dates */}
                      <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Financial & Schedule
                        </span>
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>₹{b.monthly_rent?.toLocaleString('en-IN')}/month</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Move-In: <strong className="text-slate-200">{b.move_in_date}</strong></span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Duration: {b.duration_months || 10} Months • Deposit: ₹{b.security_deposit?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Special Requests & Notes */}
                    {(b.special_requests || b.response_notes) && (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                        {b.special_requests && (
                          <div className="text-slate-300">
                            <strong className="text-slate-400">Student Note: </strong>
                            "{b.special_requests}"
                          </div>
                        )}
                        {b.response_notes && (
                          <div className="text-purple-300">
                            <strong className="text-purple-400">Ops/Owner Remarks: </strong>
                            "{b.response_notes}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                            disabled={actionLoading[b.id]}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Booking</span>
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                            disabled={actionLoading[b.id]}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                          disabled={actionLoading[b.id]}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
                        </button>
                      )}

                      {isCancelled && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                          disabled={actionLoading[b.id]}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Re-instate & Confirm</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOSTEL VERIFICATION QUEUE */}
      {activeTab === 'hostels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Hostel Property Physical & Safety Audit Queue ({pendingHostels.length})
            </h3>
          </div>

          {pendingHostels.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">All Properties Audited</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hostels currently waiting for safety, fire clearance, or physical biometric verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingHostels.map((h) => (
                <div
                  key={h.id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{h.name}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold uppercase">
                        Pending Audit
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Location: {h.locality}, {h.city} • Owner ID: {h.owner_id}
                    </div>
                    <div className="text-xs text-slate-500">
                      Documents submitted: {h.documents?.length || 0} files (Trade License, Fire NOC, Police Consent)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerifyHostel(h.id, 'verified')}
                      disabled={actionLoading[h.id]}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Certify</span>
                    </button>
                    <button
                      onClick={() => handleVerifyHostel(h.id, 'rejected')}
                      disabled={actionLoading[h.id]}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-900 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT RISK BOARD */}
      {activeTab === 'risk_board' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Student Relocation Readiness & Risk Board
            </h3>
            <span className="text-xs text-slate-400">Sorted by lowest readiness score</span>
          </div>

          <div className="space-y-3">
            {riskJourneys.map((j) => {
              const score = j.readiness?.total_score || 0;
              const isCritical = score < 50;
              const isAttention = score >= 50 && score < 80;

              return (
                <div
                  key={j.id || j.student_id}
                  className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{j.student_name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isAttention
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {score}% - {j.readiness?.status_tier || 'Tracking'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Destination: <strong className="text-slate-200">{j.target_university}</strong> ({j.target_city}) • Move-in:{' '}
                      <span className="text-amber-400">{j.move_in_date}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Booking: <strong className="text-slate-300">{j.booking_status || 'not_started'}</strong></span>
                      <span>•</span>
                      <span>Logistics: <strong className="text-slate-300">{j.logistics_status || 'not_started'}</strong></span>
                      <span>•</span>
                      <span>Essentials: <strong className="text-slate-300">{j.essentials_status || 'not_started'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        const alertMsg = prompt(
                          `Send Concierge Intervention Alert to ${j.student_name}:`,
                          'Your move-in date is approaching! Please finalize your hostel booking to avoid last-minute delays.'
                        );
                        if (alertMsg) {
                          try {
                            await adminApi.sendAlert(j.student_id, {
                              title: 'EzeeStayy Ops Concierge Notice',
                              message: alertMsg,
                              severity: 'critical',
                            });
                            alert(`Intervention alert sent to ${j.student_name}!`);
                          } catch (e) {
                            alert('Failed to send alert.');
                          }
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Alert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
