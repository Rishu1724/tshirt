import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('warehouse@threadz.com');
  const [password, setPassword] = useState('wh123');
  const { login, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'warehouse') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authUser = await login(email, password);
      if (authUser.role === 'warehouse') navigate('/');
      else alert('Unauthorized: Logistics Staff only');
    } catch (err) { }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-2xl border border-primary/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Logistics Login</h2>
        
        {error && <div className="p-3 mb-6 bg-red-500/20 text-red-500 rounded-lg text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Staff ID (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Queue'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-textMuted">
          New staff member? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
