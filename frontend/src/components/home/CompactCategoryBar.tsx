import React from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Smartphone,
  Shirt,
  Sparkles,
  Footprints,
  Glasses,
  Gem,
  Heart,
  Sofa,
  Utensils,
  Tv,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Baby,
  Car,
  Dog,
  Luggage,
  Briefcase,
  HeartPulse,
  Layers
} from 'lucide-react';
import { Category } from '../../types';

interface CompactCategoryBarProps {
  categories: Category[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'electronics': Monitor,
  'mobile-accessories': Smartphone,
  'mens-clothing': Shirt,
  'womens-clothing': Sparkles,
  'footwear': Footprints,
  'fashion-accessories': Glasses,
  'jewellery': Gem,
  'beauty-personal-care': Heart,
  'home-furniture': Sofa,
  'kitchen-appliances-utensils': Utensils,
  'home-appliances': Tv,
  'sports-fitness': Dumbbell,
  'books-stationery': BookOpen,
  'toys-games': Gamepad2,
  'baby-products': Baby,
  'automotive': Car,
  'pet-supplies': Dog,
  'travel-luggage': Luggage,
  'office-computer-accessories': Briefcase,
  'health-wellness': HeartPulse,
};

export const CompactCategoryBar: React.FC<CompactCategoryBarProps> = ({ categories }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-xs p-3 space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-gray-800 tracking-tight flex items-center gap-1.5 uppercase">
          <Layers className="w-3.5 h-3.5 text-pink-600" /> Shop by Category
        </h3>
        <Link to="/products" className="text-[11px] font-semibold text-pink-600 hover:underline">
          View All Categories &rarr;
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 px-0.5 scrollbar-thin scrollbar-thumb-gray-200">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.slug] || Layers;
          const productCount = cat._count?.products ?? 0;

          return (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center flex-shrink-0 w-20 sm:w-22 p-2 rounded-xl border border-transparent hover:border-pink-100 hover:bg-pink-50/60 transition text-center space-y-1.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-pink-600 text-gray-700 group-hover:text-white flex items-center justify-center shadow-xs transition duration-200">
                <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <div className="w-full overflow-hidden">
                <p className="text-[11px] font-bold text-gray-800 group-hover:text-pink-600 truncate transition-colors leading-tight">
                  {cat.name}
                </p>
                <span className="text-[9px] font-medium text-gray-400 block mt-0.5">
                  {productCount} items
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
