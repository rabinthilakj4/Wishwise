import React, { useState, useEffect } from 'react';
import { X, DollarSign, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { BudgetPlan } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { useCartStore } from '../../store/useCartStore';

interface BudgetPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId?: string;
}

export const BudgetPlannerModal: React.FC<BudgetPlannerModalProps> = ({ isOpen, onClose, wishlistId }) => {
  const [budgetInput, setBudgetInput] = useState<number>(25000);
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCartStore();

  const fetchPlan = async (amount: number) => {
    setIsLoading(true);
    try {
      const res: any = await wishlistService.getBudgetPlan(amount, wishlistId);
      setPlan(res.data);
    } catch {
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlan(budgetInput);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSuggestedToCart = async () => {
    if (!plan) return;
    for (const item of plan.suggestedItems) {
      await addToCart(item.productId, 1);
    }
    alert(`Added ${plan.suggestedItems.length} budget-optimized items to your Cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Wishlist Budget Planner</h3>
              <p className="text-xs text-gray-500">Optimize purchase order within your monthly budget limits.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Budget Input Slider */}
        <div className="my-6 bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Set Monthly Budget</span>
            <span className="text-base font-extrabold text-pink-600">₹{budgetInput.toLocaleString('en-IN')}</span>
          </div>

          <input
            type="range"
            min="2000"
            max="300000"
            step="1000"
            value={budgetInput}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBudgetInput(val);
              fetchPlan(val);
            }}
            className="w-full accent-pink-600 cursor-pointer"
          />

          <div className="flex gap-2 text-xs font-medium pt-1">
            {[10000, 25000, 50000, 100000, 200000].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setBudgetInput(amt);
                  fetchPlan(amt);
                }}
                className={`px-3 py-1 rounded-full border text-[11px] transition ${
                  budgetInput === amt
                    ? 'bg-pink-600 text-white border-pink-600 font-bold'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-pink-500'
                }`}
              >
                ₹{(amt / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Plan Results */}
        {isLoading ? (
          <p className="text-center py-8 text-xs text-gray-500">Calculating purchase plan...</p>
        ) : plan ? (
          <div className="space-y-6">
            
            {/* Summary Banner */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              plan.budgetDifference >= 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <p className="font-semibold text-sm mb-1">{plan.summaryMessage}</p>
              <div className="flex items-center gap-4 text-[11px] mt-2 font-medium">
                <span>Wishlist Total: <strong>₹{plan.totalWishlistValue.toLocaleString('en-IN')}</strong></span>
                <span>Affordable Items: <strong>{plan.affordableItemsCount}</strong></span>
              </div>
            </div>

            {/* Suggested Purchase List */}
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Purchases ({plan.suggestedItems.length})
              </h4>

              <div className="space-y-2.5">
                {plan.suggestedItems.map((item, idx) => (
                  <div key={item.wishlistItemId} className="flex items-center justify-between p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-gray-900">{item.name}</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <p className="text-[11px] text-gray-500 ml-7">{item.recommendationReason}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-emerald-700">₹{item.currentPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unaffordable Items */}
            {plan.unaffordableItems.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Deferred to Next Month ({plan.unaffordableItems.length})
                </h4>

                <div className="space-y-2">
                  {plan.unaffordableItems.map((item) => (
                    <div key={item.wishlistItemId} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200/60 rounded-xl text-xs opacity-75">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <span className="font-bold text-gray-700">₹{item.currentPrice.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
                Close
              </button>
              <button
                onClick={handleAddSuggestedToCart}
                disabled={plan.suggestedItems.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <ShoppingCart className="w-4 h-4" /> Move Affordable Items to Cart
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
