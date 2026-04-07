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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-surface/80 backdrop-blur-md border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          T <span className="text-primary italic">Threadz.</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/" className="text-text hover:text-primary transition-colors">Collections</Link>
          <Link to="/" className="text-text hover:text-primary transition-colors">Track Order</Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={openCart} className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-background text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          
          {user ? (
            <button onClick={logout} className="btn-primary py-2 px-6 rounded-full text-sm">Log Out</button>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-6 rounded-full text-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
