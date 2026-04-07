import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'user') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) { }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-20 sm:py-24 md:py-32 px-4 sm:px-5 md:px-6 bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-surface rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">
        
        {/* Left Side - Promotional Flipkart style */}
        <div className="hidden md:flex flex-col justify-center w-full md:w-2/5 bg-primary p-12 text-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary/30" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white">Looks.<br/>Loading.</h2>
            <p className="text-white/80 font-medium text-lg leading-relaxed mb-8">Get access to your Orders, Wishlist and Recommendations.</p>
            <div className="w-full aspect-square bg-[url('https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png')] bg-contain bg-no-repeat bg-center mix-blend-screen opacity-50" />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-12 relative bg-surface">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight text-white">Log in to Threadz</h2>
          <p className="text-textMuted mb-8 text-sm">Enter your details below to continue.</p>
          
          {error && <div className="p-4 mb-6 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative group">
              <input 
                type="email" 
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                className="block w-full px-4 py-3 sm:py-4 text-sm text-white bg-background border-b-2 border-white/10 focus:outline-none focus:border-primary peer rounded-t-lg transition-colors placeholder-transparent"
                placeholder="Email Address"
                required 
              />
              <label className="absolute text-sm text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Email Address</label>
            </div>
            
            <div className="relative group">
              <input 
                type="password" 
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                className="block w-full px-4 py-3 sm:py-4 text-sm text-white bg-background border-b-2 border-white/10 focus:outline-none focus:border-primary peer rounded-t-lg transition-colors placeholder-transparent"
                placeholder="Password"
                required 
              />
              <label className="absolute text-sm text-textMuted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary">Password</label>
            </div>
            
            <p className="text-right text-xs font-semibold text-primary cursor-pointer hover:underline">Forgot password?</p>

            <p className="text-xs text-textMuted">By continuing, you agree to Threadz's <span className="text-primary cursor-pointer hover:underline">Terms of Use</span> and <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.</p>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 sm:py-4 rounded hover:bg-blue-600 transition-colors mt-2 disabled:opacity-50 shadow-[0_8px_20px_rgba(40,116,240,0.3)] shadow-primary/30"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="text-center mt-6 text-sm text-textMuted font-medium">
              New to Threadz? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
