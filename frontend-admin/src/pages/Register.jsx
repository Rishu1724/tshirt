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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-2xl border border-primary/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Create Admin Account</h2>

        {(error || localError) && (
          <div className="p-3 mb-6 bg-red-500/20 text-red-400 rounded-lg text-center text-sm">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-textMuted">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
