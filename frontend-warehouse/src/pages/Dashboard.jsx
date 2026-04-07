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
         const { data } = await axios.get(apiUrl('/api/orders'));
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
         await axios.put(apiUrl(`/api/orders/${orderId}/status`), { status: nextStatus });
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
         <header className="bg-surface/90 backdrop-blur-md border-b-2 border-b-primary shadow-[0_10px_30px_rgba(255,69,0,0.15)] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3 sm:gap-4 group min-w-0">
           <div className="w-12 h-12 bg-primary/10 border-2 border-primary text-primary shadow-[0_0_15px_rgba(255,69,0,0.5)] group-hover:shadow-[0_0_25px_rgba(255,69,0,0.8)] rounded-lg flex items-center justify-center font-black text-2xl transition-all">W</div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-text flex flex-col leading-none min-w-0">
             Sector 7 <span className="text-primary text-sm tracking-[0.3em]">Logistics Hub</span>
           </h1>
        </div>
            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 md:gap-8 text-sm font-medium w-full sm:w-auto">
                <span className="text-secondary flex items-center gap-2 border border-secondary/20 bg-secondary/10 px-3 py-1 rounded font-mono uppercase tracking-widest text-xs shadow-[0_0_10px_rgba(255,255,0,0.2)] max-w-full">
             <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
             Operator: {user?.name || 'Facility'}
           </span>
           <button onClick={logout} className="relative overflow-hidden group border border-red-500 text-red-500 font-black uppercase text-xs tracking-widest py-2 px-6 hover:text-white transition-colors">
             <span className="relative z-10">Abort Session</span>
             <div className="absolute inset-0 h-full w-full bg-red-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
           </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 container mx-auto max-w-6xl w-full">
            {error && (
               <div className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                  {error}
               </div>
            )}

            <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-4 sm:gap-6 border-b border-white/5 pb-6">
           <div>
                     <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                <svg className="w-8 h-8 text-secondary animate-slide-up" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Action Queue
              </h2>
              <p className="text-textMuted font-mono text-sm tracking-wide mt-2">SYS_MSG: Units pending authorization and dispatch.</p>
           </div>
           
                <div className="bg-background border border-white/10 rounded-sm flex p-1 shadow-inner w-full sm:w-auto">
             <button 
               onClick={() => setActiveTab('pending')}
                      className={`py-2 px-4 sm:px-8 uppercase font-black text-xs tracking-widest transition-all flex-1 sm:flex-none ${activeTab === 'pending' ? 'bg-primary text-black shadow-[0_0_20px_rgba(255,69,0,0.5)]' : 'text-textMuted hover:text-white'}`}>
               Req_Pack
             </button>
             <button 
               onClick={() => setActiveTab('shipped')}
                      className={`py-2 px-4 sm:px-8 uppercase font-black text-xs tracking-widest transition-all flex-1 sm:flex-none ${activeTab === 'shipped' ? 'bg-secondary text-black shadow-[0_0_20px_rgba(255,255,0,0.5)]' : 'text-textMuted hover:text-white'}`}>
               Dispatched
             </button>
           </div>
        </div>

        {/* Assigned Orders Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
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

                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
