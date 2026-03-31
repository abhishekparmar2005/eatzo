import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

/**
 * MenuCard — shows food item with:
 * - "+ Add" button initially
 * - [- qty +] controls once added to cart
 * - Half/Full variant selector (if item has variants)
 * - Syncs with global CartContext — no local qty state needed
 */
const MenuCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  const hasVariants = item.variants && item.variants.length > 0;
  const displayPrice = selectedVariant ? selectedVariant.price : item.price;

  // Find this item in the cart (match by menuItem ID + variant name)
  const cartItem = cart?.items?.find(i => {
    const idMatch =
      i.menuItem === item._id ||
      i.menuItem?._id === item._id ||
      i.menuItem?.toString() === item._id?.toString();
    const variantMatch = (i.variant || '') === (selectedVariant?.name || '');
    return idMatch && variantMatch;
  });

  const cartQty = cartItem?.quantity || 0;

  // ── Add to cart ──────────────────────────────────────────
  const handleAdd = async () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a size (Half / Full)');
      return;
    }
    setAdding(true);
    try {
      await addToCart(
        item._id,
        1,
        selectedVariant?.name || '',
        selectedVariant?.price || null,
      );
      toast.success(
        `${item.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added! 🛒`,
      );
      if (hasVariants) setSelectedVariant(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  // ── Increase qty ─────────────────────────────────────────
  const handleIncrease = async () => {
    try {
      await updateQuantity(item._id, cartQty + 1, selectedVariant?.name || cartItem?.variant || '');
    } catch { toast.error('Failed to update'); }
  };

  // ── Decrease qty (remove if qty hits 0) ──────────────────
  const handleDecrease = async () => {
    try {
      await updateQuantity(item._id, cartQty - 1, selectedVariant?.name || cartItem?.variant || '');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="card p-4 flex gap-4 items-start">

      {/* ── Food Image ── */}
      <div className="relative flex-shrink-0">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'}
          alt={item.name}
          className="w-24 h-24 rounded-xl object-cover bg-gray-100"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'; }}
        />
        {/* Veg / Non-veg indicator */}
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-sm border-2 flex items-center justify-center
          ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
        </span>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
        {item.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <p className="text-[#FF6B00] font-bold mt-1">₹{displayPrice}</p>

        {/* ── Variant selector (Half / Full) ── */}
        {hasVariants && (
          <div className="mt-2 space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Choose size:</p>
            <div className="flex flex-wrap gap-2">
              {item.variants.map(v => {
                const isSelected = selectedVariant?.name === v.name;
                return (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(isSelected ? null : v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                      ${isSelected
                        ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]'
                        : 'border-gray-200 text-gray-600 hover:border-[#FF6B00]'}`}
                  >
                    <span className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center
                      ${isSelected ? 'border-[#FF6B00]' : 'border-gray-300'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />}
                    </span>
                    {v.name} <span className={isSelected ? 'text-[#FF6B00]' : 'text-gray-400'}>₹{v.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Quantity Controls ── */}
        <div className="mt-3 flex items-center justify-end">
          {!item.isAvailable ? (
            <span className="text-xs text-gray-400 border border-gray-200 px-4 py-1.5 rounded-xl">
              Unavailable
            </span>
          ) : cartQty > 0 && !hasVariants ? (
            /* Show [- qty +] when item is in cart (non-variant items only — 
               variant items show Add each time since each variant is separate) */
            <div className="flex items-center gap-1 border-2 border-[#FF6B00] rounded-xl overflow-hidden">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center text-[#FF6B00] hover:bg-orange-50 font-bold text-lg transition-colors"
              >
                −
              </button>
              <span className="w-7 text-center font-bold text-gray-900 text-sm">
                {cartQty}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center bg-[#FF6B00] text-white hover:bg-[#E05A00] font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            /* Show "+ Add" button */
            <button
              onClick={handleAdd}
              disabled={adding || (hasVariants && !selectedVariant)}
              className={`px-5 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95
                ${hasVariants && !selectedVariant
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                  : 'border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white'}`}
            >
              {adding ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Adding…
                </span>
              ) : hasVariants && !selectedVariant ? 'Select size' : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
