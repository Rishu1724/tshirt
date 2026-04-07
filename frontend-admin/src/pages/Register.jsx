import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('newadmin@threadz.com');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('admin123');
  const [localError, setLocalError] = useState('');
  const { register, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password, role: 'admin' });
      navigate('/');
    } catch (err) {
      // Error is surfaced from the auth store.
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-10 bg-surface rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(57,255,20,0.15)] relative z-10 backdrop-blur-xl group">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <h2 className="text-3xl font-black text-center text-white mb-2 tracking-widest uppercase">Admin<span className="text-secondary italic">.Init</span></h2>
        <p className="text-center text-textMuted text-xs font-bold uppercase tracking-[0.2em] mb-8">Provision New Admin</p>

        {(error || localError) && (
          <div className="p-4 mb-6 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm font-medium">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative group/input">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all focus:bg-background placeholder-transparent peer"
              placeholder="Full Name"
              required
            />
             <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Full Name</label>
          </div>

          <div className="relative group/input">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all focus:bg-background placeholder-transparent peer"
              placeholder="Email Address"
              required
            />
             <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Email Address</label>
          </div>

          <div className="relative group/input">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all focus:bg-background placeholder-transparent peer"
              placeholder="Password"
              required
            />
             <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Password</label>
          </div>

          <div className="relative group/input">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all focus:bg-background placeholder-transparent peer"
              placeholder="Confirm Password"
              required
            />
             <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Confirm Password</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary/10 border border-primary text-primary font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary hover:text-black transition-all shadow-[0_0_20px_rgba(57,255,20,0.1)] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] disabled:opacity-50 mt-4 relative overflow-hidden"
          >
            {loading ? 'Initializing...' : 'Create Admin Root'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-textMuted uppercase font-bold tracking-widest">
          Have System Auth? <Link to="/login" className="text-secondary hover:text-primary transition-colors hover:shadow-[0_0_10px_currentColor]">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
