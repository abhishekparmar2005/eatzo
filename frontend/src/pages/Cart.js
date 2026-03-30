import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

const YOUR_UPI_ID = 'thakurabhishek01@ptyes';
const YOUR_NAME   = 'Eatzo';

// NEW: delivery fee logic — free if item total ≥ ₹150, else ₹20
const calcDeliveryFee = (itemTotal) => (itemTotal >= 150 ? 0 : 20);

const Cart = () => {
  const { cart, cartTotal, updateQuantity, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [placing, setPlacing]             = useState(false);
  const [address, setAddress]             = useState('');
  const [phone, setPhone]                 = useState('');
  const [note, setNote]                   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [showUPI, setShowUPI]       = useState(false);
  const [upiOpened, setUpiOpened]   = useState(false);
  const [utrNumber, setUtrNumber]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pendingPayload = useRef(null);
  const upiOpenedAt    = useRef(null);

  const items       = cart?.items || [];
  const handlingFee = 0; // NEW: always 0, shown explicitly

  // UPDATED: dynamic delivery fee
  const deliveryFee = calcDeliveryFee(cartTotal);
  const total       = cartTotal + deliveryFee + handlingFee;

  const upiLink = `upi://pay?pa=${YOUR_UPI_ID}&pn=${encodeURIComponent(YOUR_NAME)}&am=${total}&cu=INR`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

  const validateForm = () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number'); return false;
    }
    if (!address.trim()) {
      toast.error('Enter delivery address'); return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (paymentMethod === 'COD') {
      setPlacing(true);
      try {
        await API.post('/orders', {
          deliveryAddress: address, paymentMethod: 'COD',
          customerPhone: phone, customerNote: note,
        });
        await fetchCart();
        toast.success('Order placed! 🎉');
        navigate('/orders');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to place order');
      } finally { setPlacing(false); }
      return;
    }

    pendingPayload.current = {
      deliveryAddress: address, paymentMethod: 'UPI',
      customerPhone: phone, customerNote: note,
    };
    setUpiOpened(false);
    setUtrNumber('');
    upiOpenedAt.current = null;
    setShowUPI(true);
  };

  const handleOpenUPI = () => {
    upiOpenedAt.current = new Date().toISOString();
    setUpiOpened(true);
    window.location.href = upiLink;
  };

  const handleIHavePaid = async () => {
    if (!window.confirm('Have you completed the UPI payment?')) return;
    setSubmitting(true);
    try {
      const orderRes = await API.post('/orders', { ...pendingPayload.current });
      const newOrderId = orderRes.data.data._id;

      const confirmRes = await API.post('/orders/confirm-upi', {
        orderId: newOrderId, utrNumber,
        upiPaidAt: upiOpenedAt.current, iHavePaidAt: new Date().toISOString(),
      });

      await fetchCart();

      if (confirmRes.data.warning) {
        toast('⚠️ Order flagged for review: ' + confirmRes.data.warning, { duration: 5000 });
      } else {
        toast.success('Payment submitted for verification! ✅');
      }
      setShowUPI(false);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error confirming payment');
    } finally { setSubmitting(false); }
  };

  const handleCancel = () => {
    setShowUPI(false); setUpiOpened(false); setUtrNumber('');
    upiOpenedAt.current = null; pendingPayload.current = null;
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

      {/* ── UPI Modal ── */}
      {showUPI && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-3xl mb-1">📲</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pay ₹{total} via UPI</h3>
            <p className="text-sm text-gray-400 mb-4">Scan QR or tap the button to open your UPI app</p>

            <div className="flex justify-center mb-3">
              <img src={qrUrl} alt="UPI QR" className="rounded-xl border border-gray-200 p-2" />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 mb-3">
              <p className="text-xs text-gray-500">UPI ID</p>
              <p className="text-base font-bold text-[#FF6B00]">{YOUR_UPI_ID}</p>
            </div>

            {!upiOpened ? (
              <button onClick={handleOpenUPI}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl mb-3 text-sm transition-colors">
                Open UPI App (GPay / PhonePe / Paytm)
              </button>
            ) : (
              <div className="mb-3">
                <p className="text-xs text-green-600 font-medium mb-3">
                  ✅ UPI app opened — complete payment there, then come back
                </p>
                <div className="text-left mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    UTR / Transaction ID <span className="text-gray-400">(optional but recommended)</span>
                  </label>
                  <input className="input text-sm" placeholder="e.g. 123456789012"
                    value={utrNumber} onChange={e => setUtrNumber(e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Find this in your UPI app after paying</p>
                </div>
                <button onClick={handleIHavePaid} disabled={submitting}
                  className="w-full bg-[#FF6B00] hover:bg-[#E05A00] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming…</>
                    : "I've Paid ✓"}
                </button>
              </div>
            )}

            <button onClick={handleCancel} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Cancel — I'll pay later
            </button>
          </div>
        </div>
      )}

      <PageHeader title="Your Cart"
        right={<button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors">Clear all</button>}
      />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {items[0]?.restaurantName && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-[#FF6B00]">🏪</span>
            <span className="text-sm font-medium text-gray-700">{items[0].restaurantName}</span>
          </div>
        )}

        {/* Cart Items */}
        <div className="card mb-4 divide-y divide-gray-50">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
                alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                {item.variant && (
                  <span className="inline-block text-xs bg-orange-50 text-[#FF6B00] border border-orange-100 px-2 py-0.5 rounded-full mt-0.5">
                    {item.variant}
                  </span>
                )}
                <p className="text-[#FF6B00] font-bold mt-0.5">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.menuItem?._id || item.menuItem, item.quantity - 1, item.variant)}
                  className="w-8 h-8 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center font-bold">−</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItem?._id || item.menuItem, item.quantity + 1, item.variant)}
                  className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold">+</button>
              </div>
              <span className="font-bold text-gray-900 w-16 text-right">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Contact Details */}
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Your Contact Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number *</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 text-sm">+91</span>
                <input className="input flex-1" type="tel" placeholder="10-digit mobile number"
                  maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delivery Instructions (optional)</label>
              <input className="input" placeholder="e.g. Ring the bell..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
          <textarea className="input resize-none" rows={3} placeholder="Enter your full delivery address..."
            value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        {/* Payment Method */}
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'COD', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when delivered' },
              { id: 'UPI', icon: '📲', label: 'UPI Payment',      sub: 'GPay · PhonePe · Paytm' },
            ].map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${paymentMethod === pm.id ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                <span className="text-2xl">{pm.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{pm.label}</span>
                <span className="text-xs text-gray-500">{pm.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* UPDATED: Bill Summary with dynamic delivery fee + handling fee */}
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item total</span><span>₹{cartTotal}</span>
            </div>
            {/* NEW: delivery fee with FREE badge when applicable */}
            <div className="flex justify-between text-gray-600 items-center">
              <span>Delivery fee</span>
              <span className="flex items-center gap-1.5">
                {deliveryFee === 0
                  ? <><span className="line-through text-gray-300">₹20</span>
                      <span className="text-green-600 font-semibold text-xs bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">FREE</span></>
                  : `₹${deliveryFee}`
                }
              </span>
            </div>
            {/* NEW: handling fee shown as 0 */}
            <div className="flex justify-between text-gray-600">
              <span>Handling fee</span>
              <span className="text-green-600 font-medium">₹0</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment</span><span>{paymentMethod}</span>
            </div>
            {/* NEW: free delivery nudge */}
            {deliveryFee > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs text-orange-700">
                💡 Add ₹{150 - cartTotal} more for <span className="font-semibold">FREE delivery</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
        </div>

        <button onClick={handlePlaceOrder} disabled={placing}
          className="w-full btn-primary text-base py-4 flex items-center justify-center gap-2 disabled:opacity-60">
          {placing
            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing…</>
            : paymentMethod === 'UPI' ? `Pay ₹${total} via UPI` : `Place Order • ₹${total}`
          }
        </button>
      </div>
    </div>
  );
};

export default Cart;
