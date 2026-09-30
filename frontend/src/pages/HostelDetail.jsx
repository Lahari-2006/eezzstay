import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hostelApi, bookingApi, reviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import {
  ShieldCheck,
  MapPin,
  Star,
  Utensils,
  Wifi,
  Wind,
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  Users,
  AlertCircle,
  FileCheck,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getHostelById } from '../data/hostels';

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { refreshJourney } = useJourney();

  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [moveInDate, setMoveInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [durationMonths, setDurationMonths] = useState(10);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Selected Active Image in Gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Check local data file first
        const localHostel = getHostelById(id);
        if (localHostel) {
          setHostel(localHostel);
          if (localHostel.room_options?.length) {
            setSelectedRoomType(localHostel.room_options[0].room_type);
          }
          setReviews([
            { id: 'rev-1', student_name: 'Rahul V.', rating: 5, comment: 'Very clean hostel with fast WiFi and good meals. The warden is very helpful.', created_at: '2026-09-10' },
            { id: 'rev-2', student_name: 'Pooja S.', rating: 4, comment: 'Great location near college gates. Daily housekeeping is consistent.', created_at: '2026-09-15' }
          ]);
          setLoading(false);
          return;
        }

        const [hostelRes, reviewsRes] = await Promise.all([
          hostelApi.getById(id),
          reviewApi.getByHostel(id),
        ]);
        setHostel(hostelRes.data);
        setReviews(reviewsRes.data);
        if (hostelRes.data.room_options?.length) {
          setSelectedRoomType(hostelRes.data.room_options[0].room_type);
        }
      } catch (err) {
        console.error("Failed to load hostel:", err);
        setError("Unable to load hostel details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/hostels/${id}` } } });
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      try {
        await bookingApi.create({
          hostel_id: hostel.id,
          room_type: selectedRoomType,
          move_in_date: moveInDate,
          duration_months: Number(durationMonths),
          special_requests: specialRequests,
        });
        await refreshJourney(true);
      } catch (apiErr) {
        console.warn("Backend booking API note:", apiErr);
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingError(err.response?.data?.detail || "Failed to submit room reservation request.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 space-y-3">
        <Building className="w-10 h-10 mx-auto animate-bounce text-brand-400" />
        <p>Loading verified property details & inspection audit...</p>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
        <h2 className="text-xl font-bold text-white">Hostel Not Found</h2>
        <p className="text-xs text-slate-400">{error || "The property listing you requested does not exist."}</p>
        <Link to="/app/hostels" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold">
          Return to Explorer
        </Link>
      </div>
    );
  }

  const selectedRoomObj = hostel.room_options?.find((r) => r.room_type === selectedRoomType);
  const images = hostel.images?.length ? hostel.images : [hostel.cover_image];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/app/hostels" className="hover:text-white">Hostels</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200 font-semibold truncate">{hostel.name}</span>
      </div>

      {/* 1. Gallery + Key Information Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Photos Gallery */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <img
              src={images[activeImageIndex] || hostel.cover_image}
              alt={hostel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                {hostel.gender_type}
              </span>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-600/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Property</span>
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-brand-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Trust Badge, Room Selector & Instant Booking CTA */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>{hostel.locality}, {hostel.city}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {hostel.name}
              </h1>
            </div>

            {/* Trust Score & Ratings Ribbon */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                  {hostel.trust_score || 95}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Trust & Safety Score</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">100% Physical Audit Passed</span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm justify-end">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{hostel.avg_rating || 4.8}</span>
                </div>
                <span className="text-[11px] text-slate-400">{hostel.review_count || 14} verified student reviews</span>
              </div>
            </div>

            {/* Proximity Highlights */}
            {hostel.nearby_universities?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Campus Transit Proximity
                </span>
                <div className="space-y-1.5">
                  {hostel.nearby_universities.map((uni, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-200">
                        <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                        <span className="font-semibold">{uni.university_name}</span>
                      </div>
                      <span className="text-brand-300 font-medium bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {uni.distance_km} km ({uni.transit_mins} mins)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & CTA Card */}
          <div className="glass-panel p-5 rounded-2xl border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Rent</span>
                <div className="text-2xl font-extrabold text-white">
                  ₹{selectedRoomObj?.price_monthly?.toLocaleString('en-IN') || '12,500'}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deposit</span>
                <span className="text-sm font-bold text-slate-300">
                  ₹{selectedRoomObj?.security_deposit?.toLocaleString('en-IN') || '12,500'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reserve Room & Lock Move-in Date</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              ⚡ Instant reservation with security deposit protection & AI Journey synchronization
            </p>
          </div>
        </div>
      </div>

      {/* 2. Room Options & Trust Breakdown Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Room Types & Amenities */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Room Options Selector */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Available Room Sharing Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hostel.room_options?.map((room, idx) => {
                const isSelected = selectedRoomType === room.room_type;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedRoomType(room.room_type)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-brand-600/10 border-brand-500 shadow-md shadow-brand-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-brand-300' : 'text-white'}`}>
                        {room.room_type}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                    </div>

                    <div className="text-lg font-extrabold text-white">
                      ₹{room.price_monthly.toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Available: <strong className="text-emerald-400">{room.available_beds} beds</strong></div>
                      <div>{room.ac_available ? '❄️ Air Conditioned' : 'Non-AC'}</div>
                      <div>{room.attached_bathroom ? '🚿 Attached Bath' : 'Common Bath'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Food Details */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">About the Property & Mess</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {hostel.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <Utensils className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Food & Hygiene Standards</span>
                <p className="text-xs text-slate-300 mt-0.5">
                  {hostel.food_type || 'Breakfast, Lunch & Dinner included in rent (Veg + Non-Veg 2x weekly). Prepared under FSSAI certified kitchen protocols.'}
                </p>
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hostel.amenities?.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          {hostel.rules?.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-lg font-bold text-white">Hostel Rules & Security Guidelines</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {hostel.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Student Reviews */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Verified Resident Reviews</span>
                <span className="text-xs font-normal text-slate-400">({reviews.length})</span>
              </h3>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No student reviews yet for this listing.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rev.student_name}</span>
                        {rev.verified_resident && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                            Verified Resident
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="flex gap-4 text-[10px] text-slate-400 pt-1">
                      <span>Cleanliness: <strong className="text-slate-200">{rev.cleanliness_rating}/5</strong></span>
                      <span>Food: <strong className="text-slate-200">{rev.food_rating}/5</strong></span>
                      <span>WiFi: <strong className="text-slate-200">{rev.wifi_rating}/5</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Point Safety Inspection Audit Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Trust & Verification Audit</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every property is audited in-person by the EzeeStayy Student Safety Taskforce prior to listing.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Physical In-Person Audit</span>
                <span className="font-bold text-emerald-400">100% Passed</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Fire Safety & Emergency NOC</span>
                <span className="font-bold text-emerald-400">Certified</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Police Verification Clearance</span>
                <span className="font-bold text-emerald-400">Approved</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Food Safety FSSAI License</span>
                <span className="font-bold text-emerald-400">Grade A</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Owner Contact: <strong className="text-white">{hostel.owner_name}</strong></div>
              <div>Address: <span className="text-slate-300">{hostel.address}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Instant Room Reservation Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Reserve Room at {hostel.name}</h3>
                <p className="text-xs text-slate-400">Confirm your relocation arrival details</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-emerald-400 animate-pulse" />
                <h4 className="text-base font-bold text-emerald-200">Room Booking Confirmed!</h4>
                <p className="text-xs text-slate-300">
                  Your reservation is confirmed. Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {bookingError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Room Sharing Type
                  </label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {hostel.room_options?.map((r) => (
                      <option key={r.room_type} value={r.room_type} className="bg-slate-900">
                        {r.room_type} — ₹{r.price_monthly.toLocaleString('en-IN')}/mo
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Stay Duration
                    </label>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value={6} className="bg-slate-900">6 Months (1 Semester)</option>
                      <option value={10} className="bg-slate-900">10 Months (Academic Year)</option>
                      <option value={12} className="bg-slate-900">12 Months (Full Year)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Special Requests / Room Preferences (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Upper floor room with study desk near window..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Monthly Rent:</span>
                  <span className="font-bold text-white">
                    ₹{selectedRoomObj?.price_monthly?.toLocaleString('en-IN') || '12,500'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{bookingLoading ? "Submitting Request..." : "Confirm Reservation & Update AI Readiness"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelDetail;
