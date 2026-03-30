import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

// ✅ REPLACE with your real UPI ID
const YOUR_UPI_ID = 'thakurabhishek01@ptyes';
const YOUR_NAME = 'Eatzo';

const Cart = () => {
  const { cart, cartTotal, updateQuantity, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showUPI, setShowUPI] = useState(false);

  const items = cart?.items || [];
  const deliveryFee = 30;
  const total = cartTotal + deliveryFee;

  // UPI deep link — opens GPay/PhonePe/Paytm directly
  const upiLink = `upi://pay?pa=${YOUR_UPI_ID}&pn=${encodeURIComponent(YOUR_NAME)}&am=${total}&cu=INR`;

  // QR code URL using Google Charts API (free, no library needed)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

  const handlePlaceOrder = async () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    if (paymentMethod === 'UPI') {
      setShowUPI(true); // Show UPI modal first
      return;
    }
    await submitOrder();
  };

  const submitOrder = async () => {
    setPlacing(true);
    try {
      await API.post('/orders', {
        deliveryAddress: address,
        paymentMethod,
        customerPhone: phone,
        customerNote: note,
      });
      await fetchCart();
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
      setShowUPI(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some delicious food to get started</p>
        <Link to="/" className="btn-primary">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ── UPI PAYMENT MODAL ── */}
      {showUPI && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-3xl mb-1">📲</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pay ₹{total} via UPI</h3>
            <p className="text-sm text-gray-400 mb-4">Scan QR or click the button to open your UPI app</p>

            {/* QR Code */}
            <div className="flex justify-center mb-3">
              <img src={qrUrl} alt="UPI QR" className="rounded-xl border border-gray-200 p-2" />
            </div>

            {/* UPI ID */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 mb-3">
              <p className="text-xs text-gray-500">UPI ID</p>
              <p className="text-base font-bold text-[#FF6B00] tracking-wide">{YOUR_UPI_ID}</p>
            </div>

            {/* Open UPI App button — works on mobile */}
            <a
              href={upiLink}
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl mb-3 text-sm transition-colors"
            >
              Open UPI App (GPay / PhonePe / Paytm)
            </a>

            <p className="text-xs text-gray-400 mb-4">After paying, tap "I've Paid" to confirm your order.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUPI(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitOrder}
                disabled={placing}
                className="flex-1 py-3 rounded-xl bg-[#FF6B00] text-white font-semibold text-sm disabled:opacity-60"
              >
                {placing ? 'Placing...' : "I've Paid ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── BACK BUTTON + TITLE ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-[#FF6B00] p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <button onClick={clearCart} className="ml-auto text-sm text-red-400 hover:text-red-600">Clear all</button>
        </div>

        {items[0]?.restaurantName && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-[#FF6B00]">🏪</span>
            <span className="text-sm font-medium text-gray-700">{items[0].restaurantName}</span>
          </div>
        )}

        {/* ── CART ITEMS ── */}
        <div className="card mb-4 divide-y divide-gray-50">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                <p className="text-[#FF6B00] font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.menuItem?._id || item.menuItem, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center font-bold"
                >−</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItem?._id || item.menuItem, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold"
                >+</button>
              </div>
              <span className="font-bold text-gray-900 w-16 text-right">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* ── CONTACT DETAILS ── */}
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Your Contact Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number *</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 text-sm">+91</span>
                <input
                  className="input flex-1"
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">We'll call/WhatsApp you for order updates</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delivery Instructions (optional)</label>
              <input
                className="input"
                placeholder="e.g. Ring the bell, Leave at door..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── DELIVERY ADDRESS ── */}
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Enter your full delivery address..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>

        {/* ── PAYMENT METHOD ── */}
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('COD')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'COD' ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-200'
              }`}
            >
              <span className="text-2xl">💵</span>
              <span className="text-sm font-semibold text-gray-800">Cash on Delivery</span>
              <span className="text-xs text-gray-500">Pay when delivered</span>
            </button>
            <button
              onClick={() => setPaymentMethod('UPI')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'UPI' ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-200'
              }`}
            >
              <span className="text-2xl">📲</span>
              <span className="text-sm font-semibold text-gray-800">UPI Payment</span>
              <span className="text-xs text-gray-500">GPay · PhonePe · Paytm</span>
            </button>
          </div>
        </div>

        {/* ── BILL SUMMARY ── */}
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Item total</span><span>₹{cartTotal}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
            <div className="flex justify-between text-gray-600"><span>Payment</span><span>{paymentMethod}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full btn-primary text-base py-4 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {placing
            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Placing...</>
            : paymentMethod === 'UPI'
              ? `Pay ₹${total} via UPI`
              : `Place Order • ₹${total}`
          }
        </button>
      </div>
    </div>
  );
};

export default Cart;
