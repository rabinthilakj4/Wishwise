import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, TrendingUp, ShieldCheck, ArrowRight, Tag } from 'lucide-react';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { CompactCategoryBar } from '../components/home/CompactCategoryBar';
import { NewlyLaunchedBanner } from '../components/home/NewlyLaunchedBanner';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, dealRes]: any[] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ limit: 8, sort: 'popular' }),
          productService.getProducts({ limit: 4, sort: 'discount' }),
        ]);
        setCategories(catRes.data || []);
        setFeaturedProducts(prodRes.data || []);
        setDealProducts(dealRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* 1. Compact Shop by Category (Placed Directly Below Search Bar / Header) */}
      <CompactCategoryBar categories={categories} />

      {/* 2. Existing Main Hero Banner — DO NOT TOUCH */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 border border-pink-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-pink-400" /> AI-Powered Wishlist & Price Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Track, Compare & Prioritize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400">Favourites</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            WishWise goes beyond basic wishlist saving. Set target prices, analyze price histories, calculate wishlist health, plan budgets, and receive smart AI purchase recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold text-sm shadow-xl hover:shadow-pink-600/30 transition flex items-center gap-2"
            >
              Explore Catalogue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/assistant"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-bold text-sm backdrop-blur transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> Try AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Newly Launched Products Showcase Carousel (Placed Directly Below Main Banner) */}
      <NewlyLaunchedBanner />

      {/* 4. Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Dynamic Health Score', desc: 'Real-time wishlist score evaluating stock, discounts, and stale items.', icon: ShieldCheck, color: 'text-emerald-500' },
          { title: 'Target Price Alerts', desc: 'Get notified automatically when current prices reach your target.', icon: Tag, color: 'text-pink-500' },
          { title: 'Budget Planner', desc: 'Optimize purchase priority based on your monthly budget limits.', icon: TrendingUp, color: 'text-indigo-500' },
          { title: 'Collaborative Wishlists', desc: 'Invite friends, suggest items, and prevent duplicate gifts.', icon: Heart, color: 'text-purple-500' },
        ].map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <Icon className={`w-8 h-8 ${f.color} mb-3`} />
              <h3 className="font-bold text-sm text-gray-900 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* 5. Trending Wishlisted Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Trending Wishlisted Products</h2>
            <p className="text-xs text-gray-500">Most saved products by customers this week.</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-pink-600 hover:underline">
            Browse Catalogue &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Biggest Deals Section */}
      <section className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-3xl p-8 border border-pink-100/60 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Top Deals</span>
            <h2 className="text-2xl font-black text-gray-900">Highest Discounted Items</h2>
          </div>
          <Link to="/products?sort=discount" className="text-xs font-bold text-pink-600 hover:underline">
            View All Deals &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
};
