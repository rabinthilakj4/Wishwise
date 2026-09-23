import React from 'react';
import { ProductStatus } from '../../types';

interface BadgeProps {
  status: ProductStatus | string;
  count?: number;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, count }) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
        </span>
      );
    case 'LOW_STOCK':
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> Only {count ?? 2} left
        </span>
      );
    case 'OUT_OF_STOCK':
      return (
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Out of Stock
        </span>
      );
    case 'DISCONTINUED':
      return (
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Discontinued
        </span>
      );
    case 'REMOVED':
      return (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          ⚠️ Catalogue Removed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          {status}
        </span>
      );
  }
};
