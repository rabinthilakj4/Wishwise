import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span>Wish<span className="text-pink-500">Wise</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Intelligent Wishlist & Favourites Management System. Track prices, monitor availability, compare products, and plan budgets with AI decision support.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Core Platform</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="/products" className="hover:text-pink-400 transition">Product Catalogue</a></li>
              <li><a href="/wishlists" className="hover:text-pink-400 transition">Multiple Wishlists</a></li>
              <li><a href="/compare" className="hover:text-pink-400 transition">Product Comparison</a></li>
              <li><a href="/assistant" className="hover:text-pink-400 transition">AI Wishlist Assistant</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Intelligence Features</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><span className="text-pink-400 font-medium">Wishlist Health Score</span></li>
              <li><span>Target Price Monitoring</span></li>
              <li><span>Collaborative Wishlists</span></li>
              <li><span>Duplicate Gift Prevention</span></li>
              <li><span>Stale Item Detection</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Admin & Roles</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="/login" className="hover:text-pink-400 transition">Admin Dashboard</a></li>
              <li><span>Demand Intelligence</span></li>
              <li><span>Most Wishlisted Products</span></li>
              <li><span>Audit Logs</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 WishWise. Full-Stack E-Commerce Decision Support Platform.</p>
          <div className="flex items-center gap-1 text-purple-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI & PostgreSQL Intelligence
          </div>
        </div>
      </div>
    </footer>
  );
};
