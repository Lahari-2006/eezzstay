import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllHostels, universityHostelsData } from '../data/hostels';
import HostelCard from '../components/HostelCard';
import {
  Building,
  Search,
  ShieldCheck,
  GraduationCap,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

const HostelExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Filters
  const [selectedUniversity, setSelectedUniversity] = useState(searchParams.get('university') || '');
  const [genderType, setGenderType] = useState(searchParams.get('gender_type') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('max_price')) || 25000);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  // University options from central data
  const universityOptions = universityHostelsData.map((u) => u.university);

  // Filter hostels locally from central data file
  const allHostels = getAllHostels();
  const [filteredHostels, setFilteredHostels] = useState(allHostels);

  useEffect(() => {
    let result = [...allHostels];

    if (selectedUniversity) {
      result = result.filter((h) =>
        h.university?.toLowerCase().includes(selectedUniversity.toLowerCase())
      );
    }

    if (genderType) {
      result = result.filter(
        (h) => h.gender_type?.toLowerCase() === genderType.toLowerCase()
      );
    }

    if (verifiedOnly) {
      result = result.filter((h) => h.verification_status === 'verified');
    }

    if (maxPrice) {
      result = result.filter((h) => (h.price_num || 10000) <= maxPrice);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q) ||
          h.university?.toLowerCase().includes(q) ||
          h.locality?.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q)
      );
    }

    setFilteredHostels(result);
  }, [selectedUniversity, genderType, maxPrice, searchQuery, verifiedOnly]);

  const resetFilters = () => {
    setSelectedUniversity('');
    setGenderType('');
    setMaxPrice(25000);
    setSearchQuery('');
    setVerifiedOnly(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-brand-500/30 text-brand-300 text-xs font-semibold">
          <Building className="w-3.5 h-3.5" />
          <span>Student Accommodations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Verified Student Hostels & PGs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Browse clean, safe rooms near your university campus. Select your university below to view nearby hostel options.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* University Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              University Campus
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <GraduationCap className="w-4 h-4 text-brand-400 shrink-0" />
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">All Universities</option>
                {universityOptions.map((uni) => (
                  <option key={uni} value={uni} className="bg-slate-900 text-white">
                    {uni}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hostel Type
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <select
                value={genderType}
                onChange={(e) => setGenderType(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">All (Boys / Girls)</option>
                <option value="Boys" className="bg-slate-900 text-white">Boys Hostel</option>
                <option value="Girls" className="bg-slate-900 text-white">Girls Hostel</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Search by Name or Area
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Bowrampet, AC room..."
                className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-slate-500"
              />
            </div>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Max Budget</span>
              <span className="text-brand-400">₹{maxPrice.toLocaleString('en-IN')}/mo</span>
            </div>
            <input
              type="range"
              min="7000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 mt-2"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-white font-bold">{filteredHostels.length}</span>
            <span>hostels found</span>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      </div>

      {/* Hostels Grid */}
      {filteredHostels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHostels.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} targetUniversity={selectedUniversity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <Building className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Hostels Match Your Search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your budget or selecting a different university to view available rooms.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default HostelExplorer;
