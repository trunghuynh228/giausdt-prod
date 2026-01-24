'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HistoricalRate, TimeRange } from '@/types/rates';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceChartProps {
  data: HistoricalRate[];
  isLoading: boolean;
  className?: string;
}

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '7D', value: '7D' },
  { label: '1M', value: '1M' },
];

export function PriceChart({ data, isLoading, className }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const [showUserBuy, setShowUserBuy] = useState(true);
  const [showUserSell, setShowUserSell] = useState(true);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    // Set to start of today for consistent comparison
    now.setHours(0, 0, 0, 0);
    let daysBack: number;

    switch (selectedRange) {
      case '1D':
        daysBack = 1;
        break;
      case '7D':
        daysBack = 6; // 6 days back + today = 7 days total
        break;
      case '1M':
        daysBack = 29; // 29 days back + today = 30 days total
        break;
      default:
        daysBack = 6;
    }

    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate;
    });
  }, [data, selectedRange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return 'Hôm nay';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded bg-foreground px-3 py-2 text-xs font-bold text-white shadow-xl min-w-[100px]">
          {payload.map((entry: any, index: number) => (
            <div key={index} className={`flex justify-between gap-3 ${index > 0 ? 'border-t border-white/20 pt-1 mt-1' : ''}`}>
              <span className={entry.name === 'buy' ? 'text-emerald-300' : 'text-red-300'}>
                {entry.name === 'buy' ? 'Mua' : 'Bán'}
              </span>
              <span>{formatVND(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-foreground">Lịch sử giá</h3>
          <p className="text-sm text-muted-foreground">Giá trung bình USDT/VND mỗi ngày</p>
        </div>
        <div className="flex items-center gap-6 self-start sm:self-auto">
          {/* Legend */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary"></span>
            <span className="text-sm font-bold text-foreground">Mua</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive"></span>
            <span className="text-sm font-bold text-foreground">Bán</span>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-2">
            {timeRanges.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setSelectedRange(value)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${selectedRange === value
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-gray-100'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart with gradient background */}
      <div className="relative h-96 w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 20, right: 10, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientBuy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientSell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                {/* Background gradient for chart area only */}
                <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Background rectangle for chart area */}
              <rect x="55" y="0" width="100%" height="100%" fill="url(#chartBg)" rx="8" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                tickFormatter={(v) => formatVND(v)}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 50', 'dataMax + 50']}
                width={50}
                tickCount={6}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }} />
              {showUserBuy && (
                <Area
                  type="linear"
                  dataKey="buy"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#gradientBuy)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', className: 'animate-pulse-dot' }}
                  name="buy"
                />
              )}
              {showUserSell && (
                <Area
                  type="linear"
                  dataKey="sell"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="url(#gradientSell)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                  name="sell"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Không có dữ liệu
          </div>
        )}
      </div>

    </div>
  );
}