import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-auto pt-10 pb-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          {/* Col 1: Brand & Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white font-sans">
                Ezee<span className="text-brand-400">Stayy</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Helping college students book verified hostels, ship luggage from home, and order essential room packs before move-in day.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified student hostels and PGs</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/home" className="hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/hostels" className="hover:text-brand-400 transition-colors">
                  Hostels & PGs
                </Link>
              </li>
              <li>
                <Link to="/luggage-shipping" className="hover:text-brand-400 transition-colors">
                  Luggage Shipping
                </Link>
              </li>
              <li>
                <Link to="/luggage-packs" className="hover:text-brand-400 transition-colors">
                  Luggage Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: University Locations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Campus Locations</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>KL University, Hyderabad</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>KL University, Vijayawada</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>COEP Technological University, Pune</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Need help? Student Helpline: <strong className="text-brand-400">+91 94401 56789</strong>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EzeeStayy. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built for college students moving to campus</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
