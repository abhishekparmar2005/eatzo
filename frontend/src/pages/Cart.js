import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, cartTotal, updateQuantity, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState('');

  const items = cart?.items || [];
  const deliveryFee = 30;
  const total = cartTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    setPlacing(true);
    try {
      await API.post('/orders', { deliveryAddress: address, paymentMethod: 'COD' });
      await fetchCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-gray-500 hover:text-[#FF6B00]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <button onClick={clearCart} className="ml-auto text-sm text-red-400 hover:text-red-600">Clear all</button>
        </div>

        {/* Restaurant name */}
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
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                <p className="text-[#FF6B00] font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.menuItem?._id || item.menuItem, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center font-bold hover:bg-orange-50"
                >−</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItem?._id || item.menuItem, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold hover:bg-[#E05A00]"
                >+</button>
              </div>
              <span className="font-bold text-gray-900 w-16 text-right">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
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

        {/* Bill Summary */}
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Item total</span><span>₹{cartTotal}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{total}</span></div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full btn-primary text-base py-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {placing ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Placing Order...</> : `Place Order • ₹${total}`}
        </button>
      </div>
    </div>
  );
};

export default Cart;
