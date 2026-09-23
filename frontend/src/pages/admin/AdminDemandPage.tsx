import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldAlert, Package, ShoppingCart, Heart } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DemandReportItem } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatusBadge } from '../../components/common/Badge';

export const AdminDemandPage: React.FC = () => {
  const [demandReport, setDemandReport] = useState<DemandReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getDemandReport()
      .then((res: any) => setDemandReport(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-rose-500" /> Wishlist Demand Intelligence & Restock Matrix
          </h1>
          <p className="text-xs text-gray-400">Identify products with high wishlist demand and low stock to optimize inventory restock decisions.</p>
        </div>

        {/* Critical Risk Banner */}
        {demandReport.some(d => d.riskFlag) && (
          <div className="bg-rose-950/80 border border-rose-800/80 p-4 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
              <div>
                <h4 className="font-bold text-sm text-white">Critical Restock Alert Triggered</h4>
                <p className="text-rose-300">Certain products have high wishlist saves but stock is near depletion.</p>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Table */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 uppercase text-[10px]">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Wishlist Saves</th>
                <th className="py-3 px-4">Saves (30d)</th>
                <th className="py-3 px-4">Cart Adds</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Demand Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {demandReport.map((item) => (
                <tr key={item.productId} className={`hover:bg-slate-700/30 transition ${item.riskFlag ? 'bg-rose-950/30 font-semibold' : ''}`}>
                  <td className="py-3 px-4 text-white font-bold">{item.name}</td>
                  <td className="py-3 px-4">{item.categoryName}</td>
                  <td className="py-3 px-4 font-bold text-pink-400">{item.wishlistSaves} saves</td>
                  <td className="py-3 px-4 font-bold text-purple-400">+{item.recentSaves30d}</td>
                  <td className="py-3 px-4 font-bold text-indigo-400">{item.cartAdditions}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{item.stockQuantity}</td>
                  <td className="py-3 px-4">
                    {item.demandStatus === 'CRITICAL_RESTOCK' ? (
                      <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        🚨 Critical Restock
                      </span>
                    ) : item.demandStatus === 'HIGH_DEMAND' ? (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        🔥 High Demand
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
};
