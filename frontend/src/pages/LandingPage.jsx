import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building,
  Truck,
  Package,
  ArrowRight,
  Search,
  MapPin,
  GraduationCap,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { universityHostelsData, getAllHostels } from '../data/hostels';
import HostelCard from '../components/HostelCard';
import MoveInChecklist from '../components/MoveInChecklist';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedUni, setSelectedUni] = useState('KL University, Hyderabad');

  // 3 Real University Locations
  const universities = universityHostelsData.map((item) => ({
    name: item.university,
    city: item.city,
    count: `${item.hostels.length} Hostels available`,
  }));

  const allHostels = getAllHostels();
  const featuredHostels = allHostels.slice(0, 3);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hostels?university=${encodeURIComponent(selectedUni)}`);
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-10 lg:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Simple Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            <span>Student Hostel Booking & Move-In</span>
          </div>

          {/* Main Headline in Everyday English */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Moving to College? <br />
            <span className="text-brand-400">Find Your Hostel</span> & Move in Easily.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find verified student hostels near your campus, send your luggage from home, and order your essential room packs before you arrive.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="p-3 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col sm:flex-row gap-3 items-center max-w-xl mx-auto text-left"
          >
            <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <GraduationCap className="w-5 h-5 text-brand-400 shrink-0" />
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none w-full cursor-pointer"
              >
                {universities.map((u) => (
                  <option key={u.name} value={u.name} className="bg-slate-900 text-white">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search Hostels</span>
            </button>
          </form>

          {/* Trust points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Hostels</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Door-to-Door Luggage Shipping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Hostel Luggage Packs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Simple Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest">
            How EzeeStayy Helps
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Three simple steps for college move-in
          </h3>
          <p className="text-sm text-slate-400">
            Everything you need arranged in one place so your first day at college is stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">1. Verified Hostels</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse verified student rooms near your campus with verified prices, room photos, meal details, and safety checks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">From ₹8,000/month</span>
              <Link to="/hostels" className="text-xs font-bold text-brand-400 flex items-center gap-1 hover:underline">
                Find Hostels <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">2. Luggage Shipping</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send heavy luggage, books, and clothes directly from your home to your hostel room so you travel light.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Doorstep Pickup</span>
              <Link to="/luggage-shipping" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                Send Luggage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">3. Luggage Packs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-order curated starter bundles: bedsheets, pillows, study lamps, and room essentials ready in your room on arrival.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Room Essentials</span>
              <Link to="/luggage-packs" className="text-xs font-bold text-amber-400 flex items-center gap-1 hover:underline">
                View Packs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Honest Move-In Checklist Section (Replacing AI Readiness Score) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MoveInChecklist />
      </section>

      {/* 4. Verified Hostels Section (User explicitly requested to keep this) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">
              Verified Hostels
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Inspected student rooms near campus
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Every hostel is checked for hygiene, food quality, security, and proximity.
            </p>
          </div>

          <Link
            to="/hostels"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300"
          >
            <span>View all hostels</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHostels.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} targetUniversity={hostel.university} />
          ))}
        </div>
      </section>

      {/* 5. 3 Real University Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Available Campus Locations
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your university location to see nearby student accommodations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {universities.map((uni, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/hostels?university=${encodeURIComponent(uni.name)}`)}
              className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 hover:border-brand-500/40 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{uni.city}</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                  {uni.name}
                </h4>
                <span className="text-xs text-emerald-400 font-medium block">{uni.count}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
