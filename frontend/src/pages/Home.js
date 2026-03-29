import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/restaurants').then(res => {
      setRestaurants(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C38] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Hungry? We've got you. 🍔
          </h1>
          <p className="text-orange-100 text-lg mb-8">Fast delivery from the best local restaurants</p>
          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              className="w-full px-5 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-orange-200 shadow-lg pl-12"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['All', '🍕 Pizza', '🍔 Burgers', '🍜 Chinese', '🍛 Indian', '🌮 Mexican', '🥗 Healthy', '🍰 Desserts'].map(cat => (
            <button key={cat} className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : 'Restaurants Near You'}
          </h2>
          <span className="text-sm text-gray-500">{filtered.length} places</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
            <p className="text-gray-500">Try a different search or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
