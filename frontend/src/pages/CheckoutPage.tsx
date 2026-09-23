import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { cartService } from '../services/cartService';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();

  const [address, setAddress] = useState('123 Tech Park Avenue, Suite 400, Tech City');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isLoading, setIsLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.product.currentPrice * item.quantity), 0) || 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      const res: any = await cartService.checkout(address, paymentMethod);
      setCompletedOrder(res.data);
      await fetchCart();
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Order Confirmed!</h2>
          <p className="text-xs text-gray-500">Order Number: <strong className="text-gray-900">{completedOrder.orderNumber}</strong></p>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2 text-left border border-gray-100">
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total Paid</span>
            <span className="text-pink-600">₹{completedOrder.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-gray-500">Shipping Address: {completedOrder.shippingAddress}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow transition"
          >
            View Orders Timeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Form */}
        <form onSubmit={handlePlaceOrder} className="md:col-span-2 space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">Shipping Address</h3>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'CARD', label: 'Credit / Debit Card' },
                { id: 'UPI', label: 'UPI / Instant Pay' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                    paymentMethod === m.id
                      ? 'bg-pink-50 text-pink-700 border-pink-500 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white rounded-2xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? 'Processing Order...' : `Complete Order • ₹${subtotal.toLocaleString('en-IN')}`}
          </button>
        </form>

        {/* Right Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Summary</h3>
          <div className="space-y-2 text-xs">
            {cart?.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600 truncate max-w-[150px]">{item.product.name}</span>
                <span className="font-bold">x{item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900">
              <span>Total</span>
              <span className="text-pink-600">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
