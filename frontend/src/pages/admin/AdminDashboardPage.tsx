import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Package, Heart, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { adminService, AdminDashboardData } from '../../services/adminService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatusBadge } from '../../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((res: any) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-xs text-gray-400">Loading admin metrics...</div>
      </AdminLayout>
    );
  }

  const { kpi, mostWishlisted, lowStockProducts } = data;

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Executive Dashboard</h1>
          <p className="text-xs text-gray-400">Real-time wishlist activity, product demand, conversion metrics, and inventory alerts.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-semibold">Total Users</span>
              <Users className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-2xl font-black text-white">{kpi.totalUsers}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-semibold">Wishlists & Items</span>
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{kpi.totalWishlists}</span>
              <span className="text-xs text-pink-400 font-semibold">({kpi.totalWishlistItems} saved items)</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-semibold">Wishlist-to-Cart Conversion</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400">{kpi.conversionRate}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-semibold">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-white">₹{kpi.totalRevenue.toLocaleString('en-IN')}</span>
          </div>

        </div>

        {/* Most Wishlisted Products Table */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current" /> Most Wishlisted Products ("Most Wanted")
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Wishlist Saves</th>
                  <th className="py-3 px-4">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {mostWishlisted.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                      <img src={p.images?.[0]?.url} alt={p.name} className="w-8 h-8 object-contain rounded bg-slate-900 p-1" />
                      {p.name}
                    </td>
                    <td className="py-3 px-4">{p.brand}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{p.currentPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-rose-400">{p._count?.wishlistItems || 0} saves</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.availabilityStatus} count={p.stockQuantity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
