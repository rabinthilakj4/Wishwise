import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Plus,
  Trash2,
  Share2,
  DollarSign,
  ShoppingCart,
  Clock,
  Target,
  AlertTriangle,
  Gift,
  Archive,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { wishlistService } from '../services/wishlistService';
import { HealthScoreCard } from '../components/wishlist/HealthScoreCard';
import { PriorityBadge } from '../components/wishlist/PriorityBadge';
import { CollaborativePanel } from '../components/wishlist/CollaborativePanel';
import { BudgetPlannerModal } from '../components/wishlist/BudgetPlannerModal';
import { Priority, ProductStatus } from '../types';

export const WishlistsPage: React.FC = () => {
  const { wishlists, activeWishlist, fetchWishlists, createWishlist, removeItem } = useWishlistStore();

  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  const currentWishlist = wishlists.find((w) => w.id === (selectedWishlistId || activeWishlist?.id)) || wishlists[0];

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    await createWishlist(newListName.trim(), newListDesc.trim());
    setNewListName('');
    setNewListDesc('');
    setShowCreateModal(false);
  };

  const handlePriorityChange = async (itemId: string, priority: Priority) => {
    await wishlistService.updateItem(itemId, { priority });
    fetchWishlists();
  };

  const handleTargetPriceUpdate = async (itemId: string) => {
    const target = prompt('Enter target price amount (₹):');
    if (!target) return;
    await wishlistService.updateItem(itemId, { targetPrice: parseFloat(target) });
    fetchWishlists();
  };

  const handleMoveToCart = async (itemId: string) => {
    try {
      await wishlistService.moveToCart(itemId, false);
      alert('Moved product to Cart successfully!');
      fetchWishlists();
    } catch (err: any) {
      alert(err.message || 'Failed to move to cart.');
    }
  };

  const handleTogglePlanningBuy = async (itemId: string) => {
    await wishlistService.togglePlanningToBuy(itemId);
    fetchWishlists();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600 fill-current" /> My Intelligent Wishlists
          </h1>
          <p className="text-xs text-gray-500">Organize saved items across custom lists, monitor availability, set priorities, and collaborate.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold transition shadow-xs"
          >
            <DollarSign className="w-4 h-4" /> Budget Planner
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Create New List
          </button>
        </div>
      </div>

      {/* Wishlist Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {wishlists.map((w) => (
          <button
            key={w.id}
            onClick={() => setSelectedWishlistId(w.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
              (currentWishlist?.id === w.id)
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
            }`}
          >
            <span>{w.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              (currentWishlist?.id === w.id) ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {w.items?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {currentWishlist ? (
        <div className="space-y-6">
          
          {/* Wishlist Health Score Card */}
          <HealthScoreCard healthScore={currentWishlist.healthScore} />

          {/* Collaborative Panel */}
          <CollaborativePanel wishlist={currentWishlist} onRefresh={fetchWishlists} />

          {/* Wishlist Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">
                Wishlist Items ({currentWishlist.items?.length || 0})
              </h3>
            </div>

            {currentWishlist.items?.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="font-bold text-sm text-gray-700">This wishlist is currently empty.</p>
                <p className="text-xs text-gray-400">Browse the catalogue and click the heart icon to save products.</p>
                <Link to="/products" className="inline-block px-5 py-2.5 bg-pink-600 text-white text-xs font-bold rounded-full shadow">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {currentWishlist.items?.map((item) => {
                  const p = item.product;
                  if (!p) return null;

                  const isTargetReached = item.targetPrice && p.currentPrice <= item.targetPrice;
                  const isUnavailable = p.availabilityStatus === 'OUT_OF_STOCK' || p.availabilityStatus === 'DISCONTINUED' || p.availabilityStatus === 'REMOVED';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isUnavailable ? 'border-rose-200 bg-rose-50/20' : 'border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      {/* Left: Image & Details */}
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'}
                          alt={p.name}
                          className="w-20 h-20 object-contain rounded-xl bg-gray-50 p-2 border border-gray-100 flex-shrink-0"
                        />

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <PriorityBadge priority={item.priority} />
                            {item.isStale && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                                <Clock className="w-3 h-3" /> Saved 90+ days ago
                              </span>
                            )}
                            {item.planningToBuyUserId && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                                <Gift className="w-3 h-3" /> {item.planningToBuyName || 'Someone'} Planning to Buy
                              </span>
                            )}
                          </div>

                          <Link to={`/products/${p.id}`} className="font-bold text-sm text-gray-900 hover:text-pink-600 transition block">
                            {p.name}
                          </Link>

                          {/* Selected Variant Attributes Badge Chips */}
                          {(item.selectedVariant || item.variant?.attributes) && (
                            <div className="flex flex-wrap gap-1.5 my-1">
                              {Object.entries((item.selectedVariant || item.variant?.attributes) as Record<string, string>).map(([k, v]) => (
                                <span key={k} className="inline-flex items-center text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                                  <span className="text-slate-500 mr-1">{k}:</span> {v}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Target Price Indicator */}
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-extrabold text-slate-900">₹{p.currentPrice.toLocaleString('en-IN')}</span>
                            {item.targetPrice && (
                              <span className={`font-semibold ${isTargetReached ? 'text-emerald-600 animate-pulse font-bold' : 'text-gray-500'}`}>
                                Target: ₹{item.targetPrice.toLocaleString('en-IN')} {isTargetReached ? '🎯 MET!' : ''}
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-gray-500 italic">"{item.notes}"</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Item Actions */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                        {/* Priority Selector */}
                        <select
                          value={item.priority}
                          onChange={(e) => handlePriorityChange(item.id, e.target.value as Priority)}
                          className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                        >
                          <option value="MUST_BUY">🔴 Must Buy</option>
                          <option value="HIGH">🟠 High</option>
                          <option value="MEDIUM">🟡 Medium</option>
                          <option value="LOW">🟢 Low</option>
                        </select>

                        <button
                          onClick={() => handleTargetPriceUpdate(item.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold"
                          title="Set Target Price"
                        >
                          <Target className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleTogglePlanningBuy(item.id)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition ${
                            item.planningToBuyUserId
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'text-purple-600 hover:bg-purple-50 border-purple-200'
                          }`}
                          title="Flag Planning to Buy (Gift Prevention)"
                        >
                          <Gift className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleMoveToCart(item.id)}
                          disabled={isUnavailable}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-pink-600 disabled:bg-gray-200 text-white rounded-xl text-xs font-bold transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                        </button>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      ) : null}

      {/* Create Wishlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h4 className="font-bold text-base text-gray-900 mb-4">Create Personalized Wishlist</h4>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Wishlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaming Setup 🎮, Birthday Wishlist 🎁"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Notes about this list..."
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Planner Modal */}
      <BudgetPlannerModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        wishlistId={currentWishlist?.id}
      />

    </div>
  );
};
