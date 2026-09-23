import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Target, Clock } from 'lucide-react';
import { HealthScore } from '../../types';

interface HealthScoreCardProps {
  healthScore?: HealthScore;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthScore }) => {
  if (!healthScore) return null;

  const { score, status, breakdown, suggestions } = healthScore;

  let progressColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (score < 50) {
    progressColor = 'bg-rose-500';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (score < 75) {
    progressColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden mb-8">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Score & Progress */}
        <div className="space-y-3 flex-1 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pink-400" />
              <h3 className="font-bold text-base tracking-tight text-white">Wishlist Health Score</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeBg}`}>
              {status} ({score}%)
            </span>
          </div>

          {/* Health Bar */}
          <div className="w-full bg-slate-700/60 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-600">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-300">
            Dynamically evaluated across product stock, discounts, target prices, and stale activity.
          </p>
        </div>

        {/* Middle: Metrics Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {breakdown.availableCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Available</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> {breakdown.lowStockCount + breakdown.outOfStockCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Stock Alert</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 text-pink-400 text-xs font-bold">
              <Target className="w-3.5 h-3.5" /> {breakdown.targetPriceReachedCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Target Met</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" /> {breakdown.staleCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Stale Items</span>
          </div>
        </div>

      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/60 text-xs space-y-1">
          {suggestions.map((sug, idx) => (
            <p key={idx} className="text-gray-300 flex items-center gap-2">
              <span className="text-pink-400">💡</span> {sug}
            </p>
          ))}
        </div>
      )}

    </div>
  );
};
