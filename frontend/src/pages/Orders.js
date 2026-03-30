import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get('/orders/my');
      setOrders(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Poll every 15 seconds for live status updates (simple alternative to WebSocket)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full"></div>
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
          const stepIdx = STATUS_STEPS.indexOf(order.status);
          return (
            <div key={order._id} className="card p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{order.restaurantName || 'Restaurant'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <p className="text-sm text-gray-600 mb-3">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name}{item.variant ? ` (${item.variant})` : ''} ×{item.quantity}
                    {i < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>

              {/* Progress bar — hidden if Cancelled */}
              {order.status !== 'Cancelled' && (
                <div className="mb-4">
                  <div className="relative flex items-center mb-2">
                    {/* connecting line */}
                    <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1.5 mx-3"></div>
                    <div
                      className="absolute left-0 h-1 bg-[#FF6B00] top-1.5 mx-3 transition-all duration-500"
                      style={{ width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                    ></div>
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                        <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          i <= stepIdx
                            ? 'bg-[#FF6B00] border-[#FF6B00]'
                            : 'bg-white border-gray-300'
                        }`}></div>
                        <span className={`text-xs mt-1 text-center leading-tight hidden sm:block ${
                          i <= stepIdx ? 'text-[#FF6B00] font-medium' : 'text-gray-400'
                        }`}>{step.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment info */}
              <div className="flex items-center justify-between pt-3 border-t gap-2 flex-wrap">
                <span className="text-sm text-gray-500">
                  Total: <span className="font-bold text-gray-900">₹{order.totalPrice + (order.deliveryFee || 30)}</span>
                </span>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{order.paymentMethod}</span>
                  {order.paymentMethod === 'UPI' && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${PAYMENT_COLORS[order.paymentStatus] || ''}`}>
                      {order.paymentStatus}
                    </span>
                  )}
                  {order.utrNumber && (
                    <span className="text-xs text-gray-400">UTR: {order.utrNumber}</span>
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
