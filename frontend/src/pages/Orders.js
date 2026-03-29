import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const statusColors = {
  'Placed': 'bg-blue-100 text-blue-700',
  'Confirmed': 'bg-purple-100 text-purple-700',
  'Preparing': 'bg-yellow-100 text-yellow-700',
  'Out for Delivery': 'bg-orange-100 text-orange-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

const statusSteps = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my').then(res => {
      setOrders(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full"></div></div>;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl mb-6">📦</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-8">Your orders will appear here</p>
        <Link to="/" className="btn-primary">Order Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
        <div className="space-y-4">
          {orders.map(order => {
            const stepIdx = statusSteps.indexOf(order.status);
            return (
              <div key={order._id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{order.restaurantName || 'Restaurant'}</h3>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="text-sm text-gray-600 mb-3">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.name} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>

                {/* Progress bar */}
                {order.status !== 'Cancelled' && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      {statusSteps.map((step, i) => (
                        <div key={step} className={`flex flex-col items-center flex-1 ${i > 0 ? 'ml-1' : ''}`}>
                          <div className={`w-3 h-3 rounded-full mb-1 transition-colors ${i <= stepIdx ? 'bg-[#FF6B00]' : 'bg-gray-200'}`}></div>
                          <span className={`text-xs text-center leading-tight hidden sm:block ${i <= stepIdx ? 'text-[#FF6B00] font-medium' : 'text-gray-400'}`}>
                            {step.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full mt-1 -mt-8 mx-1.5 sm:mx-0 sm:mt-0">
                      <div
                        className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
                        style={{ width: `${stepIdx >= 0 ? (stepIdx / (statusSteps.length - 1)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-500">Total: <span className="font-bold text-gray-900">₹{order.totalPrice + order.deliveryFee}</span></span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{order.paymentMethod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
