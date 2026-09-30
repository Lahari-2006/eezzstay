import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/api';
import { universityHostelsData, getAllHostels } from '../data/hostels';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  LogOut,
  Bed,
  MapPin,
  Calendar,
  XCircle,
  Phone,
} from 'lucide-react';

const HostelDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const allHostels = getAllHostels();
  const myHostels = allHostels.slice(0, 2);

  const [filter, setFilter] = useState('all');

  const [bookings, setBookings] = useState([
    {
      id: 'bk-101',
      student_name: 'Aditya Sharma',
      student_phone: '+91 98765 43210',
      hostel_name: myHostels[0]?.name || 'Aravali Boys Hostel',
      room_type: '2-Sharing AC',
      room_bed: 'Room 204 - Bed B',
      move_in_date: '2026-10-15',
      deposit_status: 'Paid (₹5,000)',
      status: 'confirmed',
      duration_months: 10,
    },
    {
      id: 'bk-102',
      student_name: 'Rohan Gupta',
      student_phone: '+91 97654 32109',
      hostel_name: myHostels[0]?.name || 'Aravali Boys Hostel',
      room_type: '3-Sharing Non-AC',
      room_bed: 'Room 102 - Bed A',
      move_in_date: '2026-10-18',
      deposit_status: 'Pending Verification',
      status: 'pending',
      duration_months: 10,
    },
    {
      id: 'bk-103',
      student_name: 'Siddharth Rao',
      student_phone: '+91 96543 21098',
      hostel_name: myHostels[1]?.name || 'KL University Hostel (Hyderabad)',
      room_type: '2-Sharing AC',
      room_bed: 'Room 310 - Bed A',
      move_in_date: '2026-10-20',
      deposit_status: 'Paid (₹5,000)',
      status: 'confirmed',
      duration_months: 12,
    },
    {
      id: 'bk-104',
      student_name: 'Vikram Verma',
      student_phone: '+91 95432 10987',
      hostel_name: myHostels[1]?.name || 'KL University Hostel (Hyderabad)',
      room_type: 'Single Room AC',
      room_bed: 'Room 405 - Bed A',
      move_in_date: '2026-10-22',
      deposit_status: 'Under Review',
      status: 'pending',
      duration_months: 10,
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/hostel-login');
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header with Logout */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Hostel Admin Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hostel Management Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Logged in as: <span className="text-slate-200 font-semibold">{user?.full_name || 'Hostel Admin'}</span> ({user?.email || 'hostel@ezeestayy.com'})
          </p>
        </div>

        {/* Prominent Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Properties</span>
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {myHostels.length} Hostels
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-1">Verified partner listings</span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Confirmed Beds</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {bookings.filter((b) => b.status === 'confirmed').length} Occupied
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Deposit paid & verified
          </span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {bookings.filter((b) => b.status === 'pending').length} Requests
          </div>
          <span className="text-[11px] text-amber-400/80 block mt-1">
            Awaiting owner confirmation
          </span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Available Beds</span>
            <Bed className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {30 - bookings.filter((b) => b.status === 'confirmed').length} Vacant
          </div>
          <span className="text-[11px] text-sky-400 font-medium block mt-1">Total capacity: 30 beds</span>
        </div>
      </div>

      {/* Student Bookings & Bed Allocation Section */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bed className="w-5 h-5 text-amber-400" />
              Confirmed Beds & Booking Requests
            </h2>
            <p className="text-xs text-slate-400">
              Check confirmed bed allocations, verify student deposits, and review incoming requests.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'confirmed'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed Beds ({bookings.filter((b) => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({bookings.filter((b) => b.status === 'pending').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Hostel</th>
                <th className="pb-3 font-semibold">Allocated Bed / Room</th>
                <th className="pb-3 font-semibold">Move-in Date</th>
                <th className="pb-3 font-semibold">Advance Deposit</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bookings
                .filter((b) => (filter === 'all' ? true : b.status === filter))
                .map((booking) => (
                  <tr key={booking.id} className="text-slate-300 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 font-bold text-white">
                      {booking.student_name}
                      <span className="block text-[11px] font-normal text-slate-400">ID: {booking.id}</span>
                    </td>
                    <td className="py-3.5 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{booking.student_phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-200">{booking.hostel_name}</td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 inline-block">
                          {booking.room_bed}
                        </span>
                        <span className="block text-[10px] text-slate-400">{booking.room_type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300">{booking.move_in_date}</td>
                    <td className="py-3.5">
                      <span className={`text-[11px] font-semibold ${
                        booking.deposit_status.includes('Paid') ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {booking.deposit_status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {booking.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Bed Confirmed
                        </span>
                      ) : booking.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Confirm Bed
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[11px] font-bold border border-rose-500/30 cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="text-emerald-400 font-semibold text-[11px]">Allocated</span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-rose-400 font-medium text-[11px]">Declined</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Managed Hostels Information */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Your Registered Hostels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myHostels.map((h) => (
            <div key={h.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white">{h.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    <span>{h.locality}, {h.city}</span>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400">{h.address}</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>Contact: {h.contact}</span>
                <span className="font-bold text-brand-400">{h.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostelDashboard;
