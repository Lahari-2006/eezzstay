import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import MoveInChecklist from '../components/MoveInChecklist';
import {
  Building,
  Truck,
  Package,
  Calendar,
  MapPin,
  GraduationCap,
  LogOut,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { journey } = useJourney();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const isParent = user?.role === 'parent';

  // Checklist items based on real status
  const checklistItems = [
    {
      id: 1,
      title: 'Hostel Booked',
      desc: journey?.booking_status === 'confirmed' ? `Reserved at ${journey.hostel_name || 'Hostel'}` : 'Browse and book a room near campus',
      completed: journey?.booking_status === 'confirmed',
      link: '/hostels',
    },
    {
      id: 2,
      title: 'Documents Ready',
      desc: 'Keep college admission letter and student ID handy for hostel check-in',
      completed: true,
      link: null,
    },
    {
      id: 3,
      title: 'Luggage Shipped',
      desc: journey?.logistics_status && journey.logistics_status !== 'not_started' ? `Status: ${journey.logistics_status}` : 'Schedule doorstep pickup from your home',
      completed: journey?.logistics_status && journey.logistics_status !== 'not_started',
      link: '/luggage-shipping',
    },
    {
      id: 4,
      title: 'Room Kit Ordered',
      desc: journey?.essentials_status && journey.essentials_status !== 'not_started' ? 'Room pack reserved' : 'Pre-order bedsheet, pillow, and daily room pack',
      completed: journey?.essentials_status && journey.essentials_status !== 'not_started',
      link: '/luggage-packs',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header with Logout */}
      <div className="bg-slate-900/90 p-6 sm:p-7 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
            <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {isParent ? 'Parent View' : 'My Dashboard'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isParent ? `Tracking ${user?.linked_student_name || 'Student'}'s Move-in` : `Hello, ${user?.full_name?.split(' ')[0] || 'Student'}!`}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <GraduationCap className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{journey?.target_university || user?.target_university || 'KL University, Hyderabad'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{journey?.target_city || user?.target_city || 'Hyderabad'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Move-in: <strong className="text-white">{journey?.move_in_date || user?.move_in_date || 'Upcoming'}</strong></span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* 2. Honest Move-In Checklist */}
      <MoveInChecklist initialItems={checklistItems} isInteractive={true} />

      {/* 3. Three Simple Move-In Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Step 1: Hostels */}
        <Link
          to="/hostels"
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                journey?.booking_status === 'confirmed'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {journey?.booking_status === 'confirmed' ? 'Booked' : 'Not Booked'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
              Hostel Booking
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {journey?.hostel_name ? journey.hostel_name : 'Explore verified student hostels and reserve a bed.'}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-brand-400 font-semibold">
            <span>{journey?.booking_status === 'confirmed' ? 'View Details' : 'Book a Room'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Step 2: Luggage Shipping */}
        <Link
          to="/luggage-shipping"
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Doorstep Pickup
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Luggage Shipping
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send heavy bags, cartons, and luggage from your home directly to your room.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Ship Luggage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Step 3: Luggage Packs */}
        <Link
          to="/luggage-packs"
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Pre-Packaged
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Luggage Packs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-order room starter packs (bedding, pillow, study lamp) placed in your room.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>View Packs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

    </div>
  );
};

export default StudentDashboard;
