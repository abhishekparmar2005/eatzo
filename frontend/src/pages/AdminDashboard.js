import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const tabs = ['Restaurants', 'Menu Items', 'Orders'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [rForm, setRForm] = useState({ name: '', location: '', description: '', cuisine: '', deliveryTime: '30-45 min', minOrder: 100, image: '' });
  const [mForm, setMForm] = useState({ name: '', price: '', category: 'Main Course', description: '', restaurantId: '', image: '', isVeg: false });

  useEffect(() => { fetchRestaurants(); fetchOrders(); }, []);

  const fetchRestaurants = async () => {
    const res = await API.get('/restaurants');
    setRestaurants(res.data.data || []);
  };

  const fetchOrders = async () => {
    const res = await API.get('/orders/all');
    setOrders(res.data.data || []);
  };

  const fetchMenu = async (rid) => {
    setSelectedRestaurant(rid);
    const res = await API.get(`/menu/restaurant/${rid}`);
    setMenuItems(res.data.data || []);
  };

  const createRestaurant = async (e) => {
    e.preventDefault();
    try {
      await API.post('/restaurants', rForm);
      toast.success('Restaurant added!');
      fetchRestaurants();
      setRForm({ name: '', location: '', description: '', cuisine: '', deliveryTime: '30-45 min', minOrder: 100, image: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    await API.delete(`/restaurants/${id}`);
    toast.success('Deleted'); fetchRestaurants();
  };

  const createMenuItem = async (e) => {
    e.preventDefault();
    try {
      await API.post('/menu', { ...mForm, price: Number(mForm.price), restaurantId: mForm.restaurantId || selectedRestaurant });
      toast.success('Menu item added!');
      if (selectedRestaurant) fetchMenu(selectedRestaurant);
      setMForm({ name: '', price: '', category: 'Main Course', description: '', restaurantId: '', image: '', isVeg: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteMenuItem = async (id) => {
    await API.delete(`/menu/${id}`);
    toast.success('Deleted'); fetchMenu(selectedRestaurant);
  };

  const updateOrderStatus = async (orderId, status) => {
    await API.put(`/orders/${orderId}/status`, { status });
    toast.success('Status updated'); fetchOrders();
  };

  const InputField = ({ label, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input className="input text-sm" {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#FF6B00] text-white px-6 py-5">
        <h1 className="text-2xl font-bold">⚙️ Admin Dashboard</h1>
        <p className="text-orange-100 text-sm mt-1">Manage restaurants, menus, and orders</p>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Restaurants', value: restaurants.length, icon: '🏪' },
            { label: 'Total Orders', value: orders.length, icon: '📦' },
            { label: 'Revenue', value: `₹${orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalPrice, 0)}`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
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

        {/* Restaurants Tab */}
        {activeTab === 'Restaurants' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Add Restaurant</h2>
              <form onSubmit={createRestaurant} className="space-y-3">
                <InputField label="Name *" value={rForm.name} onChange={e => setRForm({...rForm, name: e.target.value})} required placeholder="Restaurant name"/>
                <InputField label="Location *" value={rForm.location} onChange={e => setRForm({...rForm, location: e.target.value})} required placeholder="Area, City"/>
                <InputField label="Cuisine" value={rForm.cuisine} onChange={e => setRForm({...rForm, cuisine: e.target.value})} placeholder="e.g. North Indian"/>
                <InputField label="Image URL" value={rForm.image} onChange={e => setRForm({...rForm, image: e.target.value})} placeholder="https://..."/>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Delivery Time" value={rForm.deliveryTime} onChange={e => setRForm({...rForm, deliveryTime: e.target.value})} placeholder="30-45 min"/>
                  <InputField label="Min Order (₹)" type="number" value={rForm.minOrder} onChange={e => setRForm({...rForm, minOrder: e.target.value})}/>
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
                  </div>
                  <button onClick={() => deleteRestaurant(r._id)} className="text-red-400 hover:text-red-600 text-sm font-medium">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'Menu Items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Add Menu Item</h2>
              <form onSubmit={createMenuItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Restaurant *</label>
                  <select className="input text-sm" value={mForm.restaurantId} onChange={e => { setMForm({...mForm, restaurantId: e.target.value}); fetchMenu(e.target.value); }} required>
                    <option value="">Select restaurant</option>
                    {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                <InputField label="Item Name *" value={mForm.name} onChange={e => setMForm({...mForm, name: e.target.value})} required placeholder="e.g. Butter Chicken"/>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Price (₹) *" type="number" value={mForm.price} onChange={e => setMForm({...mForm, price: e.target.value})} required/>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select className="input text-sm" value={mForm.category} onChange={e => setMForm({...mForm, category: e.target.value})}>
                      {['Starter', 'Main Course', 'Breads', 'Rice', 'Desserts', 'Beverages', 'Snacks'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <InputField label="Image URL" value={mForm.image} onChange={e => setMForm({...mForm, image: e.target.value})} placeholder="https://..."/>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={mForm.isVeg} onChange={e => setMForm({...mForm, isVeg: e.target.checked})} className="w-4 h-4 accent-green-500"/>
                  Vegetarian
                </label>
                <button type="submit" className="btn-primary w-full text-sm py-2.5">+ Add Item</button>
              </form>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-bold text-gray-900">Menu Items</h2>
                <select className="input text-sm flex-1" value={selectedRestaurant} onChange={e => fetchMenu(e.target.value)}>
                  <option value="">Filter by restaurant</option>
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                {menuItems.map(item => (
                  <div key={item._id} className="card p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price} • {item.category} • {item.isVeg ? '🟢 Veg' : '🔴 Non-veg'}</p>
                    </div>
                    <button onClick={() => deleteMenuItem(item._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                  </div>
                ))}
                {menuItems.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Select a restaurant to view menu</p>}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'Orders' && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">All Orders ({orders.length})</h2>
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order._id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{order.userId?.name || 'User'}</span>
                      <span className="text-gray-400 text-sm mx-2">•</span>
                      <span className="text-sm text-gray-600">{order.restaurantName}</span>
                    </div>
                    <span className="font-bold text-[#FF6B00]">₹{order.totalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order._id, e.target.value)}
                      className="input text-sm flex-1 py-2"
                    >
                      {['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
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
