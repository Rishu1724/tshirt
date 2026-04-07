import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'user') {
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
      await register({ name, email, password, role: 'user' });
      navigate('/');
    } catch (err) {
      // Error state handled in store.
    }
  };

  return (
    <div className="flex items-center justify-center min-vh-screen py-32 px-6">
      <div className="w-full max-w-md p-8 bg-surface rounded-3xl border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />

        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-textMuted mb-8">Join Threadz to start shopping.</p>

        {(error || localError) && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="you@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-purple-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-textMuted">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
