import React, { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, durationMs = 3000 }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 500);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('wishwise_splash_seen', 'true');
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [durationMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-6">
        {/* Animated WishWise Logo Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-pink-600/40 animate-bounce">
            <Heart className="w-10 h-10 fill-current" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-spin">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Wish<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400">Wise</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-300 tracking-wide">
            Intelligent Wishlist & Shopping
          </p>
        </div>

        {/* Progress Bar Loader */}
        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all ease-out"
            style={{
              width: isFadingOut ? '100%' : '85%',
              transitionDuration: `${durationMs - 200}ms`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
