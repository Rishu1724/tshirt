import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const apiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path);
const socketUrl = API_BASE_URL || undefined;

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, isOpen, addItem, updateQty, removeItem, closeCart, clearCart } = useCartStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(apiUrl('/api/products'));
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    const refreshProducts = async () => {
      try {
        const { data } = await axios.get(apiUrl('/api/products'));
        setProducts(data);
      } catch (error) {
        console.error('Error refreshing products:', error);
      }
    };

    socket.on('product_created', refreshProducts);
    fetchProducts();
    const refreshInterval = setInterval(refreshProducts, 15000);

    return () => {
      clearInterval(refreshInterval);
      socket.off('product_created', refreshProducts);
      socket.disconnect();
    };
  }, []);

  const cartTotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    if (!shipping.street || !shipping.city || !shipping.state || !shipping.zip || !shipping.country) {
      setCheckoutError('Please fill complete shipping address.');
      return;
    }

    try {
      setPlacingOrder(true);
      setCheckoutError('');
      setOrderSuccess('');

      const payload = {
        orderItems: items.map((item) => ({
          product: item.product._id,
          qty: item.qty,
        })),
        shippingAddress: shipping,
        paymentMethod: 'Cash on Delivery',
      };

      const { data } = await axios.post(apiUrl('/api/orders'), payload);
      clearCart();
      setOrderSuccess(`Order placed successfully. Order ID: #${data._id.slice(-6).toUpperCase()}`);
    } catch (error) {
      setCheckoutError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Category Nav - Flipkart Signature */}
      <div className="pt-28 sm:pt-24 pb-4 border-b border-white/5 bg-background shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-max text-sm font-semibold">
            {['Top Offers', 'Mobiles & Tablets', 'Electronics', 'TVs & Appliances', 'Fashion', 'Beauty', 'Home & Kitchen', 'Furniture', 'Travel', 'Grocery'].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-surface border border-white/5 flex items-center justify-center group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(40,116,240,0.5)] transition-all">
                   <span className="text-xl">👕</span>
                </div>
                <span className="text-textMuted group-hover:text-primary transition-colors">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner - Gen Z Animated */}
      <section className="relative px-4 sm:px-5 md:px-6 py-8">
        <div className="container mx-auto">
          <div className="w-full rounded-3xl overflow-hidden relative bg-gradient-to-r from-primary/80 to-secondary/80 h-[320px] sm:h-[360px] md:h-[400px] flex items-center shadow-[0_0_40px_rgba(40,116,240,0.2)] border border-white/10 group">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-secondary blur-[100px] rounded-full opacity-50 mix-blend-screen animate-pulse" />
             <div className="absolute bottom-0 left-10 w-48 h-48 bg-primary blur-[80px] rounded-full opacity-60 mix-blend-screen duration-700" />
             
             <div className="relative z-10 px-6 sm:px-10 md:px-20 animate-slide-up max-w-2xl">
                <span className="bg-black/40 text-secondary border border-secondary/50 px-3 py-1 text-xs font-black uppercase tracking-widest rounded-sm backdrop-blur-md mb-4 inline-block">
                  Big Billion Day Drop
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4 leading-none">
                  FLEX YOUR <br /> AESTHETIC.
                </h1>
                <p className="text-white/80 font-medium max-w-sm mb-8">
                  Get up to 80% off on premium threads. Upgrade your street cred.
                </p>
                <button className="bg-white text-background px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-secondary hover:text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  SHOP NOW
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 sm:px-5 md:px-6 container mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-surface/50 p-4 sm:p-6 rounded-t-2xl border-b border-primary/20 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tight">Deals of the Day</h2>
            <span className="bg-primary px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1 animate-pulse">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.984 3.984 0 01-3.143-1.59zM10 2a1 1 0 00-1 1v1.323L5.046 5.905 3.447 5.1A1 1 0 002.553 6.89l1.233.616-1.738 5.42a1 1 0 00.285 1.05A3.989 3.989 0 005 15a3.984 3.984 0 003.143-1.59h3.714" /></svg>
              LIVE
            </span>
          </div>
          <button className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-colors flex items-center gap-2 group shadow-[0_0_15px_rgba(40,116,240,0.3)] w-full sm:w-auto justify-center">
            VIEW ALL
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20 bg-surface/30 rounded-b-2xl backdrop-blur-md">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-surface/30 p-4 sm:p-6 rounded-b-2xl border border-t-0 border-white/5 backdrop-blur-md">
            {products.map((product) => (
              <div key={product._id} className="bg-background border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(40,116,240,0.15)] group flex flex-col">
                <div className="relative h-44 sm:h-48 md:h-64 overflow-hidden bg-white/5 p-4 flex items-center justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                  />
                  <div className="absolute top-3 left-3">
                    {product.stock < 10 && (
                       <span className="bg-secondary text-black text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-wider shadow-[0_0_10px_rgba(255,225,27,0.5)]">
                          Only {product.stock} Left
                       </span>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center text-textMuted hover:text-secondary hover:border-secondary transition-colors">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                  </button>
                </div>
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="text-sm md:text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2 text-text/90 leading-tight">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2 mt-auto">
                    <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                       4.8 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    </span>
                    <span className="text-xs text-textMuted">(1,245)</span>
                    <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="FAssured" className="h-4 ml-auto" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg md:text-xl font-bold text-white">{formatINR(product.price)}</span>
                    <span className="text-sm text-textMuted line-through">{formatINR(product.price * 1.4)}</span>
                    <span className="text-xs font-bold text-green-400">28% off</span>
                  </div>
                  <button
                    onClick={() => addItem(product)}
                    className="w-full btn-primary py-2.5 rounded-lg text-sm bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-white shadow-none hover:shadow-[0_0_20px_rgba(40,116,240,0.4)]"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-full sm:max-w-md h-full bg-surface border-l border-white/10 p-4 sm:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold">Your Cart</h3>
              <button onClick={closeCart} className="text-textMuted hover:text-white">Close</button>
            </div>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                {checkoutError}
              </div>
            )}

            {orderSuccess && (
              <div className="mb-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm">
                {orderSuccess}
              </div>
            )}

            {items.length === 0 ? (
              <p className="text-textMuted">Your cart is empty.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product._id} className="p-3 rounded-xl border border-white/10 bg-background/40">
                    <div className="flex gap-3">
                      <img src={item.product.imageUrl} alt={item.product.title} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-semibold line-clamp-1 text-sm sm:text-base">{item.product.title}</p>
                        <p className="text-textMuted text-sm">{formatINR(item.product.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.qty}
                            onChange={(e) => updateQty(item.product._id, e.target.value)}
                            className="w-20 px-2 py-1 bg-surface border border-white/10 rounded-lg"
                          />
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="text-red-400 text-sm hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/10 pt-5 space-y-3">
              <h4 className="font-semibold">Shipping Address</h4>
              <input value={shipping.street} onChange={(e) => handleShippingChange('street', e.target.value)} placeholder="Street" className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg" />
              <input value={shipping.city} onChange={(e) => handleShippingChange('city', e.target.value)} placeholder="City" className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={shipping.state} onChange={(e) => handleShippingChange('state', e.target.value)} placeholder="State" className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg" />
                <input value={shipping.zip} onChange={(e) => handleShippingChange('zip', e.target.value)} placeholder="ZIP" className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg" />
              </div>
              <input value={shipping.country} onChange={(e) => handleShippingChange('country', e.target.value)} placeholder="Country" className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg" />

              <div className="pt-2 flex items-center justify-between">
                <p className="text-lg font-bold">Total: {formatINR(cartTotal)}</p>
                <button
                  onClick={placeOrder}
                  disabled={placingOrder || items.length === 0}
                  className="btn-primary px-5 py-2 rounded-lg disabled:opacity-50"
                >
                  {placingOrder ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
