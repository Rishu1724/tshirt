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
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Grid & Blur */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-10 bg-surface rounded-none border-2 border-primary shadow-[0_0_50px_rgba(255,69,0,0.15)] relative z-10 backdrop-blur-xl group">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-primary/10 border-2 border-primary text-primary shadow-[0_0_15px_rgba(255,69,0,0.5)] rounded-lg flex items-center justify-center font-black text-3xl">W</div>
        </div>
        <h2 className="text-3xl font-black text-center text-white mb-2 tracking-widest uppercase">SYS<span className="text-primary italic">_AUTH</span></h2>
        <p className="text-center text-secondary text-xs font-mono uppercase tracking-[0.2em] mb-8 animate-pulse">Logistics Personnel Only</p>
        
        {error && <div className="p-4 mb-6 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative group/input">
            <input 
              type="email" 
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="w-full bg-background/80 border-b-2 border-white/20 rounded-none px-4 py-4 text-sm text-white font-mono focus:outline-none focus:border-primary transition-all placeholder-transparent peer"
              placeholder="Staff ID"
              required 
            />
            <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Staff ID</label>
          </div>
          
          <div className="relative group/input">
            <input 
              type="password" 
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className="w-full bg-background/80 border-b-2 border-white/20 rounded-none px-4 py-4 text-sm text-white font-mono focus:outline-none focus:border-primary transition-all placeholder-transparent peer"
              placeholder="Access Code"
              required 
            />
            <label className="absolute text-xs font-bold uppercase tracking-widest text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Access Code</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-background font-black uppercase tracking-[0.3em] py-4 rounded-none hover:bg-white hover:text-primary transition-all shadow-[0_0_20px_rgba(255,69,0,0.5)] disabled:opacity-50 mt-4 border border-transparent hover:border-primary"
          >
            {loading ? 'Verifying...' : 'Access Queue'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-textMuted uppercase font-mono tracking-widest">
          New Unit? <Link to="/register" className="text-secondary hover:text-white transition-colors hover:shadow-[0_0_10px_currentColor]">Register</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
