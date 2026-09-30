import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Star, ArrowRight, GraduationCap } from 'lucide-react';

const HostelCard = ({ hostel, targetUniversity }) => {
  if (!hostel) return null;

  const minPrice = hostel.room_options?.length
    ? Math.min(...hostel.room_options.map((r) => r.price_monthly))
    : (hostel.price_num || 9500);

  // Find distance to target university if available
  const uniMatch = targetUniversity
    ? hostel.nearby_universities?.find((u) =>
        u.university_name.toLowerCase().includes(targetUniversity.toLowerCase())
      )
    : hostel.nearby_universities?.[0];

  const isVerified = hostel.verification_status === 'verified';

  return (
    <div className="bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-brand-500/40 transition-all duration-300 group flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10">
      
      {/* Cover Image + Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={hostel.photo || hostel.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'}
          alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-700">
            {hostel.gender_type || 'Student'}
          </span>

          {isVerified ? (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-emerald-600/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified PG</span>
            </span>
          ) : (
            <span className="bg-amber-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>Under Verification</span>
            </span>
          )}
        </div>

        {/* Bottom Trust Score & Rating inside image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-700 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{hostel.trust_score || 94}/100 Trust</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700 text-xs font-bold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{hostel.avg_rating || 4.7}</span>
            <span className="text-slate-400 font-normal">({hostel.review_count || 18})</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate">{hostel.locality || hostel.city}, {hostel.city}</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {hostel.name}
          </h3>

          {/* College Proximity Badge */}
          {hostel.university && (
            <div className="mt-2.5 flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg text-xs text-brand-300">
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-brand-400" />
              <span className="truncate">{hostel.university}</span>
            </div>
          )}

          {/* Key Amenities */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hostel.amenities?.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
              >
                {amenity}
              </span>
            ))}
            {hostel.amenities?.length > 3 && (
              <span className="text-[11px] text-slate-500 self-center">
                +{hostel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rent</span>
            <div className="text-sm sm:text-base font-extrabold text-white">
              {hostel.price || `₹${minPrice.toLocaleString('en-IN')} / mo`}
            </div>
          </div>

          <Link
            to={`/hostels/${hostel.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/20 group-hover:scale-105"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HostelCard;
