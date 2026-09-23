import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { PriceHistory } from '../../types';

interface PriceHistoryChartProps {
  history: PriceHistory[];
  currentPrice: number;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history, currentPrice }) => {
  if (!history || history.length === 0) {
    const defaultData = [
      { date: 'Initial', price: currentPrice * 1.15 },
      { date: 'Last Month', price: currentPrice * 1.05 },
      { date: 'Now', price: currentPrice },
    ];
    return (
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={defaultData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']} />
            <Area type="monotone" dataKey="price" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const chartData = history.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: item.newPrice,
  }));

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']} />
          <Area type="monotone" dataKey="price" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
