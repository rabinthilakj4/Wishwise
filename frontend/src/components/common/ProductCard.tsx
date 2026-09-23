import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Scale } from 'lucide-react';
import { Product } from '../../types';
import { StatusBadge } from './Badge';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItemToWishlist, isProductWishlisted, comparedProductIds, toggleCompareProduct } = useWishlistStore();
  const { addToCart } = useCartStore();

  const isWishlisted = isProductWishlisted(product.id);
  const isCompared = comparedProductIds.includes(product.id);
  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800';

  const handleAddToCart = () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      useCartStore.getState().setPendingCartAction({ productId: product.id, quantity: 1 });
      useCartStore.getState().setShowLoginModal(true);
      return;
    }
    addToCart(product.id);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-pink-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow z-10">
            -{product.discount.toFixed(0)}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => {
            const { user } = useAuthStore.getState();
            if (!user) {
              useCartStore.getState().setShowLoginModal(true);
              return;
            }
            addItemToWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition z-10 ${
            isWishlisted
              ? 'bg-pink-600 text-white hover:bg-pink-700'
              : 'bg-white/90 backdrop-blur text-gray-600 hover:text-pink-600 hover:bg-white'
          }`}
          title={isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <Link to={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={primaryImage}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold text-pink-600 uppercase tracking-wider text-[10px]">
              {product.brand} {product.subcategory ? `• ${product.subcategory.name}` : ''}
            </span>
            <StatusBadge status={product.availabilityStatus} count={product.stockQuantity} />
          </div>

          <Link to={`/products/${product.id}`} className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-pink-600 transition mb-2">
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-amber-500 mb-3">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-gray-900 text-xs">{product.rating}</span>
            <span className="text-gray-400 text-[11px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-extrabold text-slate-900">
              ₹{product.currentPrice.toLocaleString('en-IN')}
            </span>
            {(product.mrp && product.mrp > product.currentPrice) ? (
              <span className="text-xs text-gray-400 line-through">
                MRP ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            ) : product.originalPrice > product.currentPrice ? (
              <span className="text-xs text-gray-400 line-through">
                MRP ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={product.availabilityStatus === 'OUT_OF_STOCK' || product.availabilityStatus === 'DISCONTINUED'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-xs font-semibold transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>

            <button
              onClick={() => toggleCompareProduct(product.id)}
              className={`p-2 rounded-xl border transition ${
                isCompared
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-600 hover:text-indigo-600'
              }`}
              title="Compare"
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
