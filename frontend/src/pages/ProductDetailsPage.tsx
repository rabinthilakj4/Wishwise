import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Scale, Tag, ArrowLeft, AlertCircle, Check, Layers } from 'lucide-react';
import { productService } from '../services/productService';
import { Product, ProductVariant } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { ProductGallery } from '../components/common/ProductGallery';
import { PriceHistoryChart } from '../components/wishlist/PriceHistoryChart';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Selected Variant State
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);

  const { addItemToWishlist, isProductWishlisted, comparedProductIds, toggleCompareProduct } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    productService.getProductById(id)
      .then((res: any) => {
        const prodData: Product = res.data;
        setProduct(prodData);
        if (prodData && prodData.variants && prodData.variants.length > 0) {
          setSelectedVariantId(prodData.variants[0].id);
        }
        if (prodData) {
          productService.getSimilarProducts(prodData.id).then((simRes: any) => {
            setSimilarItems(simRes.data || []);
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const activeVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  }, [product, selectedVariantId]);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-xs text-gray-500 font-medium">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-base font-bold text-gray-800">Product not found.</p>
        <Link to="/products" className="px-4 py-2 bg-pink-600 text-white rounded-full text-xs font-bold shadow">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isWishlisted = isProductWishlisted(product.id);
  const isCompared = comparedProductIds.includes(product.id);

  const activePrice = activeVariant ? activeVariant.price : product.currentPrice;
  const activeMrp = activeVariant ? activeVariant.mrp : (product.mrp || product.originalPrice);
  const discountPercent = activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;
  const activeStock = activeVariant ? activeVariant.stockQuantity : product.stockQuantity;
  const isUnavailable = (activeStock <= 0) || product.availabilityStatus === 'OUT_OF_STOCK' || product.availabilityStatus === 'DISCONTINUED' || product.availabilityStatus === 'REMOVED';

  // Gallery Images selection
  const galleryImages = (activeVariant?.images && activeVariant.images.length > 0)
    ? activeVariant.images
    : product.images;

  const handleSaveTargetPrice = async () => {
    if (!targetPriceInput) return;
    const target = parseFloat(targetPriceInput);
    await addItemToWishlist(
      product.id,
      'HIGH',
      target,
      activeVariant?.id,
      activeVariant?.attributes
    );
    alert(`Target price alert ₹${target.toLocaleString('en-IN')} set for ${product.name}!`);
    setShowTargetModal(false);
  };

  const handleAddToWishlist = () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      useCartStore.getState().setShowLoginModal(true);
      return;
    }
    addItemToWishlist(
      product.id,
      'MEDIUM',
      undefined,
      activeVariant?.id,
      activeVariant?.attributes
    );
  };

  const handleAddToCart = () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      useCartStore.getState().setPendingCartAction({
        productId: product.id,
        quantity: 1,
        variantId: activeVariant?.id,
        selectedVariant: activeVariant?.attributes as any,
      });
      useCartStore.getState().setShowLoginModal(true);
      return;
    }
    addToCart(
      product.id,
      1,
      activeVariant?.id,
      activeVariant?.attributes
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-pink-600">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        {product.category && (
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>{product.category.name}</span>
            {product.subcategory && (
              <>
                <span>/</span>
                <span className="font-semibold text-slate-700">{product.subcategory.name}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        
        {/* Left: Product Multi-Image Gallery */}
        <div>
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            selectedVariantName={activeVariant?.name}
          />
        </div>

        {/* Right: Info, Variant Switcher & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1">
                {product.brand} {product.modelNumber ? `(${product.modelNumber})` : ''}
              </span>
              <StatusBadge status={product.availabilityStatus} count={activeStock} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
              {product.name}
            </h1>

            {/* Subcategory & Tags */}
            {product.subcategory && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium mb-3">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                {product.subcategory.name}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs text-amber-500 mb-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-gray-900 ml-1">{product.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{product.reviewCount} customer reviews</span>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {activeMrp > activePrice && (
                  <span className="text-base text-gray-400 line-through font-medium">
                    MRP ₹{activeMrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Inclusive of all taxes. Verified manufacturer pricing.</p>
            </div>

            {/* Product Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 space-y-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Product Variant:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        type="button"
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />}
                          <span className="truncate">{v.name}</span>
                        </div>
                        <span className={`font-mono text-[11px] ml-2 ${isSelected ? 'text-pink-300' : 'text-slate-500'}`}>
                          ₹{v.price.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Description */}
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isUnavailable}
                  className="flex-1 py-3 px-6 bg-slate-900 hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className={`py-3 px-6 rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
                    isWishlisted
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? '❤️ Wishlisted' : 'Add to Wishlist'}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setShowTargetModal(true)}
                  className="flex-1 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-4 h-4" /> Set Target Price Alert
                </button>

                <button
                  onClick={() => toggleCompareProduct(product.id)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    isCompared
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Scale className="w-4 h-4" /> {isCompared ? 'Comparing' : 'Compare Specs'}
                </button>
              </div>
            </div>

          </div>

          {/* Unavailable Notice */}
          {isUnavailable && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertCircle className="w-4 h-4" /> Selected option is currently out of stock.
              </p>
              <p className="text-gray-600">You can save it to your wishlist to receive a back-in-stock alert as soon as inventory updates.</p>
            </div>
          )}

        </div>

      </div>

      {/* Price History Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900">Historical Price Tracking</h3>
            <p className="text-xs text-gray-500">Real recorded database price changes over time.</p>
          </div>
          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
            Current: ₹{activePrice.toLocaleString('en-IN')}
          </span>
        </div>

        <PriceHistoryChart history={product.priceHistory || []} currentPrice={activePrice} />
      </div>

      {/* Specifications Table */}
      {product.specifications && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-900">Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {Object.entries(product.specifications as Record<string, any>).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-500">{key}</span>
                <span className="font-bold text-gray-900">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Alternative Recommendations */}
      {similarItems.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 p-6 rounded-3xl border border-purple-100 space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Smart Recommendations</span>
            <h3 className="text-xl font-extrabold text-gray-900">Similar Alternatives</h3>
            <p className="text-xs text-gray-600">Explainable recommendations matching category, price point, and key specs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarItems.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm space-y-3">
                <img src={item.product.images?.[0]?.url} alt={item.product.name} className="h-32 w-full object-contain" />
                <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{item.product.name}</h4>
                <p className="text-[10px] text-purple-700 font-semibold bg-purple-50 p-1.5 rounded-lg">{item.recommendationReason}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-extrabold text-sm text-gray-900">₹{item.product.currentPrice.toLocaleString('en-IN')}</span>
                  <Link to={`/products/${item.product.id}`} className="text-xs font-bold text-pink-600 hover:underline">
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Price Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-base text-gray-900">Set Target Price Alert</h4>
            <p className="text-xs text-gray-500">We will send an in-app alert when current price drops to or below your target.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Price (Current: ₹{activePrice})</label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={targetPriceInput}
                onChange={(e) => setTargetPriceInput(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowTargetModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveTargetPrice} className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow">
                Save Target Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
