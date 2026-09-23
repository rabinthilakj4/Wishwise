import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  ShieldCheck,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Inventory', path: '/admin/products', icon: Package },
    { label: 'Demand Intelligence', path: '/admin/demand', icon: TrendingUp },
    { label: 'User Management', path: '/admin/users', icon: Users, adminOnly: true },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">WishWise Admin</h2>
              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800/50 px-2 py-0.5 rounded font-mono uppercase">
                {user?.role || 'ADMIN'} Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return null;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Main Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
