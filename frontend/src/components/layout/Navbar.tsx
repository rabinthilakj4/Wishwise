import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Bell,
  Search,
  User as UserIcon,
  Sparkles,
  Layers,
  Scale,
  ShieldAlert,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { cartService } from '../../services/cartService';
import { Notification } from '../../types';
import { InitialsAvatar } from '../common/InitialsAvatar';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { wishlists, comparedProductIds } = useWishlistStore();
  const { cart, fetchCart } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalWishlistItems = wishlists.reduce((sum, w) => sum + (w.items?.length || 0), 0);
  const totalCartItems = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  useEffect(() => {
    if (user) {
      fetchCart();
      cartService.getNotifications().then((res: any) => {
        if (res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      }).catch(() => {});
    }
  }, [user, fetchCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <span>Wish<span className="text-pink-600">Wise</span></span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
            <input
              type="text"
              placeholder="Search products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-100 border border-transparent rounded-full text-xs focus:bg-white focus:border-pink-500 focus:outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </form>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/products" className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-pink-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50">
              <Layers className="w-4 h-4" /> Products
            </Link>

            <Link to="/assistant" className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full shadow-xs transition">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-200 animate-pulse" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Link>

            {comparedProductIds.length > 0 && (
              <Link to="/compare" className="relative flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100">
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
                <span className="ml-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {comparedProductIds.length}
                </span>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link to="/wishlists" className="relative p-1.5 text-gray-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition" title="Wishlists">
              <Heart className="w-5 h-5" />
              {totalWishlistItems > 0 && (
                <span className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-1.5 text-gray-700 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition" title="Cart">
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 text-gray-700 hover:text-purple-600 rounded-full hover:bg-purple-50 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-900">Notifications</h4>
                      <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-pink-600 font-medium hover:underline">
                        View All
                      </Link>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto my-2">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-gray-500">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n.id} className={`py-2.5 px-2 text-xs rounded-lg transition ${n.read ? 'opacity-70' : 'bg-pink-50/50 font-medium'}`}>
                            <p className="text-gray-900 font-medium">{n.title}</p>
                            <p className="text-gray-600 text-[11px] mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <InitialsAvatar name={user.name} avatar={user.avatar} size="sm" />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                      <InitialsAvatar name={user.name} avatar={user.avatar} size="md" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition mt-1"
                    >
                      <UserIcon className="w-4 h-4" /> My Profile
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Portal
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition"
                    >
                      <ShoppingCart className="w-4 h-4" /> My Orders
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-xs font-semibold text-gray-700 hover:text-pink-600 px-3 py-1.5 rounded-lg">
                  Sign In
                </Link>
                <Link to="/register" className="text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 px-3.5 py-1.5 rounded-full shadow-xs transition">
                  Register
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
