import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';

/**
 * Home page — searches BOTH restaurant names AND food item names.
 * - Restaurant match: shows the restaurant card
 * - Item match: shows item results with a link to the restaurant
 */
const Home = () => {
  const [restaurants, setRestaurants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [itemResults, setItemResults]   = useState([]); // food item search results
  const [searchMode, setSearchMode]     = useState('restaurants'); // 'restaurants' | 'items'
  const [searching, setSearching]       = useState(false);

  useEffect(() => {
    API.get('/restaurants').then(res => {
      setRestaurants(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Debounced search — waits 350ms after typing stops
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchMode('restaurants');
      setItemResults([]);
      return;
    }

    setSearching(true);

    // Search food items via backend
    try {
      const res = await API.get(`/menu/search?q=${encodeURIComponent(q)}`);
      setItemResults(res.data.data || []);
    } catch { setItemResults([]); }

    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 350);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  // Restaurants that match the search query
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Determine what to show:
  // - No search → show all restaurants
  // - Search with item results → show item results + matching restaurants
  // - Search with no item results → show matching restaurants only
  const hasSearch   = search.trim().length > 0;
  const hasItems    = itemResults.length > 0;
  const hasRestaurants = filteredRestaurants.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C38] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Hungry? We've got you. 🍔
          </h1>
          <p className="text-orange-100 text-lg mb-8">Fast delivery from the best local restaurants</p>

          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              className="w-full px-5 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-orange-200 shadow-lg pl-12"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['All','🍕 Pizza','🍔 Burgers','🍜 Chinese','🍛 Indian','🌮 Mexican','🥗 Healthy','🍰 Desserts'].map(cat => (
            <button key={cat}
              className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-10">

        {/* ── FOOD ITEM SEARCH RESULTS ── */}
        {hasSearch && hasItems && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                🍽️ Dishes matching "{search}"
              </h2>
              <span className="text-sm text-gray-500">{itemResults.length} items</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itemResults.map(item => (
                <Link
                  key={item._id}
                  to={`/restaurant/${item.restaurantId?._id}`}
                  className="block"
                >
                  <div className="card p-4 flex gap-3 hover:border-[#FF6B00] hover:border-2 transition-all">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Highlight matching text */}
                      <h4 className="font-semibold text-gray-900">
                        <HighlightText text={item.name} query={search} />
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[#FF6B00] font-bold text-sm">₹{item.price}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          🏪 {item.restaurantId?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── RESTAURANT RESULTS ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasSearch ? `Restaurants matching "${search}"` : 'Restaurants Near You'}
            </h2>
            <span className="text-sm text-gray-500">{filteredRestaurants.length} places</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            !hasItems && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500">Try searching for a dish name or restaurant</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Highlights the matching part of a string in orange.
 * e.g. query="butter" in "Butter Chicken" → <span orange>Butter</span> Chicken
 */
const HighlightText = ({ text, query }) => {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-orange-100 text-[#FF6B00] rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
};

export default Home;
