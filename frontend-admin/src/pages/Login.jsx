import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('admin@threadz.com');
  const [password, setPassword] = useState('admin123');
  const { login, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authUser = await login(email, password);
      if (authUser.role === 'admin') navigate('/');
      else alert('Unauthorized: Admins only');
    } catch (err) { }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md p-10 bg-surface rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(57,255,20,0.15)] relative z-10 backdrop-blur-xl group">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <h2 className="text-3xl font-black text-center text-white mb-2 tracking-widest uppercase">Admin<span className="text-primary italic">.Portal</span></h2>
        <p className="text-center text-textMuted text-xs font-bold uppercase tracking-[0.2em] mb-8">System Access Required</p>
        
        {error && <div className="p-4 mb-6 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative group/input">
            <input 
              type="email" 
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all focus:bg-background placeholder-transparent peer"
              placeholder="Admin Email"
              required 
            />
            <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Admin Email</label>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
               <svg className="w-4 h-4 text-textMuted peer-focus:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
          </div>
          <div className="relative group/input">
            <input 
              type="password" 
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all focus:bg-background placeholder-transparent peer"
              placeholder="Password"
              required 
            />
            <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Password</label>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
               <svg className="w-4 h-4 text-textMuted peer-focus:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary/10 border border-primary text-primary font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary hover:text-black transition-all shadow-[0_0_20px_rgba(57,255,20,0.1)] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] disabled:opacity-50 mt-4 relative overflow-hidden"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-textMuted uppercase font-bold tracking-widest">
          No Access? <Link to="/register" className="text-secondary hover:text-primary transition-colors hover:shadow-[0_0_10px_currentColor]">Register</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
