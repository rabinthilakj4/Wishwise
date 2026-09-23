import React, { useEffect, useState } from 'react';
import { ShoppingCart, PackageCheck, Clock } from 'lucide-react';
import { cartService } from '../services/cartService';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cartService.getOrders()
      .then((res: any) => setOrders(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
        <PackageCheck className="w-6 h-6 text-indigo-600" /> Order History
      </h1>

      {isLoading ? (
        <p className="text-xs text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs text-gray-500">
          No past orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
                <div>
                  <span className="font-bold text-gray-900">{o.orderNumber}</span>
                  <p className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  {o.status}
                </span>
              </div>

              <div className="space-y-2">
                {o.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-800">{item.product?.name} (x{item.quantity})</span>
                    <span className="font-bold text-gray-900">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-pink-600">₹{o.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
