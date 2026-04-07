import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const apiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path);

const statusClassMap = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  packed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const Dashboard = () => {
  const { logout, user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image: null,
  });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(apiUrl('/api/orders')),
        axios.get(apiUrl('/api/products')),
        axios.get(apiUrl('/api/users')),
      ]);

      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
    [orders]
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'delivered').length,
    [orders]
  );

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  const handleProductChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const createProduct = async (e) => {
    e.preventDefault();

    if (!productForm.image) {
      setProductMessage('Please choose an image to upload.');
      return;
    }

    try {
      setCreatingProduct(true);
      setProductMessage('');

      const uploadForm = new FormData();
      uploadForm.append('image', productForm.image);

      const uploadRes = await axios.post(apiUrl('/api/products/upload'), uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await axios.post(apiUrl('/api/products'), {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        imageUrl: uploadRes.data.imageUrl,
        imagePublicId: uploadRes.data.imagePublicId,
      });

      setProductForm({ title: '', description: '', price: '', stock: '', image: null });
      setProductMessage('Product created successfully.');
      await fetchDashboardData();
      setActiveTab('products');
    } catch (err) {
      setProductMessage(err.response?.data?.message || 'Failed to create product');
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Cyberpunk Neon */}
      <div className="w-64 bg-surface border-r border-white/5 p-6 flex-col gap-8 hidden md:flex relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(57,255,20,0.6)]">A</div>
          <span className="font-black text-xl text-white tracking-widest uppercase">Admin</span>
        </div>
        <nav className="flex flex-col gap-3 relative z-10 mt-8">
          <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${activeTab === 'overview' ? 'bg-primary/10 text-primary border border-primary/40 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Overview</button>
          <button onClick={() => setActiveTab('products')} className={`text-left px-4 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${activeTab === 'products' ? 'bg-primary/10 text-primary border border-primary/40 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Products</button>
          <button onClick={() => setActiveTab('orders')} className={`text-left px-4 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${activeTab === 'orders' ? 'bg-primary/10 text-primary border border-primary/40 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Global Orders</button>
          <button onClick={() => setActiveTab('users')} className={`text-left px-4 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${activeTab === 'users' ? 'bg-primary/10 text-primary border border-primary/40 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Users</button>
        </nav>
        
        <div className="mt-auto relative z-10">
          <button onClick={logout} className="w-full py-3.5 rounded-xl border border-secondary/40 text-secondary hover:bg-secondary/10 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] font-black text-xs uppercase tracking-widest transition-all">
            System Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full">
        <header className="h-20 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
           <h2 className="text-xl font-black italic tracking-wide text-white">SYSTEM <span className="text-primary">OVERVIEW</span></h2>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#39ff14] border border-[#39ff14]/30 bg-[#39ff14]/10 py-2 px-4 rounded-full shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                 ROOT: {user?.name || 'Authorized'}
              </span>
           </div>
        </header>
        
        <main className="p-8 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-surface border-t-2 border-t-primary rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-t-[4px] transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"/>
                <p className="text-textMuted text-xs font-black uppercase tracking-widest mb-2">Total Gross Volume</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">
                  {loading ? '...' : formatINR(totalSales)}
                </h3>
             </div>
             <div className="bg-surface border-t-2 border-t-[#00ffcc] rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-t-[4px] transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00ffcc]/10 rounded-full blur-2xl group-hover:bg-[#00ffcc]/20 transition-all duration-500"/>
                <p className="text-textMuted text-xs font-black uppercase tracking-widest mb-2">Active Shipments</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{loading ? '...' : activeOrders}</h3>
             </div>
             <div className="bg-surface border-t-2 border-t-secondary rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-t-[4px] transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-500"/>
                <p className="text-textMuted text-xs font-black uppercase tracking-widest mb-2">Products / Users</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">
                  {loading ? '...' : `${products.length} / ${users.length}`}
                </h3>
             </div>
          </div>
             )}

             {(activeTab === 'overview' || activeTab === 'orders') && (
             <div className="card p-6 mb-8">
             <h3 className="text-lg font-bold mb-6">Recent Orders</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-700 text-textMuted text-sm">
                     <th className="pb-3 pr-4 font-medium">Order ID</th>
                     <th className="pb-3 pr-4 font-medium">Customer</th>
                     <th className="pb-3 pr-4 font-medium">Date</th>
                     <th className="pb-3 pr-4 font-medium">Status</th>
                     <th className="pb-3 font-medium">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {!loading && recentOrders.length === 0 && (
                     <tr>
                       <td className="py-6 text-textMuted" colSpan={5}>No orders found in MongoDB yet.</td>
                     </tr>
                   )}

                   {recentOrders.map((order) => (
                     <tr key={order._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                       <td className="py-4 pr-4 font-mono text-primary">#{order._id.slice(-6).toUpperCase()}</td>
                       <td className="py-4 pr-4">{order.user?.name || 'Customer'}</td>
                       <td className="py-4 pr-4 text-textMuted">{formatDate(order.createdAt)}</td>
                       <td className="py-4 pr-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClassMap[order.status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                           {order.status}
                         </span>
                       </td>
                       <td className="py-4 font-medium">{formatINR(order.totalPrice)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-5">Create Product</h3>

                {productMessage && (
                  <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/10 text-primary text-sm">
                    {productMessage}
                  </div>
                )}

                <form onSubmit={createProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={productForm.title} onChange={(e) => handleProductChange('title', e.target.value)} placeholder="Product title" className="px-3 py-2 bg-background border border-white/10 rounded-lg" required />
                  <input value={productForm.price} onChange={(e) => handleProductChange('price', e.target.value)} type="number" step="0.01" placeholder="Price (INR)" className="px-3 py-2 bg-background border border-white/10 rounded-lg" required />
                  <input value={productForm.stock} onChange={(e) => handleProductChange('stock', e.target.value)} type="number" placeholder="Stock" className="px-3 py-2 bg-background border border-white/10 rounded-lg" required />
                  <input type="file" accept="image/*" onChange={(e) => handleProductChange('image', e.target.files?.[0] || null)} className="px-3 py-2 bg-background border border-white/10 rounded-lg" required />
                  <textarea value={productForm.description} onChange={(e) => handleProductChange('description', e.target.value)} placeholder="Description" className="md:col-span-2 px-3 py-2 bg-background border border-white/10 rounded-lg min-h-28" required />
                  <button type="submit" disabled={creatingProduct} className="md:col-span-2 btn-action disabled:opacity-50">
                    {creatingProduct ? 'Creating Product...' : 'Create Product'}
                  </button>
                </form>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold mb-5">All Products ({products.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-textMuted text-sm">
                        <th className="pb-3 pr-4 font-medium">Product</th>
                        <th className="pb-3 pr-4 font-medium">Price (INR)</th>
                        <th className="pb-3 pr-4 font-medium">Stock</th>
                        <th className="pb-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {products.map((product) => (
                        <tr key={product._id} className="border-b border-slate-800/50">
                          <td className="py-3 pr-4">{product.title}</td>
                          <td className="py-3 pr-4">{formatINR(product.price)}</td>
                          <td className="py-3 pr-4">{product.stock}</td>
                          <td className="py-3">{formatDate(product.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-5">Registered Users ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-textMuted text-sm">
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Email</th>
                      <th className="pb-3 pr-4 font-medium">Role</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((entry) => (
                      <tr key={entry._id} className="border-b border-slate-800/50">
                        <td className="py-3 pr-4">{entry.name}</td>
                        <td className="py-3 pr-4">{entry.email}</td>
                        <td className="py-3 pr-4 capitalize">{entry.role}</td>
                        <td className="py-3">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
