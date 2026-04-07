import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });

    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    const refreshProducts = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(data);
      } catch (error) {
        console.error('Error refreshing products:', error);
      }
    };

    socket.on('product_created', refreshProducts);
    fetchProducts();

    return () => {
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

      const { data } = await axios.post(`${API_BASE_URL}/api/orders`, payload);
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
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10 animate-slide-up">
          <span className="inline-block py-1 px-3 rounded-full bg-surface border border-white/10 text-primary text-sm font-semibold mb-6">
            New Summer Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Everyday Style.</span>
          </h1>
          <p className="text-textMuted text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Premium quality t-shirts designed for comfort, crafted for expression. Redefining modern streetwear aesthetics.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="btn-primary">Shop Collection</button>
            <button className="py-3 px-6 rounded-xl font-medium text-white hover:bg-white/5 transition-colors border border-white/10 shadow-lg shadow-black/20">
              View Lookbook
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-6 container mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Live Store Threads</h2>
            <p className="text-textMuted">Products fetched directly from MongoDB Database!</p>
          </div>
          <button className="text-textMuted hover:text-white transition-colors flex items-center gap-2 group">
            View All 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product._id} className="card group cursor-pointer animate-fade-in flex flex-col">
                <div className="relative h-72 overflow-hidden rounded-t-3xl bg-surface">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-surface/90 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg text-primary">
                        Stock: {product.stock}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={() => addItem(product)}
                      className="w-full btn-primary py-3 rounded-xl shadow-lg border border-white/20"
                    >
                      Quick Add to Cart
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                  <p className="text-textMuted font-medium text-lg mb-2">{formatINR(product.price)}</p>
                  <p className="text-sm text-textMuted line-clamp-2">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full bg-surface border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Your Cart</h3>
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
                        <p className="font-semibold line-clamp-1">{item.product.title}</p>
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
              <div className="grid grid-cols-2 gap-3">
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
