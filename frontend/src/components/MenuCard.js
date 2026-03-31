import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

/**
 * MenuCard
 *
 * ROOT CAUSE OF VARIANT BUG (now fixed):
 * ─────────────────────────────────────────────────────────────────────────────
 * Bug 1: After adding a variant item, selectedVariant was reset to null.
 *        This meant the cartItem lookup (which uses selectedVariant?.name)
 *        immediately stopped finding the cart entry → cartQty = 0 → "+ Add" shown.
 *
 * Bug 2: The +/− block had condition:  cartQty > 0 && !hasVariants
 *        This EXPLICITLY hid +/− for ALL variant items regardless of cart state.
 *
 * Fix:
 *  - Do NOT reset selectedVariant after adding.
 *  - Show +/− when: (cartQty > 0) && (either no variants, OR a variant is selected)
 *  - Show small qty badge on each variant button so user sees count at a glance.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Cart uniqueness: itemId + variant name (backend already handles this correctly)
 * Example cart rows for same item:
 *   { menuItem: "abc", variant: "Half", price: 70,  quantity: 2 }
 *   { menuItem: "abc", variant: "Full", price: 130, quantity: 1 }
 */
const MenuCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  // selectedVariant: the variant the user has currently clicked/selected
  // We do NOT reset this after add, so the +/− stays visible for that variant.
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  const hasVariants = item.variants && item.variants.length > 0;

  // Price shown in header — updates as user selects variant
  const displayPrice = selectedVariant ? selectedVariant.price : item.price;

  // ── Helper: find a specific variant's cart row ─────────────────────────────
  // variantName = '' for no-variant items, 'Half'/'Full' for variant items
  const getCartItem = (variantName = '') =>
    cart?.items?.find(i => {
      const idMatch =
        i.menuItem === item._id ||
        i.menuItem?._id === item._id ||
        i.menuItem?.toString() === item._id?.toString();
      return idMatch && (i.variant || '') === variantName;
    });

  // Cart row for the CURRENTLY SELECTED variant (or base item if no variants)
  const activeCartItem = getCartItem(selectedVariant?.name || '');
  const cartQty        = activeCartItem?.quantity || 0;

  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a size first');
      return;
    }
    setAdding(true);
    try {
      await addToCart(
        item._id,
        1,
        selectedVariant?.name  || '',
        selectedVariant?.price || null,
      );
      // ✅ FIX: Do NOT reset selectedVariant here.
      //    Keeping it selected lets cartQty reflect the added item immediately,
      //    so the card switches to [− qty +] without the user needing to re-select.
      toast.success(
        `${item.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added! 🛒`,
        { duration: 1500 },
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  // ── Increase qty for currently selected variant ────────────────────────────
  const handleIncrease = async () => {
    try {
      await updateQuantity(
        item._id,
        cartQty + 1,
        selectedVariant?.name || '',
      );
    } catch { toast.error('Failed to update'); }
  };

  // ── Decrease qty — removes row when qty hits 0 ─────────────────────────────
  const handleDecrease = async () => {
    try {
      await updateQuantity(
        item._id,
        cartQty - 1,
        selectedVariant?.name || '',
      );
      // If quantity would hit 0, optionally clear selectedVariant so card resets
      // to "+ Add". Uncomment below if you want that behaviour:
      // if (cartQty - 1 <= 0) setSelectedVariant(null);
    } catch { toast.error('Failed to update'); }
  };

  // ── Decide what the action area shows ─────────────────────────────────────
  // Show +/− if:
  //   - Item is available
  //   - Something is in the cart for the current selection
  //   - For variant items: a variant must be selected (so we know which row)
  const showQtyControls =
    item.isAvailable &&
    cartQty > 0 &&
    (!hasVariants || selectedVariant !== null);

  return (
    <div className="card p-4 flex gap-4 items-start">

      {/* ── Food image ── */}
      <div className="relative flex-shrink-0">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'}
          alt={item.name}
          className="w-24 h-24 rounded-xl object-cover bg-gray-100"
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop';
          }}
        />
        {/* Veg / Non-veg dot */}
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

        {/* Price updates when variant selected */}
        <p className="text-[#FF6B00] font-bold mt-1">₹{displayPrice}</p>

        {/* ── Variant selector with per-variant qty badge ── */}
        {hasVariants && (
          <div className="mt-2 space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Choose size:</p>
            <div className="flex flex-wrap gap-2">
              {item.variants.map(v => {
                const isSelected   = selectedVariant?.name === v.name;
                // qty in cart for THIS specific variant (independent of selectedVariant)
                const variantCartItem = getCartItem(v.name);
                const variantQty      = variantCartItem?.quantity || 0;

                return (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(isSelected ? null : v)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                      ${isSelected
                        ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]'
                        : 'border-gray-200 text-gray-600 hover:border-[#FF6B00] hover:text-[#FF6B00]'}`}
                  >
                    {/* Radio dot */}
                    <span className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center
                      ${isSelected ? 'border-[#FF6B00]' : 'border-gray-300'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />}
                    </span>

                    {v.name}
                    <span className={isSelected ? 'text-[#FF6B00]' : 'text-gray-400'}>
                      ₹{v.price}
                    </span>

                    {/* Cart qty badge — shows how many of THIS variant are in cart */}
                    {variantQty > 0 && (
                      <span className="ml-0.5 bg-[#FF6B00] text-white text-[10px] font-bold
                        w-4 h-4 rounded-full flex items-center justify-center leading-none">
                        {variantQty}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Action area: +/− controls OR "+ Add" button ── */}
        <div className="mt-3 flex items-center justify-end">

          {!item.isAvailable ? (
            /* Item not available */
            <span className="text-xs text-gray-400 border border-gray-200 px-4 py-1.5 rounded-xl">
              Unavailable
            </span>

          ) : showQtyControls ? (
            /* ── [− qty +] controls ── */
            <div className="flex items-center gap-1 border-2 border-[#FF6B00] rounded-xl overflow-hidden">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center text-[#FF6B00] hover:bg-orange-50 font-bold text-lg transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-7 text-center font-bold text-gray-900 text-sm">
                {cartQty}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center bg-[#FF6B00] text-white hover:bg-[#E05A00] font-bold text-lg transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

          ) : (
            /* ── "+ Add" / "Select size" button ── */
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
              ) : hasVariants && !selectedVariant
                ? 'Select size'
                : '+ Add'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
