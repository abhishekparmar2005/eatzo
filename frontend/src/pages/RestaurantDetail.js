import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import API from '../utils/api';
import MenuCard from '../components/MenuCard';
import { useCart } from '../context/CartContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { cartCount, cartTotal } = useCart();

  useEffect(() => {
    Promise.all([
      API.get(`/restaurants/${id}`),
      API.get(`/menu/restaurant/${id}`)
    ]).then(([rRes, mRes]) => {
      setRestaurant(rRes.data.data);
      setMenuItems(mRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];
  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full"></div></div>;
  if (!restaurant) return <div className="min-h-screen flex items-center justify-center text-gray-500">Restaurant not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header Image */}
      <div className="h-64 bg-gray-200 relative overflow-hidden">
        <img
          src={restaurant.image || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Link to="/" className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl hover:bg-white transition-colors">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-white/80">{restaurant.cuisine} • {restaurant.location}</p>
        </div>
        <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-xl flex items-center gap-1">
          <span className="text-yellow-400 font-bold">★</span>
          <span className="font-bold text-gray-800">{restaurant.rating?.toFixed(1)}</span>
        </div>
      </div>

      {/* Info Strip */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {restaurant.deliveryTime}
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Min order: ₹{restaurant.minOrder}
          </div>
          <div className={`ml-auto font-semibold ${restaurant.isOpen ? 'text-green-600' : 'text-red-500'}`}>
            {restaurant.isOpen ? '● Open' : '● Closed'}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${activeCategory === cat ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No items in this category</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(item => <MenuCard key={item._id} item={item} />)}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Link to="/cart" className="flex items-center justify-between bg-[#FF6B00] text-white px-5 py-4 rounded-2xl shadow-2xl hover:bg-[#E05A00] transition-colors">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">{cartCount}</div>
              <span className="font-semibold">View Cart</span>
            </div>
            <span className="font-bold">₹{cartTotal}</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
