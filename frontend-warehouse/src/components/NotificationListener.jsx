import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://srv-d7altk94tr6s739pkiag.onrender.com';

const NotificationListener = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    // Only listen if user is logged in as warehouse staff
    if (!user || user.role !== 'warehouse') return;

    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });

    socket.on('new_order', (order) => {
      toast(`ACTION REQ: Order #${order._id.slice(-6).toUpperCase()} added to packing queue.`, {
        icon: '⚠️',
        duration: 8000,
        style: {
          background: '#050505', // Warehouse surface
          border: '1px solid #ff4500', // Neon Orange Action
          color: '#ffff00', // Yellow
          fontFamily: 'monospace',
          fontWeight: '900',
          borderRadius: '2px',
          textTransform: 'uppercase'
        },
      });
    });

    return () => {
      socket.off('new_order');
      socket.disconnect();
    };
  }, [user]);

  return <Toaster position="top-right" />;
};

export default NotificationListener;
