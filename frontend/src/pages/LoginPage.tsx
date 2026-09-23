import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, Sparkles, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email, password });
      const { pendingCartAction, executePendingCartAction } = useCartStore.getState();
      if (pendingCartAction) {
        await executePendingCartAction();
      }
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  const quickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      await login({ email: demoEmail, password: demoPass });
      const { pendingCartAction, executePendingCartAction } = useCartStore.getState();
      if (pendingCartAction) {
        await executePendingCartAction();
      }
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign In to WishWise</h2>
          <p className="text-xs text-gray-500">Access your intelligent wishlists, budget planner, and target alerts.</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-700 font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@wishwise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold shadow-lg transition"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick One-Click Demo Logins */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Quick Demo One-Click Login</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin('customer@wishwise.com', 'customer123')}
              className="px-2 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-[11px] font-bold transition text-center"
            >
              🛍️ Customer
            </button>
            <button
              onClick={() => quickLogin('manager@wishwise.com', 'manager123')}
              className="px-2 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold transition text-center"
            >
              🛡️ Manager
            </button>
            <button
              onClick={() => quickLogin('admin@wishwise.com', 'admin123')}
              className="px-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold transition text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-pink-600 hover:underline">
            Register here
          </Link>
        </p>

      </div>

    </div>
  );
};
