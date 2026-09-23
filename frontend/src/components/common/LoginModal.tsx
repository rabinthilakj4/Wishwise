import React, { useState } from 'react';
import { Heart, X, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

export const LoginModal: React.FC = () => {
  const { showLoginModal, setShowLoginModal, executePendingCartAction, pendingCartAction } = useCartStore();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!showLoginModal) return null;

  const handleClose = () => {
    setShowLoginModal(false);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      if (pendingCartAction) {
        await executePendingCartAction();
      } else {
        setShowLoginModal(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    try {
      await login({ email: demoEmail, password: demoPass });
      if (pendingCartAction) {
        await executePendingCartAction();
      } else {
        setShowLoginModal(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check backend server.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-600/30">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign In to WishWise</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {pendingCartAction ? 'Please sign in to add products to your cart.' : 'Access your intelligent wishlists & shopping account.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 text-center font-semibold animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In & Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo 1-Click Login Buttons */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
            Quick Demo 1-Click Sign In
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('customer@wishwise.com', 'customer123')}
              className="px-2 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-[11px] font-bold border border-pink-200 transition flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Customer
            </button>
            <button
              onClick={() => handleQuickDemoLogin('manager@wishwise.com', 'manager123')}
              className="px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[11px] font-bold border border-purple-200 transition flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Manager
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin@wishwise.com', 'admin123')}
              className="px-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold border border-indigo-200 transition flex items-center justify-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" /> Admin
            </button>
          </div>
        </div>

        {/* Continue Browsing Button */}
        <div className="text-center pt-1">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition hover:underline"
          >
            Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
