import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MenuCard = ({ item }) => {
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const inCart = cart?.items?.find(i => i.menuItem === item._id || i.menuItem?._id === item._id);

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(item._id);
      toast.success(`${item.name} added to cart!`, { icon: '🛒' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  return (
    <div className="card flex gap-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
        </div>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
          <button
            onClick={handleAdd}
            disabled={!item.isAvailable}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 active:scale-95
              ${item.isAvailable
                ? inCart
                  ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                  : 'border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white'
                : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
          >
            {!item.isAvailable ? 'Unavailable' : inCart ? '+ Add More' : '+ Add'}
          </button>
        </div>
      </div>
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={item.image || `https://source.unsplash.com/100x100/?food,${item.name}`}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'; }}
        />
      </div>
    </div>
  );
};

export default MenuCard;
