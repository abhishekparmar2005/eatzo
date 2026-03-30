import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [] }); return; }
    try {
      const res = await API.get('/cart');
      setCart(res.data.data || { items: [] });
    } catch { setCart({ items: [] }); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // variant: e.g. "Half" or "Full" — pass empty string if no variants
  // variantPrice: price of selected variant — pass undefined to use base price
  const addToCart = async (menuItemId, quantity = 1, variant = '', variantPrice) => {
    const res = await API.post('/cart/add', { menuItemId, quantity, variant, variantPrice });
    setCart(res.data.data);
  };

  const updateQuantity = async (menuItemId, quantity) => {
    const res = await API.put('/cart/update', { menuItemId, quantity });
    setCart(res.data.data);
  };

  const clearCart = async () => {
    await API.delete('/cart/clear');
    setCart({ items: [] });
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, addToCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
