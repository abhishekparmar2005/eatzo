import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await API.get('/cart');
      setCart(res.data.data);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── Derived values ───────────────────────────────────────────────────
  const items     = cart?.items || [];
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Add item (with optional variant + variantPrice) ──────────────────
  // MenuCard calls: addToCart(menuItemId, 1, 'Half', 150)
  const addToCart = async (menuItemId, quantity = 1, variant = '', variantPrice = null) => {
    const res = await API.post('/cart/add', {
      menuItemId,
      quantity,
      variant,
      ...(variantPrice !== null ? { variantPrice } : {}),
    });
    setCart(res.data.data);
  };

  // ── Update quantity (with variant so correct row is targeted) ────────
  // Cart.js calls: updateQuantity(menuItemId, newQty, variant)
  const updateQuantity = async (menuItemId, quantity, variant = '') => {
    const res = await API.put('/cart/update', { menuItemId, quantity, variant });
    setCart(res.data.data);
  };

  // ── Clear cart ───────────────────────────────────────────────────────
  const clearCart = async () => {
    await API.delete('/cart/clear');
    setCart({ items: [] });
  };

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartTotal, loading, fetchCart, addToCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
