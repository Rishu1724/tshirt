import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const socketUrl = API_BASE_URL || undefined;

const NotificationListener = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    // Only listen if user is logged in as admin
    if (!user || user.role !== 'admin') return;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socket.on('new_order', (order) => {
      toast(`System Alert: New incoming order! #${order._id.slice(-6).toUpperCase()}`, {
        icon: '⚠️',
        duration: 6000,
        style: {
          background: '#18181b', // Admin surface matches tailwind
          border: '1px solid #39ff14', // Neon Green Admin Primary
          color: '#39ff14',
          fontWeight: '900',
          borderRadius: '4px'
        },
      });
    });

    socket.on('global_order_status_update', (order) => {
      toast(`Status Net: Order #${order._id.slice(-6).toUpperCase()} transitioned to ${order.status}`, {
        icon: '🔗',
        duration: 4000,
        style: {
          background: '#09090b',
          border: '1px solid #ff00ff', // Admin pink secondary
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: '4px'
        },
      });
    });

    return () => {
      socket.off('new_order');
      socket.off('global_order_status_update');
      socket.disconnect();
    };
  }, [user]);

  return <Toaster position="top-center" />;
};

export default NotificationListener;
