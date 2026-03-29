import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-[#FF6B00] shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Eatzo" className="h-12 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-white/90 hover:text-white font-medium transition-colors">Home</Link>
          {user && <Link to="/orders" className="text-white/90 hover:text-white font-medium transition-colors">My Orders</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="text-white/90 hover:text-white font-medium transition-colors">Admin</Link>}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link to="/cart" className="relative p-2 hover:bg-white/20 rounded-xl transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#FF6B00] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl transition-colors">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#FF6B00] text-sm font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white hidden md:block">{user.name}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                  <hr className="my-1"/>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-white text-[#FF6B00] font-semibold py-2 px-4 rounded-xl hover:bg-orange-50 transition-all duration-200 text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
