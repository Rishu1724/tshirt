import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const savedToken = localStorage.getItem('token');

if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: savedToken || null,
  error: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
      const { token, ...user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login Failed', loading: false });
      throw err;
    }
  },

  register: async ({ name, email, password, role }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name,
        email,
        password,
        role,
      });
      const { token, ...user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration Failed', loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
