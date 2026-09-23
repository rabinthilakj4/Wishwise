import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShoppingCart, Trash2, ArrowLeft, Check } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { productService } from '../services/productService';
import { Product } from '../types';
import { StatusBadge } from '../components/common/Badge';

export const ComparePage: React.FC = () => {
  const { comparedProductIds, toggleCompareProduct, clearCompare } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (comparedProductIds.length === 0) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    productService.compareProducts(comparedProductIds)
      .then((res: any) => setProducts(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [comparedProductIds]);

  if (comparedProductIds.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <Scale className="w-12 h-12 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">No Products Selected for Comparison</h2>
        <p className="text-xs text-gray-500">
          Browse products and click the comparison icon (<Scale className="w-3.5 h-3.5 inline text-indigo-600" />) on any product card to compare specs side-by-side.
        </p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow">
          Explore Products
        </Link>
      </div>
    );
  }

  // Collect all unique specification keys across selected products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => (p.specifications ? Object.keys(p.specifications) : [])))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-indigo-600" /> Product Comparison Matrix
            </h1>
            <p className="text-xs text-gray-500">Side-by-side technical specs, pricing, and availability evaluation.</p>
          </div>
        </div>

        <button
          onClick={clearCompare}
          className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 transition"
        >
          Clear Matrix
        </button>
      </div>

      {/* Responsive Comparison Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          
          {/* Header Row: Products */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="p-4 text-xs font-bold text-gray-400 w-48">Feature</th>
              {products.map((p) => (
                <th key={p.id} className="p-4 w-64">
                  <div className="space-y-2 relative">
                    <button
                      onClick={() => toggleCompareProduct(p.id)}
                      className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-rose-600 rounded-full"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <img src={p.images?.[0]?.url} alt={p.name} className="h-28 mx-auto object-contain" />
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">{p.brand}</span>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{p.name}</h4>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            
            {/* Price */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Price</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <span className="font-black text-sm text-slate-900">₹{p.currentPrice.toLocaleString('en-IN')}</span>
                  {p.originalPrice > p.currentPrice && (
                    <span className="text-[11px] text-gray-400 line-through ml-2">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Rating</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <span className="font-bold text-amber-500">⭐ {p.rating}</span> ({p.reviewCount} reviews)
                </td>
              ))}
            </tr>

            {/* Availability */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Availability</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <StatusBadge status={p.availabilityStatus} count={p.stockQuantity} />
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Category</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-medium text-gray-800">
                  {p.category?.name || 'Electronics'}
                </td>
              ))}
            </tr>

            {/* Dynamic Specifications */}
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="p-4 font-bold text-gray-700 bg-gray-50/30 capitalize">{key}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-gray-800">
                    {p.specifications?.[key] ? String(p.specifications[key]) : '—'}
                  </td>
                ))}
              </tr>
            ))}

            {/* Add to Cart Actions */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Action</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={p.availabilityStatus === 'OUT_OF_STOCK' || p.availabilityStatus === 'DISCONTINUED'}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-indigo-600 disabled:bg-gray-200 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </td>
              ))}
            </tr>

          </tbody>

        </table>
      </div>

    </div>
  );
};
