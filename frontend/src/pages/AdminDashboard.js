import React, { useEffect, useState, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const tabs = ['Restaurants', 'Menu Items', 'Orders'];

// ✅ FIX: InputField defined OUTSIDE component to prevent focus loss on re-render
const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input className="input text-sm" {...props} />
  </div>
);

// Payment status badge colors
const PAY_COLORS = {
  'Pending':                      'bg-gray-100 text-gray-600',
  'Payment Pending Verification': 'bg-yellow-100 text-yellow-700',
  'Paid':                         'bg-green-100 text-green-700',
  'Failed':                       'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab]     = useState('Restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [menuItems, setMenuItems]     = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  // Order filters
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [showSuspicious, setShowSuspicious] = useState(false);

  // Forms
  const [rForm, setRForm] = useState({
    name: '', location: '', description: '', cuisine: '',
    deliveryTime: '30-45 min', minOrder: 100, image: '', fssaiLicense: ''
  });
  const [mForm, setMForm] = useState({
    name: '', price: '', category: 'Main Course',
    description: '', restaurantId: '', image: '', isVeg: false, variants: []
  });
  const [hasVariants, setHasVariants] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    const res = await API.get('/restaurants');
    setRestaurants(res.data.data || []);
  }, []);

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus)  params.append('status', filterStatus);
    if (filterPayment) params.append('paymentStatus', filterPayment);
    if (showSuspicious) params.append('suspicious', 'true');
    const res = await API.get(`/orders/all?${params.toString()}`);
    setOrders(res.data.data || []);
  }, [filterStatus, filterPayment, showSuspicious]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);
  useEffect(() => { if (activeTab === 'Orders') fetchOrders(); }, [activeTab, fetchOrders]);

  const fetchMenu = async (rid) => {
    setSelectedRestaurant(rid);
    const res = await API.get(`/menu/restaurant/${rid}`);
    setMenuItems(res.data.data || []);
  };

  const createRestaurant = async (e) => {
    e.preventDefault();
    if (rForm.fssaiLicense && !/^\d{14}$/.test(rForm.fssaiLicense)) {
      toast.error('FSSAI License must be exactly 14 digits'); return;
    }
    try {
      await API.post('/restaurants', rForm);
      toast.success('Restaurant added!');
      fetchRestaurants();
      setRForm({ name: '', location: '', description: '', cuisine: '', deliveryTime: '30-45 min', minOrder: 100, image: '', fssaiLicense: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    await API.delete(`/restaurants/${id}`);
    toast.success('Deleted'); fetchRestaurants();
  };

  const createMenuItem = async (e) => {
    e.preventDefault();
    const payload = {
      ...mForm,
      price: Number(mForm.price),
      restaurantId: mForm.restaurantId || selectedRestaurant,
      variants: hasVariants
        ? mForm.variants.filter(v => v.name && v.price).map(v => ({ name: v.name, price: Number(v.price) }))
        : [],
    };
    try {
      await API.post('/menu', payload);
      toast.success('Item added!');
      if (selectedRestaurant) fetchMenu(selectedRestaurant);
      setMForm({ name: '', price: '', category: 'Main Course', description: '', restaurantId: '', image: '', isVeg: false, variants: [] });
      setHasVariants(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteMenuItem = async (id) => {
    await API.delete(`/menu/${id}`);
    toast.success('Deleted'); fetchMenu(selectedRestaurant);
  };

  const updateOrderStatus = async (orderId, status) => {
    await API.put(`/orders/${orderId}/status`, { status });
    toast.success('Order status updated'); fetchOrders();
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    await API.put(`/orders/${orderId}/status`, { paymentStatus });
    toast.success('Payment status updated'); fetchOrders();
  };

  // Variant helpers
  const addVariantRow   = () => setMForm(f => ({ ...f, variants: [...f.variants, { name: '', price: '' }] }));
  const updateVariant   = (i, field, val) => setMForm(f => { const v = [...f.variants]; v[i] = {...v[i], [field]: val}; return {...f, variants: v}; });
  const removeVariant   = (i) => setMForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const suspiciousOrders = orders.filter(o => o.isSuspicious);
  const revenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#FF6B00] text-white px-6 py-5">
        <h1 className="text-2xl font-bold">⚙️ Admin Dashboard</h1>
        <p className="text-orange-100 text-sm mt-1">Manage restaurants, menus, and orders</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Restaurants', value: restaurants.length, icon: '🏪' },
            { label: 'Total Orders', value: orders.length, icon: '📦' },
            { label: 'Revenue', value: `₹${revenue}`, icon: '💰' },
            { label: '⚠️ Suspicious', value: suspiciousOrders.length, icon: '🚨', red: suspiciousOrders.length > 0 },
          ].map(stat => (
            <div key={stat.label} className={`card p-4 text-center ${stat.red ? 'border-2 border-red-300' : ''}`}>
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.red ? 'text-red-600' : 'text-gray-900'}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-[#FF6B00] shadow' : 'text-gray-600'}`}
            >{tab}</button>
          ))}
        </div>

        {/* ── RESTAURANTS ── */}
        {activeTab === 'Restaurants' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Add Restaurant</h2>
              <form onSubmit={createRestaurant} className="space-y-3">
                <InputField label="Name *" value={rForm.name} onChange={e => setRForm(f => ({...f, name: e.target.value}))} required placeholder="Restaurant name"/>
                <InputField label="Location *" value={rForm.location} onChange={e => setRForm(f => ({...f, location: e.target.value}))} required placeholder="Area, City"/>
                <InputField label="Cuisine" value={rForm.cuisine} onChange={e => setRForm(f => ({...f, cuisine: e.target.value}))} placeholder="e.g. North Indian"/>
                <InputField label="Image URL" value={rForm.image} onChange={e => setRForm(f => ({...f, image: e.target.value}))} placeholder="https://..."/>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Delivery Time" value={rForm.deliveryTime} onChange={e => setRForm(f => ({...f, deliveryTime: e.target.value}))} placeholder="30-45 min"/>
                  <InputField label="Min Order (₹)" type="number" value={rForm.minOrder} onChange={e => setRForm(f => ({...f, minOrder: e.target.value}))}/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">FSSAI License (14 digits, optional)</label>
                  <input className="input text-sm" placeholder="14-digit FSSAI number" maxLength={14}
                    value={rForm.fssaiLicense} onChange={e => setRForm(f => ({...f, fssaiLicense: e.target.value.replace(/\D/g, '')}))}/>
                  {rForm.fssaiLicense && rForm.fssaiLicense.length !== 14 && (
                    <p className="text-xs text-red-400 mt-1">{rForm.fssaiLicense.length}/14 digits</p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full text-sm py-2.5">+ Add Restaurant</button>
              </form>
            </div>
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900">All Restaurants ({restaurants.length})</h2>
              {restaurants.map(r => (
                <div key={r._id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.location} • {r.cuisine}</p>
                    {r.fssaiLicense && <p className="text-xs text-green-600 mt-0.5">✅ FSSAI: {r.fssaiLicense}</p>}
                  </div>
                  <button onClick={() => deleteRestaurant(r._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENU ITEMS ── */}
        {activeTab === 'Menu Items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Add Menu Item</h2>
              <form onSubmit={createMenuItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Restaurant *</label>
                  <select className="input text-sm" value={mForm.restaurantId || selectedRestaurant}
                    onChange={e => setMForm(f => ({...f, restaurantId: e.target.value}))} required>
                    <option value="">Select restaurant</option>
                    {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                <InputField label="Item Name *" value={mForm.name} onChange={e => setMForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. Butter Chicken"/>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Base Price (₹) *" type="number" value={mForm.price} onChange={e => setMForm(f => ({...f, price: e.target.value}))} required/>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select className="input text-sm" value={mForm.category} onChange={e => setMForm(f => ({...f, category: e.target.value}))}>
                      {['Starter','Main Course','Breads','Rice','Desserts','Drinks','Snacks'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <InputField label="Image URL" value={mForm.image} onChange={e => setMForm(f => ({...f, image: e.target.value}))} placeholder="https://..."/>

                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Half / Full Variants</label>
                    <button type="button" onClick={() => { setHasVariants(v => !v); setMForm(f => ({...f, variants: []})); }}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${hasVariants ? 'bg-orange-100 text-[#FF6B00]' : 'bg-gray-100 text-gray-500'}`}>
                      {hasVariants ? 'Remove' : '+ Add Variants'}
                    </button>
                  </div>
                  {hasVariants && (
                    <div className="space-y-2">
                      {mForm.variants.map((v, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input className="input text-sm flex-1" placeholder="Half / Full" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)}/>
                          <input className="input text-sm w-24" type="number" placeholder="₹" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)}/>
                          <button type="button" onClick={() => removeVariant(i)} className="text-red-400 text-xl">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={addVariantRow} className="text-xs text-[#FF6B00] font-medium">+ Add row</button>
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={mForm.isVeg} onChange={e => setMForm(f => ({...f, isVeg: e.target.checked}))} className="accent-green-500"/>
                  Vegetarian
                </label>
                <button type="submit" className="btn-primary w-full text-sm py-2.5">+ Add Item</button>
              </form>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-bold text-gray-900">Menu Items</h2>
                <select className="input text-sm flex-1" onChange={e => fetchMenu(e.target.value)} defaultValue="">
                  <option value="">Filter by restaurant</option>
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                {menuItems.map(m => (
                  <div key={m._id} className="card p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">₹{m.price} • {m.category} • {m.isVeg ? '🟢' : '🔴'}</p>
                      {m.variants?.length > 0 && <p className="text-xs text-blue-500">{m.variants.map(v => `${v.name}: ₹${v.price}`).join(' | ')}</p>}
                    </div>
                    <button onClick={() => deleteMenuItem(m._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'Orders' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <select className="input text-sm py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {['Placed','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="input text-sm py-2" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                <option value="">All Payments</option>
                {['Pending','Payment Pending Verification','Paid','Failed'].map(s => <option key={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={showSuspicious} onChange={e => setShowSuspicious(e.target.checked)} className="accent-red-500"/>
                <span className="text-red-600 font-medium">⚠️ Suspicious only</span>
              </label>
              <button onClick={fetchOrders} className="btn-primary text-sm py-2 px-4">Apply</button>
            </div>

            <h2 className="font-bold text-gray-900 mb-4">Orders ({orders.length})</h2>

            <div className="space-y-3">
              {orders.map(order => (
                <div key={order._id} className={`card p-4 ${order.isSuspicious ? 'border-2 border-red-300' : ''}`}>

                  {/* Suspicious warning banner */}
                  {order.isSuspicious && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-xs text-red-700 font-medium">
                      ⚠️ Suspicious: {order.suspiciousReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{order.userId?.name || 'User'}</span>
                      <span className="text-gray-400 text-sm mx-2">•</span>
                      <span className="text-sm text-gray-600">{order.restaurantName}</span>
                    </div>
                    <span className="font-bold text-[#FF6B00]">₹{order.totalPrice + 30}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {order.items.map(i => `${i.name}${i.variant ? ` (${i.variant})` : ''} ×${i.quantity}`).join(', ')}
                  </p>

                  {/* Contact + payment info */}
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-xs space-y-1">
                    {order.customerPhone && (
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <a href={`tel:+91${order.customerPhone}`} className="text-blue-600 font-semibold">+91 {order.customerPhone}</a>
                        <a href={`https://wa.me/91${order.customerPhone}`} target="_blank" rel="noreferrer"
                          className="bg-green-500 text-white px-2 py-0.5 rounded-full">WhatsApp</a>
                      </div>
                    )}
                    {order.userId?.email && <div className="flex gap-2 text-gray-500"><span>✉️</span><span>{order.userId.email}</span></div>}
                    {order.deliveryAddress && <div className="flex gap-2 text-gray-500"><span>📍</span><span>{order.deliveryAddress}</span></div>}
                    {order.customerNote && <div className="flex gap-2 text-gray-500"><span>📝</span><span>{order.customerNote}</span></div>}
                    <div className="flex gap-2 items-center flex-wrap">
                      <span>💳</span><span>{order.paymentMethod}</span>
                      <span className={`px-2 py-0.5 rounded-full text-white text-xs ${PAY_COLORS[order.paymentStatus] || 'bg-gray-300'}`}>
                        {order.paymentStatus}
                      </span>
                      {order.utrNumber && <span className="text-gray-500 font-mono">UTR: {order.utrNumber}</span>}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)}
                      className="input text-sm flex-1 py-2 min-w-0">
                      {['Placed','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>

                    {order.paymentMethod === 'UPI' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePaymentStatus(order._id, 'Paid')}
                          className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 font-medium"
                        >✅ Approve</button>
                        <button
                          onClick={() => updatePaymentStatus(order._id, 'Failed')}
                          className="text-xs bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-medium"
                        >❌ Reject</button>
                      </div>
                    )}

                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
