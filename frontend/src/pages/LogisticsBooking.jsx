import React, { useState, useEffect } from 'react';
import { logisticsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LogisticsBooking = () => {
  const { user, isAuthenticated } = useAuth();
  const { journey, refreshJourney } = useJourney();
  const navigate = useNavigate();

  // Booking Form State
  const [originCity, setOriginCity] = useState(user?.origin_city || 'Visakhapatnam');
  const [originAddress, setOriginAddress] = useState('MVP Colony Main Road');
  const [originPincode, setOriginPincode] = useState('530017');
  const [destinationCity, setDestinationCity] = useState(journey?.target_city || user?.target_city || 'Hyderabad');
  const [destinationAddress, setDestinationAddress] = useState(
    journey?.hostel_name ? `${journey.hostel_name}, Bowrampet` : 'KL University Campus Gate 2, Hyderabad'
  );
  const [destinationPincode, setDestinationPincode] = useState('500075');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '+91 98765 43210');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [isExpress, setIsExpress] = useState(false);

  // Packages list
  const [packages, setPackages] = useState([
    { package_type: 'box_medium', label: 'Wardrobe & Clothing Carton', weight_kg: 22.0, quantity: 1 },
    { package_type: 'box_small', label: 'Books, Tech & Stationery Box', weight_kg: 12.0, quantity: 1 },
  ]);

  // Quote state
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'track'

  // My Active Orders state
  const [myOrders, setMyOrders] = useState([]);
  const [searchTrackingNo, setSearchTrackingNo] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Calculate quote automatically on changes
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setQuoteLoading(true);
        const res = await logisticsApi.getQuote({
          origin_city: originCity,
          destination_city: destinationCity,
          packages,
          pickup_date: pickupDate,
          is_express: isExpress,
        });
        setQuote(res.data);
      } catch (err) {
        console.error("Quote calculation error:", err);
      } finally {
        setQuoteLoading(false);
      }
    };

    if (originCity && destinationCity && packages.length > 0) {
      fetchQuote();
    }
  }, [originCity, destinationCity, packages, pickupDate, isExpress]);

  // Load active orders
  const loadMyOrders = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await logisticsApi.getMyOrders();
      setMyOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  useEffect(() => {
    loadMyOrders();
  }, [isAuthenticated]);

  const handleAddPackage = (type, label, weight) => {
    setPackages([...packages, { package_type: type, label, weight_kg: weight, quantity: 1 }]);
  };

  const handleRemovePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/app/login', { state: { from: { pathname: '/app/logistics' } } });
      return;
    }

    setOrderLoading(true);
    try {
      await logisticsApi.createOrder({
        origin_city: originCity,
        origin_address: originAddress,
        origin_pincode: originPincode,
        destination_city: destinationCity,
        destination_hostel_id: journey?.hostel_id || null,
        destination_address: destinationAddress,
        destination_pincode: destinationPincode,
        packages,
        pickup_date: pickupDate,
        is_express: isExpress,
        recipient_phone: recipientPhone,
      });

      await refreshJourney(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      setOrderSuccess(true);
      await loadMyOrders();
      setTimeout(() => {
        setOrderSuccess(false);
        setActiveTab('track');
      }, 2000);
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to schedule logistics pickup. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!searchTrackingNo.trim()) return;
    setTrackError('');
    try {
      const res = await logisticsApi.track(searchTrackingNo.trim());
      setSearchedOrder(res.data);
    } catch (err) {
      setTrackError("Tracking number not found. Please check and retry.");
      setSearchedOrder(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Luggage Shipping</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Send Your Luggage to Your Hostel Room
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Send your heavy luggage directly from home to your college hostel room. We arrange doorstep pickup from your hometown and deliver your bags before move-in day.
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'book'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Book Doorstep Pickup</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'track'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Track Luggage ({myOrders.length})</span>
        </button>
      </div>

      {/* Explainer Callout */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-cyan-300">
            Travel light without hauling heavy luggage
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Book doorstep pickup for your cartons and suitcases. We deliver them right inside your hostel room.
          </p>
        </div>
      </div>

      {/* TAB 1: BOOKING & QUOTE ESTIMATOR */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Route & Package Selection */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
            
            {orderSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-2 text-xs text-emerald-200">
                <Sparkles className="w-6 h-6 mx-auto text-emerald-400 animate-pulse" />
                <h4 className="font-bold text-sm text-emerald-300">Doorstep Pickup Scheduled!</h4>
                <p>Shipment tag generated and saved to your dashboard.</p>
              </div>
            )}

            <form onSubmit={handleOrderSubmit} className="space-y-6">
              
              {/* Origin & Destination Addresses */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Doorstep Route Setup</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase">Pickup (Hometown)</span>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Origin City</label>
                      <input
                        type="text"
                        required
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Pickup Address</label>
                      <input
                        type="text"
                        required
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={originPincode}
                        onChange={(e) => setOriginPincode(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase">Dropoff (College Room)</span>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Destination City</label>
                      <input
                        type="text"
                        required
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Hostel / PG Room Address</label>
                      <input
                        type="text"
                        required
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={destinationPincode}
                        onChange={(e) => setDestinationPincode(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Luggage Packages ({packages.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Total: <strong className="text-white">{packages.reduce((acc, p) => acc + p.weight_kg * p.quantity, 0)} kg</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{pkg.label}</span>
                        <span className="text-slate-400 text-[11px]">Estimated Weight: {pkg.weight_kg} kg</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Presets */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-400 self-center text-[11px]">Add preset:</span>
                  <button
                    type="button"
                    onClick={() => handleAddPackage('box_medium', 'Wardrobe & Clothes Box', 20.0)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Clothes Box (20kg)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPackage('box_small', 'Books & Gadgets Box', 10.0)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Books Box (10kg)</span>
                  </button>
                </div>
              </div>

              {/* Pickup Timing & Express Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student / Recipient Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Express Priority Transit (+₹400)</span>
                  <span className="text-[11px] text-slate-400">Guaranteed 24-hr linehaul speedup</span>
                </div>
                <input
                  type="checkbox"
                  checked={isExpress}
                  onChange={(e) => setIsExpress(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={orderLoading || packages.length === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                <span>{orderLoading ? "Scheduling Consignment..." : "Confirm Doorstep Pickup & Boost AI Readiness"}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Freight Quote Breakdown */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Live Quotation & Transit ETA
                </span>
                {quoteLoading && <Clock className="w-4 h-4 animate-spin text-cyan-400" />}
              </div>

              {quote ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit Distance:</span>
                      <span className="font-semibold text-white">{quote.distance_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Transit Time:</span>
                      <span className="font-semibold text-cyan-300">{quote.estimated_transit_days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Delivery Date:</span>
                      <span className="font-bold text-emerald-400">{quote.estimated_delivery_date}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Origin Hub:</span>
                      <span className="text-slate-200">{quote.origin_hub}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destination Hub:</span>
                      <span className="text-slate-200">{quote.destination_hub}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Insured Freight</span>
                      <span className="text-2xl font-extrabold text-white">
                        ₹{quote.estimated_cost_inr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Includes ₹10,000 Transit Insurance
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Configure your route and packages to generate an instant freight quote.</p>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tamper-evident waterproof seal bags provided at pickup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Real-time GPS line-haul tracking updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE CONSIGNMENTS & TRACKER */}
      {activeTab === 'track' && (
        <div className="space-y-8">
          
          {/* Tracking Search Input */}
          <form onSubmit={handleTrackSearch} className="max-w-xl flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTrackingNo}
                onChange={(e) => setSearchTrackingNo(e.target.value.toUpperCase())}
                placeholder="Enter Tracking No (e.g. EZL-HYD-88219)"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shrink-0"
            >
              Track
            </button>
          </form>

          {trackError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {trackError}
            </div>
          )}

          {/* Searched Consignment View */}
          {searchedOrder && (
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/40 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Consignment</span>
                  <span className="font-mono text-lg font-extrabold text-cyan-400">{searchedOrder.tracking_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Status</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    {searchedOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Checkpoints timeline */}
              <div className="space-y-4 pl-4 border-l-2 border-slate-800">
                {searchedOrder.checkpoints?.map((cp, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{cp.location}</span>
                      <span className="text-slate-500 text-[10px]">{cp.timestamp?.slice(0, 10)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{cp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List of Student's Orders */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Your Scheduled Shipments ({myOrders.length})
            </h3>

            {myOrders.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
                No luggage logistics shipments booked yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myOrders.map((ord) => (
                  <div key={ord.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-cyan-400">{ord.tracking_number}</span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div>From: <span className="text-slate-400">{ord.origin_city}</span></div>
                      <div>To: <span className="text-slate-400">{ord.destination_city} ({ord.destination_hostel_name || 'Assigned Room'})</span></div>
                      <div>ETA: <strong className="text-emerald-400">{ord.estimated_delivery_date}</strong></div>
                      <div>Weight: <span className="text-slate-400">{ord.total_weight_kg} kg ({ord.packages?.length} boxes)</span></div>
                    </div>

                    {/* Latest Checkpoint */}
                    {ord.checkpoints?.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Latest Checkpoint</span>
                        <div className="text-white font-medium">{ord.checkpoints[ord.checkpoints.length - 1].location}</div>
                        <p className="text-slate-400 text-[10px]">{ord.checkpoints[ord.checkpoints.length - 1].description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsBooking;
