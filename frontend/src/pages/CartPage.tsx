import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, updateQuantity, removeFromCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const p = item.variant ? item.variant.price : (item.priceSnapshot || item.product.currentPrice);
    return sum + (p * item.quantity);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500">Move items from your wishlist or browse products to add to cart.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-pink-600 text-white rounded-full text-xs font-bold shadow">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-indigo-600" /> Shopping Cart ({items.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemPrice = item.variant ? item.variant.price : (item.priceSnapshot || item.product.currentPrice);
            const variantAttrs = item.selectedVariant || item.variant?.attributes;

            return (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <img
                  src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'}
                  alt={item.product.name}
                  className="w-20 h-20 object-contain rounded-xl bg-gray-50 p-2 border border-gray-100"
                />

                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">{item.product.brand}</span>
                  <Link to={`/products/${item.product.id}`} className="font-bold text-sm text-gray-900 hover:text-pink-600 block line-clamp-1">
                    {item.product.name}
                  </Link>

                  {/* Selected Variant Attributes Badge Chips */}
                  {variantAttrs && (
                    <div className="flex flex-wrap gap-1 my-0.5">
                      {Object.entries(variantAttrs as Record<string, string>).map(([k, v]) => (
                        <span key={k} className="inline-flex items-center text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                          <span className="text-slate-400 mr-1">{k}:</span> {v}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="font-extrabold text-sm text-slate-900 block">
                    ₹{itemPrice.toLocaleString('en-IN')}
                  </span>
                </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-white rounded-lg text-gray-600 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-white rounded-lg text-gray-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">Order Summary</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes</span>
              <span className="font-bold text-gray-900">Included</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-black text-slate-900">
              <span>Total Amount</span>
              <span className="text-pink-600">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Checkout & SSL Encryption
          </div>
        </div>

      </div>

    </div>
  );
};
