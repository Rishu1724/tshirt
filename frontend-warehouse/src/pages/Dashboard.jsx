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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const { logout, user } = useAuthStore();
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [updatingOrderId, setUpdatingOrderId] = useState('');

   const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
         const { data } = await axios.get(`${API_BASE_URL}/api/orders`);
         setOrders(data || []);
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchOrders();
   }, []);

   const filteredOrders = useMemo(() => {
      if (activeTab === 'pending') {
         return orders.filter((order) => ['pending', 'confirmed'].includes(order.status));
      }

      if (activeTab === 'shipped') {
         return orders.filter((order) => ['packed', 'shipped', 'delivered'].includes(order.status));
      }

      return orders;
   }, [orders, activeTab]);

   const updateStatus = async (orderId, nextStatus) => {
      try {
         setUpdatingOrderId(orderId);
         await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: nextStatus });
         await fetchOrders();
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to update order status');
      } finally {
         setUpdatingOrderId('');
      }
   };

   const formatDate = (value) => {
      if (!value) return '-';
      return new Date(value).toLocaleString();
   };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface border-b border-orange-500/20 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-primary/20 border border-primary/50 text-primary rounded-xl flex items-center justify-center font-bold text-xl">W</div>
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-300">
             Logistics Panel
           </h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
           <span className="text-textMuted flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             {user?.name || 'Facility'}
           </span>
           <button onClick={logout} className="bg-slate-800 border border-slate-700 py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
             Log Out
           </button>
        </div>
      </header>

      <main className="flex-1 p-8 container mx-auto max-w-6xl">
            {error && (
               <div className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                  {error}
               </div>
            )}

        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-3xl font-bold mb-2">Order Queue</h2>
              <p className="text-textMuted">Orders assigned to this facility for packing and dispatch</p>
           </div>
           
           <div className="bg-surface border border-slate-700 rounded-lg flex p-1">
             <button 
               onClick={() => setActiveTab('pending')}
               className={`py-2 px-6 rounded-md font-medium text-sm transition-all ${activeTab === 'pending' ? 'bg-primary text-slate-900 shadow-md' : 'text-textMuted hover:text-white'}`}>
               Pending Packing
             </button>
             <button 
               onClick={() => setActiveTab('shipped')}
               className={`py-2 px-6 rounded-md font-medium text-sm transition-all ${activeTab === 'shipped' ? 'bg-primary text-slate-900 shadow-md' : 'text-textMuted hover:text-white'}`}>
               Dispatched
             </button>
           </div>
        </div>

        {/* Assigned Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {!loading && filteredOrders.length === 0 && (
                  <div className="card p-6 lg:col-span-2">
                     <p className="text-textMuted">No orders available for this view yet.</p>
                  </div>
               )}

               {filteredOrders.map((order) => (
                  <div key={order._id} className="card p-6 border-l-4 border-l-primary/60">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="font-mono text-xl font-bold text-primary mb-1">#{order._id.slice(-6).toUpperCase()}</h3>
                           <p className="text-textMuted text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusClassMap[order.status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                           {order.status}
                        </span>
                     </div>

                     <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-800">
                        <h4 className="text-sm font-semibold mb-3 text-white">Items to Pack ({order.orderItems?.length || 0})</h4>
                        <div className="space-y-3">
                           {(order.orderItems || []).map((item, index) => (
                              <div key={`${order._id}-${index}`} className="flex items-center gap-4">
                                 <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-slate-700" />
                                 <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-textMuted text-sm">Qty: {item.qty}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex gap-4">
                        {order.status !== 'packed' && order.status !== 'shipped' && order.status !== 'delivered' && (
                           <button
                              onClick={() => updateStatus(order._id, 'packed')}
                              disabled={updatingOrderId === order._id}
                              className="flex-1 btn-action disabled:opacity-60"
                           >
                              {updatingOrderId === order._id ? 'Updating...' : 'Mark as Packed'}
                           </button>
                        )}

                        {order.status === 'packed' && (
                           <button
                              onClick={() => updateStatus(order._id, 'shipped')}
                              disabled={updatingOrderId === order._id}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-60"
                           >
                              {updatingOrderId === order._id ? 'Updating...' : 'Hand Over to Courier'}
                           </button>
                        )}

                        {order.status === 'shipped' && (
                           <button
                              onClick={() => updateStatus(order._id, 'delivered')}
                              disabled={updatingOrderId === order._id}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-60"
                           >
                              {updatingOrderId === order._id ? 'Updating...' : 'Mark Delivered'}
                           </button>
                        )}
                     </div>
                  </div>
               ))}
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
