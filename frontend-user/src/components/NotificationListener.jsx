import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://srv-d7altk94tr6s739pkiag.onrender.com';

const NotificationListener = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });

    socket.on('product_created', (product) => {
      toast.success(`Hype Drop: ${product.name} is now available! 🔥`, {
        duration: 5000,
        style: {
          background: '#2874f0',
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: '12px'
        },
      });
    });

    socket.on('order_status_update', (order) => {
      // Only notify if looking at their own order, or just notify if order.user matches
      if (user && order.user === user._id) {
        toast(`Order Update: Your order #${order._id.slice(-6).toUpperCase()} is now ${order.status}!`, {
          icon: '📦',
          duration: 6000,
          style: {
            background: '#ffe11b',
            color: '#111',
            fontWeight: 'bold',
            borderRadius: '12px'
          },
        });
      }
    });

    return () => {
      socket.off('product_created');
      socket.off('order_status_update');
      socket.disconnect();
    };
  }, [user]);

  return <Toaster position="bottom-right" />;
};

export default NotificationListener;
