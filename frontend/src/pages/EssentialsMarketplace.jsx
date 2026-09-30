import React, { useState, useEffect } from 'react';
import { essentialsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Star,
  Plus,
  Minus,
  Trash2,
  Truck,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EssentialsMarketplace = () => {
  const { user, isAuthenticated } = useAuth();
  const { journey, refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [bundles, setBundles] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart State: array of { item_id, item_type, title, price_inr, quantity }
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Delivery details
  const [deliveryAddress, setDeliveryAddress] = useState(
    journey?.hostel_name ? `Room Assigned, ${journey.hostel_name}, Hyderabad` : 'Room 304, Stanza Living Kyoto House, Hyderabad'
  );
  const [deliveryCity, setDeliveryCity] = useState(journey?.target_city || user?.target_city || 'Hyderabad');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    if (journey?.move_in_date) return journey.move_in_date;
    if (user?.move_in_date) return user.move_in_date;
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const [bundlesRes, itemsRes] = await Promise.all([
          essentialsApi.getBundles(),
          essentialsApi.getItems(selectedCategory || undefined),
        ]);
        setBundles(bundlesRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error("Failed to load essentials catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, [selectedCategory]);

  const addToCart = (product, type = 'bundle') => {
    const existing = cart.find((c) => c.item_id === product.id);
    if (existing) {
      setCart(cart.map((c) => (c.item_id === product.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([
        ...cart,
        {
          item_id: product.id,
          item_type: type,
          title: product.title || product.name,
          price_inr: product.price_inr,
          quantity: 1,
        },
      ]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId, delta) => {
    setCart(
      cart
        .map((c) => {
          if (c.item_id === itemId) {
            const newQ = c.quantity + delta;
            return newQ > 0 ? { ...c, quantity: newQ } : null;
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price_inr * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/luggage-packs' } } });
      return;
    }

    setOrderLoading(true);
    try {
      await essentialsApi.createOrder({
        items: cart,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        destination_hostel_id: journey?.hostel_id || null,
        scheduled_delivery_date: deliveryDate,
        contact_phone: contactPhone,
      });

      await refreshJourney(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
        navigate('/dashboard');
      }, 2200);
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place luggage pack order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Luggage Packs</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Pre-Packed Luggage Packs & Room Essentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Pre-packed bags and essential items for hostel living, including bedding, study supplies, and daily room necessities delivered to your room.
          </p>
        </div>

        {/* Floating Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="self-start md:self-auto px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-amber-600/30 transition-all hover:scale-105"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
          {cartTotal > 0 && <span className="text-amber-200">₹{cartTotal.toLocaleString('en-IN')}</span>}
        </button>
      </div>

      {/* 1. Curated Bundles Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Luggage Starter Packs</span>
          </h2>
          <p className="text-xs text-slate-400">Save money with complete pre-assembled room packs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {bundle.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                      {bundle.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-extrabold text-white">
                      ₹{bundle.price_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-400 line-through">
                      ₹{bundle.original_price_inr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {bundle.description}
                </p>

                {/* Items Included List */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    What's in this kit:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {bundle.items_included?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold">
                  ⚡ Save ₹{bundle.savings_inr.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => addToCart(bundle, 'bundle')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Kit to Room Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. À La Carte Items Catalog */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">À La Carte Essentials</h2>
            <p className="text-xs text-slate-400">Add individual items to your move-in parcel</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { label: 'All Items', val: '' },
              { label: 'Bed & Bath', val: 'bedding_bath' },
              { label: 'Study & Tech', val: 'study_tech' },
              { label: 'Kitchenette', val: 'kitchenette' },
              { label: 'Hygiene & Cleaning', val: 'hygiene_cleaning' },
            ].map((cat) => (
              <button
                key={cat.val}
                onClick={() => setSelectedCategory(cat.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.val
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center gap-1 border border-slate-700">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{item.rating || 4.8}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-white">
                      ₹{item.price_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 line-through ml-1.5">
                      ₹{item.original_price_inr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(item, 'item')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 border border-slate-700 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Cart & Checkout Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Your Luggage Pack Items</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-emerald-400 animate-pulse" />
                <h4 className="text-base font-bold text-emerald-200">Luggage Pack Order Confirmed!</h4>
                <p className="text-xs text-slate-300">
                  Your kit is reserved and added to your move-in checklist.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-slate-400 text-xs">
                <Package className="w-8 h-8 mx-auto text-slate-600" />
                <p>Your cart is empty. Add a starter bundle to get ready for move-in.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-5">
                
                {/* Cart Items List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((c) => (
                    <div
                      key={c.item_id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 truncate">
                        <span className="font-bold text-white block truncate">{c.title}</span>
                        <span className="text-[11px] text-amber-400">₹{c.price_inr.toLocaleString('en-IN')} each</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(c.item_id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">{c.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(c.item_id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Information */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Direct Dorm Room Delivery Details
                  </span>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Dorm Delivery Address / PG Room</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Scheduled Date</label>
                      <input
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary Total */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Total Dorm Order:</span>
                  <span className="text-lg font-extrabold text-white">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
                >
                  <Package className="w-4 h-4" />
                  <span>{orderLoading ? "Processing Dorm Order..." : "Confirm & Deliver to Room"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EssentialsMarketplace;
