import React, { useEffect, useState, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const tabs = ['Restaurants', 'Menu Items', 'Orders'];

// ✅ InputField OUTSIDE component — prevents focus loss bug on re-render
const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input className="input text-sm" {...props} />
  </div>
);

const PAY_COLORS = {
  'Pending':                      'bg-gray-100 text-gray-600',
  'Payment Pending Verification': 'bg-yellow-100 text-yellow-700',
  'Paid':                         'bg-green-100 text-green-700',
  'Failed':                       'bg-red-100 text-red-700',
};

// ── Edit Restaurant Modal ─────────────────────────────────────────────────────
const EditRestaurantModal = ({ restaurant, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:        restaurant.name        || '',
    description: restaurant.description || '',
    image:       restaurant.image       || '',
    cuisine:     restaurant.cuisine     || '',
    openTime:    restaurant.openTime    || '09:00',
    closeTime:   restaurant.closeTime   || '23:00',
    deliveryTime:restaurant.deliveryTime|| '30-45 min',
    minOrder:    restaurant.minOrder    || 100,
    fssaiLicense:restaurant.fssaiLicense|| '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.fssaiLicense && !/^\d{14}$/.test(form.fssaiLicense)) {
      toast.error('FSSAI must be 14 digits'); return;
    }
    setSaving(true);
    try {
      const res = await API.put(`/restaurants/${restaurant._id}`, form);
      toast.success('Restaurant updated!');
      onSave(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Restaurant</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <InputField label="Name *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required/>
          <InputField label="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}/>
          <InputField label="Image URL" value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} placeholder="https://..."/>
          <InputField label="Cuisine" value={form.cuisine} onChange={e => setForm(f => ({...f, cuisine: e.target.value}))}/>
          {/* Timing */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Opens at" type="time" value={form.openTime} onChange={e => setForm(f => ({...f, openTime: e.target.value}))}/>
            <InputField label="Closes at" type="time" value={form.closeTime} onChange={e => setForm(f => ({...f, closeTime: e.target.value}))}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Delivery Time" value={form.deliveryTime} onChange={e => setForm(f => ({...f, deliveryTime: e.target.value}))}/>
            <InputField label="Min Order (₹)" type="number" value={form.minOrder} onChange={e => setForm(f => ({...f, minOrder: e.target.value}))}/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">FSSAI License (14 digits)</label>
            <input className="input text-sm" maxLength={14} placeholder="Optional"
              value={form.fssaiLicense} onChange={e => setForm(f => ({...f, fssaiLicense: e.target.value.replace(/\D/g,'')}))}/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Edit Menu Item Modal ──────────────────────────────────────────────────────
const EditMenuItemModal = ({ item, restaurants, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:        item.name        || '',
    price:       item.price       || '',
    description: item.description || '',
    image:       item.image       || '',
    category:    item.category    || 'Main Course',
    isVeg:       item.isVeg       || false,
    variants:    item.variants    || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put(`/menu/${item._id}`, {
        ...form,
        price: Number(form.price),
        variants: form.variants.filter(v => v.name && v.price).map(v => ({ name: v.name, price: Number(v.price) })),
      });
      toast.success('Item updated!');
      onSave(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const addVariant = () => setForm(f => ({...f, variants: [...f.variants, {name:'', price:''}]}));
  const updateVariant = (i, k, v) => setForm(f => { const vs=[...f.variants]; vs[i]={...vs[i],[k]:v}; return {...f,variants:vs}; });
  const removeVariant = (i) => setForm(f => ({...f, variants: f.variants.filter((_,idx)=>idx!==i)}));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Menu Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <InputField label="Name *" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required/>
          <InputField label="Base Price (₹) *" type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} required/>
          <InputField label="Description" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}/>
          <InputField label="Image URL" value={form.image} onChange={e => setForm(f=>({...f,image:e.target.value}))} placeholder="https://..."/>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select className="input text-sm" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
              {['Starter','Main Course','Breads','Rice','Desserts','Drinks','Snacks'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Variants</label>
              <button type="button" onClick={addVariant} className="text-xs text-[#FF6B00] font-medium">+ Add variant</button>
            </div>
            {form.variants.map((v,i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input className="input text-sm flex-1" placeholder="Half/Full" value={v.name} onChange={e=>updateVariant(i,'name',e.target.value)}/>
                <input className="input text-sm w-24" type="number" placeholder="₹" value={v.price} onChange={e=>updateVariant(i,'price',e.target.value)}/>
                <button type="button" onClick={()=>removeVariant(i)} className="text-red-400 text-xl">×</button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-green-500" checked={form.isVeg} onChange={e=>setForm(f=>({...f,isVeg:e.target.checked}))}/>
            Vegetarian
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main AdminDashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab]       = useState('Restaurants');
  const [restaurants, setRestaurants]   = useState([]);
  const [orders, setOrders]             = useState([]);
  const [menuItems, setMenuItems]       = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  // Edit state
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingMenuItem, setEditingMenuItem]     = useState(null);

  // Filters
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPayment, setFilterPayment]   = useState('');
  const [showSuspicious, setShowSuspicious] = useState(false);

  // Forms
  const [rForm, setRForm] = useState({
    name:'', location:'', description:'', cuisine:'',
    deliveryTime:'30-45 min', minOrder:100, image:'',
    fssaiLicense:'', openTime:'09:00', closeTime:'23:00'
  });
  const [mForm, setMForm] = useState({
    name:'', price:'', category:'Main Course',
    description:'', restaurantId:'', image:'', isVeg:false, variants:[]
  });
  const [hasVariants, setHasVariants] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    const res = await API.get('/restaurants');
    setRestaurants(res.data.data || []);
  }, []);

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus)   params.append('status', filterStatus);
    if (filterPayment)  params.append('paymentStatus', filterPayment);
    if (showSuspicious) params.append('suspicious', 'true');
    const res = await API.get(`/orders/all?${params.toString()}`);
    setOrders(res.data.data || []);
  }, [filterStatus, filterPayment, showSuspicious]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);
  useEffect(() => { if (activeTab === 'Orders') fetchOrders(); }, [activeTab, fetchOrders]);

  const fetchMenu = async (rid) => {
    setSelectedRestaurant(rid);
    if (!rid) { setMenuItems([]); return; }
    const res = await API.get(`/menu/restaurant/${rid}`);
    setMenuItems(res.data.data || []);
  };

  const createRestaurant = async (e) => {
    e.preventDefault();
    if (rForm.fssaiLicense && !/^\d{14}$/.test(rForm.fssaiLicense)) {
      toast.error('FSSAI must be 14 digits'); return;
    }
    try {
      await API.post('/restaurants', rForm);
      toast.success('Restaurant added!');
      fetchRestaurants();
      setRForm({name:'',location:'',description:'',cuisine:'',deliveryTime:'30-45 min',minOrder:100,image:'',fssaiLicense:'',openTime:'09:00',closeTime:'23:00'});
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
      setMForm({name:'',price:'',category:'Main Course',description:'',restaurantId:'',image:'',isVeg:false,variants:[]});
      setHasVariants(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await API.delete(`/menu/${id}`);
    toast.success('Deleted'); fetchMenu(selectedRestaurant);
  };

  const updateOrderStatus  = async (id, status)        => { await API.put(`/orders/${id}/status`, { status });        fetchOrders(); toast.success('Updated'); };
  const updatePaymentStatus= async (id, paymentStatus) => { await API.put(`/orders/${id}/status`, { paymentStatus }); fetchOrders(); toast.success('Payment updated'); };

  const addVariantRow   = () => setMForm(f => ({...f, variants:[...f.variants,{name:'',price:''}]}));
  const updateVariant   = (i,k,v) => setMForm(f => { const vs=[...f.variants]; vs[i]={...vs[i],[k]:v}; return {...f,variants:vs}; });
  const removeVariant   = (i) => setMForm(f => ({...f, variants:f.variants.filter((_,idx)=>idx!==i)}));

  const revenue = orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.totalPrice,0);
  const suspicious = orders.filter(o=>o.isSuspicious);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Edit modals */}
      {editingRestaurant && (
        <EditRestaurantModal
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSave={(updated) => setRestaurants(rs => rs.map(r => r._id === updated._id ? updated : r))}
        />
      )}
      {editingMenuItem && (
        <EditMenuItemModal
          item={editingMenuItem}
          restaurants={restaurants}
          onClose={() => setEditingMenuItem(null)}
          onSave={(updated) => setMenuItems(ms => ms.map(m => m._id === updated._id ? updated : m))}
        />
      )}

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
            { label: '⚠️ Suspicious', value: suspicious.length, icon: '🚨', red: suspicious.length > 0 },
          ].map(s => (
            <div key={s.label} className={`card p-4 text-center ${s.red ? 'border-2 border-red-300' : ''}`}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.red ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab===tab?'bg-white text-[#FF6B00] shadow':'text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── RESTAURANTS TAB ── */}
        {activeTab === 'Restaurants' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Add Restaurant</h2>
              <form onSubmit={createRestaurant} className="space-y-3">
                <InputField label="Name *" value={rForm.name} onChange={e=>setRForm(f=>({...f,name:e.target.value}))} required placeholder="Restaurant name"/>
                <InputField label="Location *" value={rForm.location} onChange={e=>setRForm(f=>({...f,location:e.target.value}))} required placeholder="Area, City"/>
                <InputField label="Cuisine" value={rForm.cuisine} onChange={e=>setRForm(f=>({...f,cuisine:e.target.value}))} placeholder="e.g. North Indian"/>
                <InputField label="Image URL" value={rForm.image} onChange={e=>setRForm(f=>({...f,image:e.target.value}))} placeholder="https://..."/>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Delivery Time" value={rForm.deliveryTime} onChange={e=>setRForm(f=>({...f,deliveryTime:e.target.value}))}/>
                  <InputField label="Min Order (₹)" type="number" value={rForm.minOrder} onChange={e=>setRForm(f=>({...f,minOrder:e.target.value}))}/>
                </div>
                {/* Timing */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Opens at" type="time" value={rForm.openTime} onChange={e=>setRForm(f=>({...f,openTime:e.target.value}))}/>
                  <InputField label="Closes at" type="time" value={rForm.closeTime} onChange={e=>setRForm(f=>({...f,closeTime:e.target.value}))}/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">FSSAI License (14 digits, optional)</label>
                  <input className="input text-sm" placeholder="14-digit number" maxLength={14}
                    value={rForm.fssaiLicense} onChange={e=>setRForm(f=>({...f,fssaiLicense:e.target.value.replace(/\D/g,'')}))}/>
                  {rForm.fssaiLicense && rForm.fssaiLicense.length!==14 && (
                    <p className="text-xs text-red-400 mt-1">{rForm.fssaiLicense.length}/14</p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full text-sm py-2.5">+ Add Restaurant</button>
              </form>
            </div>

            <div className="space-y-3">
              <h2 className="font-bold text-gray-900">All Restaurants ({restaurants.length})</h2>
              {restaurants.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-sm text-gray-500">{r.location} • {r.cuisine}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        🕐 {r.openTime || '09:00'} – {r.closeTime || '23:00'}
                        <span className={`ml-2 font-medium ${r.isCurrentlyOpen ? 'text-green-600' : 'text-red-500'}`}>
                          {r.isCurrentlyOpen ? '● Open' : '● Closed'}
                        </span>
                      </p>
                      {r.fssaiLicense && <p className="text-xs text-green-600 mt-0.5">✅ FSSAI: {r.fssaiLicense}</p>}
                    </div>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={() => setEditingRestaurant(r)}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteRestaurant(r._id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENU ITEMS TAB ── */}
        {activeTab === 'Menu Items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Add Menu Item</h2>
              <form onSubmit={createMenuItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Restaurant *</label>
                  <select className="input text-sm" value={mForm.restaurantId||selectedRestaurant} onChange={e=>setMForm(f=>({...f,restaurantId:e.target.value}))} required>
                    <option value="">Select restaurant</option>
                    {restaurants.map(r=><option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                <InputField label="Item Name *" value={mForm.name} onChange={e=>setMForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Butter Chicken"/>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Base Price (₹) *" type="number" value={mForm.price} onChange={e=>setMForm(f=>({...f,price:e.target.value}))} required/>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select className="input text-sm" value={mForm.category} onChange={e=>setMForm(f=>({...f,category:e.target.value}))}>
                      {['Starter','Main Course','Breads','Rice','Desserts','Drinks','Snacks'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <InputField label="Image URL" value={mForm.image} onChange={e=>setMForm(f=>({...f,image:e.target.value}))} placeholder="https://..."/>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Half/Full Variants</label>
                    <button type="button" onClick={()=>{setHasVariants(v=>!v);setMForm(f=>({...f,variants:[]}));}}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${hasVariants?'bg-orange-100 text-[#FF6B00]':'bg-gray-100 text-gray-500'}`}>
                      {hasVariants ? 'Remove' : '+ Add Variants'}
                    </button>
                  </div>
                  {hasVariants && (
                    <div className="space-y-2">
                      {mForm.variants.map((v,i)=>(
                        <div key={i} className="flex gap-2 items-center">
                          <input className="input text-sm flex-1" placeholder="Half/Full" value={v.name} onChange={e=>updateVariant(i,'name',e.target.value)}/>
                          <input className="input text-sm w-24" type="number" placeholder="₹" value={v.price} onChange={e=>updateVariant(i,'price',e.target.value)}/>
                          <button type="button" onClick={()=>removeVariant(i)} className="text-red-400 text-xl">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={addVariantRow} className="text-xs text-[#FF6B00]">+ Add row</button>
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-green-500" checked={mForm.isVeg} onChange={e=>setMForm(f=>({...f,isVeg:e.target.checked}))}/>
                  Vegetarian
                </label>
                <button type="submit" className="btn-primary w-full text-sm py-2.5">+ Add Item</button>
              </form>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-bold text-gray-900">Menu Items</h2>
                <select className="input text-sm flex-1" onChange={e=>fetchMenu(e.target.value)} defaultValue="">
                  <option value="">Filter by restaurant</option>
                  {restaurants.map(r=><option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                {menuItems.map(m => (
                  <div key={m._id} className="card p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      <p className="text-xs text-gray-500">₹{m.price} • {m.category} • {m.isVeg?'🟢':'🔴'}</p>
                      {m.variants?.length>0 && (
                        <p className="text-xs text-blue-500">{m.variants.map(v=>`${v.name}: ₹${v.price}`).join(' | ')}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button onClick={()=>setEditingMenuItem(m)}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-medium">
                        ✏️ Edit
                      </button>
                      <button onClick={()=>deleteMenuItem(m._id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'Orders' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <select className="input text-sm py-2" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {['Placed','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
              <select className="input text-sm py-2" value={filterPayment} onChange={e=>setFilterPayment(e.target.value)}>
                <option value="">All Payments</option>
                {['Pending','Payment Pending Verification','Paid','Failed'].map(s=><option key={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-red-500" checked={showSuspicious} onChange={e=>setShowSuspicious(e.target.checked)}/>
                <span className="text-red-600 font-medium">⚠️ Suspicious only</span>
              </label>
              <button onClick={fetchOrders} className="btn-primary text-sm py-2 px-4">Apply</button>
            </div>

            <h2 className="font-bold text-gray-900 mb-4">Orders ({orders.length})</h2>
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order._id} className={`card p-4 ${order.isSuspicious?'border-2 border-red-300':''}`}>
                  {order.isSuspicious && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-xs text-red-700 font-medium">
                      ⚠️ Suspicious: {order.suspiciousReason}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold">{order.userId?.name||'User'}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-600">{order.restaurantName}</span>
                    </div>
                    <span className="font-bold text-[#FF6B00]">₹{order.totalPrice+30}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {order.items.map(i=>`${i.name}${i.variant?` (${i.variant})`:''} ×${i.quantity}`).join(', ')}
                  </p>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-xs space-y-1">
                    {order.customerPhone && (
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <a href={`tel:+91${order.customerPhone}`} className="text-blue-600 font-semibold">+91 {order.customerPhone}</a>
                        <a href={`https://wa.me/91${order.customerPhone}`} target="_blank" rel="noreferrer"
                          className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">WhatsApp</a>
                      </div>
                    )}
                    {order.userId?.email && <div className="flex gap-2 text-gray-500"><span>✉️</span><span>{order.userId.email}</span></div>}
                    {order.deliveryAddress && <div className="flex gap-2 text-gray-500"><span>📍</span><span>{order.deliveryAddress}</span></div>}
                    {order.customerNote && <div className="flex gap-2 text-gray-500"><span>📝</span><span>{order.customerNote}</span></div>}
                    <div className="flex gap-2 items-center flex-wrap">
                      <span>💳</span><span>{order.paymentMethod}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAY_COLORS[order.paymentStatus]||'bg-gray-100'}`}>
                        {order.paymentStatus}
                      </span>
                      {order.utrNumber && <span className="text-gray-500 font-mono">UTR: {order.utrNumber}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={order.status} onChange={e=>updateOrderStatus(order._id,e.target.value)}
                      className="input text-sm flex-1 py-2 min-w-0">
                      {['Placed','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
                    </select>
                    {order.paymentMethod==='UPI' && (
                      <div className="flex gap-2">
                        <button onClick={()=>updatePaymentStatus(order._id,'Paid')}
                          className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 font-medium">✅ Approve</button>
                        <button onClick={()=>updatePaymentStatus(order._id,'Failed')}
                          className="text-xs bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-medium">❌ Reject</button>
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
