import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
        axios.get(`${API_BASE_URL}/api/orders`),
        axios.get(`${API_BASE_URL}/api/products`),
        axios.get(`${API_BASE_URL}/api/users`),
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

      const uploadRes = await axios.post(`${API_BASE_URL}/api/products/upload`, uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await axios.post(`${API_BASE_URL}/api/products`, {
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
      {/* Sidebar */}
      <div className="w-64 bg-surface border-r border-slate-800 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-background shadow-lg shadow-primary/30">A</div>
          <span className="font-bold text-xl text-white">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Overview</button>
          <button onClick={() => setActiveTab('products')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'products' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Products</button>
          <button onClick={() => setActiveTab('orders')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Global Orders</button>
          <button onClick={() => setActiveTab('users')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}>Users</button>
        </nav>
        
        <div className="mt-auto">
          <button onClick={logout} className="w-full py-3 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold transition-colors">
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full">
        <header className="h-20 bg-surface/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
           <h2 className="text-xl font-semibold">Dashboard Overview</h2>
           <div className="flex items-center gap-4">
              <span className="text-sm font-medium bg-slate-800 py-2 px-4 rounded-full border border-slate-700">Admin: {user?.name || 'Authorized'}</span>
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
             <div className="card p-6 border-l-4 border-l-primary">
                <p className="text-textMuted text-sm font-medium mb-1">Total Sales</p>
                <h3 className="text-3xl font-bold text-white">
                  {loading ? '...' : formatINR(totalSales)}
                </h3>
             </div>
             <div className="card p-6 border-l-4 border-l-blue-500">
                <p className="text-textMuted text-sm font-medium mb-1">Active Orders</p>
                <h3 className="text-3xl font-bold text-white">{loading ? '...' : activeOrders}</h3>
             </div>
             <div className="card p-6 border-l-4 border-l-purple-500">
                <p className="text-textMuted text-sm font-medium mb-1">Products / Users</p>
                <h3 className="text-3xl font-bold text-white">
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
