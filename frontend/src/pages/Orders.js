import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  'Placed':            'bg-blue-100 text-blue-700',
  'Confirmed':         'bg-purple-100 text-purple-700',
  'Preparing':         'bg-yellow-100 text-yellow-700',
  'Out for Delivery':  'bg-orange-100 text-orange-700',
  'Delivered':         'bg-green-100 text-green-700',
  'Cancelled':         'bg-red-100 text-red-700',
};

const PAYMENT_COLORS = {
  'Pending':                      'bg-gray-100 text-gray-600',
  'Payment Pending Verification': 'bg-yellow-100 text-yellow-700',
  'Paid':                         'bg-green-100 text-green-700',
  'Failed':                       'bg-red-100 text-red-700',
};

// Step icons for tracking bar
const STEP_ICONS = ['📋', '✅', '🍳', '🛵', '🎉'];

// NEW: estimated time per step
const STEP_ETA = {
  'Placed':           '~35 min',
  'Confirmed':        '~30 min',
  'Preparing':        '~20 min',
  'Out for Delivery': '~10 min',
  'Delivered':        'Delivered!',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: track previous statuses to detect changes for toast
  const prevStatusMap = useRef({});

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get('/orders/my');
      const newOrders = res.data.data || [];

      // NEW: compare statuses → show toast if changed
      newOrders.forEach(order => {
        const prev = prevStatusMap.current[order._id];
        if (prev && prev !== order.status) {
          // Get latest notification if available, else generate message
          const latestNotif = order.notifications?.[order.notifications.length - 1];
          const msg = latestNotif?.message || `Order status updated to: ${order.status}`;
          toast(msg, { icon: '🔔', duration: 4000 });
        }
        prevStatusMap.current[order._id] = order.status;
      });

      setOrders(newOrders);
    } catch {
      // silent — don't show error on background polls
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATED: poll every 12 seconds (was 15s, slightly tighter)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 12000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">📦</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
      <p className="text-gray-500 mb-8">Your orders will appear here</p>
      <Link to="/" className="btn-primary">Order Now</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="My Orders" />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {orders.map(order => {
          const stepIdx    = STATUS_STEPS.indexOf(order.status);
          // NEW: latest notification to show on card
          const latestNotif = order.notifications?.length > 0
            ? order.notifications[order.notifications.length - 1]
            : null;
          // UPDATED: use stored deliveryFee, fallback to 0
          const deliveryFee = order.deliveryFee ?? 0;
          const grandTotal  = order.totalPrice + deliveryFee;

          return (
            <div key={order._id} className="card p-5">

              {/* ── Header ── */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{order.restaurantName || 'Restaurant'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
              </div>

              {/* ── Items ── */}
              <p className="text-sm text-gray-600 mb-3">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name}{item.variant ? ` (${item.variant})` : ''} ×{item.quantity}
                    {i < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>

              {/* ── NEW: Latest Notification Banner ── */}
              {latestNotif && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <p className="text-xs text-orange-800 font-medium">{latestNotif.message}</p>
                </div>
              )}

              {/* ── UPDATED: Order Tracking with icons + ETA ── */}
              {order.status !== 'Cancelled' && (
                <div className="mb-4">
                  {/* NEW: Estimated delivery time */}
                  {order.status !== 'Delivered' && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-sm">⏱️</span>
                      <span className="text-xs text-gray-500">
                        Estimated: <span className="font-semibold text-gray-800">
                          {order.estimatedDelivery || STEP_ETA[order.status] || '20–40 min'}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="relative flex items-start mb-1">
                    {/* Grey track */}
                    <div className="absolute left-0 right-0 h-1 bg-gray-200 top-4 mx-5 z-0" />
                    {/* Orange fill */}
                    <div
                      className="absolute left-0 h-1 bg-[#FF6B00] top-4 mx-5 transition-all duration-700 z-0"
                      style={{ width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                        {/* Circle with emoji */}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all
                          ${i <= stepIdx
                            ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-300'}`}>
                          {STEP_ICONS[i]}
                        </div>
                        {/* Label */}
                        <span className={`text-xs mt-1.5 text-center leading-tight hidden sm:block
                          ${i <= stepIdx ? 'text-[#FF6B00] font-semibold' : 'text-gray-300'}`}>
                          {step.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── UPDATED: Bill with deliveryFee from order ── */}
              <div className="flex items-center justify-between pt-3 border-t gap-2 flex-wrap">
                <div className="text-sm text-gray-500 space-y-0.5">
                  <div>
                    Items: <span className="font-medium text-gray-700">₹{order.totalPrice}</span>
                    {' + '}
                    Delivery:{' '}
                    <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : 'font-medium text-gray-700'}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900">Total: ₹{grandTotal}</div>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{order.paymentMethod}</span>
                  {order.paymentMethod === 'UPI' && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${PAYMENT_COLORS[order.paymentStatus] || ''}`}>
                      {order.paymentStatus}
                    </span>
                  )}
                  {order.utrNumber && (
                    <span className="text-xs text-gray-400 font-mono">UTR: {order.utrNumber}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
