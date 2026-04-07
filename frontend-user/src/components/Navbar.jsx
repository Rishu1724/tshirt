import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const { items, openCart } = useCartStore();

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-surface/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-6 flex flex-wrap gap-4 justify-between items-center py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform rotate-12">
             <span className="text-white text-xl transform -rotate-12">T</span>
          </div>
          <span className="text-white">Threadz<span className="text-secondary">.</span></span>
        </Link>
        
        {/* Search Bar - Flipkart Style */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search for products, brands and more..." 
            className="w-full bg-background/50 border border-white/10 group-focus-within:border-primary/50 group-focus-within:bg-background rounded-xl py-2.5 pl-12 pr-4 text-sm text-text outline-none transition-all duration-300 shadow-inner"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 font-medium">
          <Link to="/" className="hidden md:flex items-center gap-2 text-text hover:text-primary transition-colors text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Collections
          </Link>
          
          <button onClick={openCart} className="relative flex items-center gap-2 text-text hover:text-primary transition-colors group">
            <div className="relative">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-secondary text-background text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(255,225,27,0.5)]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:block text-sm">Cart</span>
          </button>
          
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 text-sm text-text hover:text-secondary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          ) : (
             <Link to="/login" className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                Sign In
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
