import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types';

export const NewlyLaunchedBanner: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchNewlyLaunched = async () => {
      try {
        const res: any = await productService.getNewlyLaunchedProducts();
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load newly launched products', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewlyLaunched();
  }, []);

  // Smooth Auto-scroll continuous carousel effect
  useEffect(() => {
    if (isPaused || products.length === 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScrollLeft - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, products]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-medium">
        Loading Newly Launched Products...
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800 space-y-6">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-pink-500/15 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> SEPTEMBER 2026 FLAGSHIPS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Newly Launched
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Discover the latest products, just launched.
          </p>
        </div>

        {/* Carousel Nav Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleScrollLeft}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition shadow-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleScrollRight}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition shadow-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Continuous Carousel Container */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory relative z-10"
      >
        {products.map((p) => {
          const primaryImage = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || '';
          const launchOfferLabel = p.launchOffer || 'NEWLY LAUNCHED';

          return (
            <div
              key={p.id}
              className="flex-shrink-0 w-64 sm:w-72 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-pink-500/40 transition duration-300 snap-start group"
            >
              <div className="space-y-3">
                {/* Top Badge & Brand */}
                <div className="flex items-center justify-between">
                  <span className="bg-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    NEW
                  </span>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-pink-400 transition">
                    {p.brand}
                  </span>
                </div>

                {/* Product Image Focus */}
                <div
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="w-full h-44 rounded-xl bg-slate-950/60 p-3 flex items-center justify-center overflow-hidden cursor-pointer group-hover:bg-slate-950/80 transition"
                >
                  <img
                    src={primaryImage}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Offer Highlight Tag */}
                <div className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold px-2.5 py-1 rounded-md">
                  🏷️ {launchOfferLabel}
                </div>

                {/* Product Title */}
                <h3
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="font-bold text-sm text-white hover:text-pink-400 transition cursor-pointer line-clamp-1"
                >
                  {p.name}
                </h3>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-3">
                <div>
                  <p className="text-base font-black text-white">
                    ₹{p.currentPrice.toLocaleString('en-IN')}
                  </p>
                  {(p.mrp && p.mrp > p.currentPrice) ? (
                    <p className="text-[11px] text-gray-400 line-through">
                      ₹{p.mrp.toLocaleString('en-IN')}
                    </p>
                  ) : null}
                </div>

                <Link
                  to={`/products/${p.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-3.5 py-2 rounded-xl shadow-md transition"
                >
                  View Product <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
