'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { ExchangeRate } from '@/types/rates';
import { Skeleton } from '@/components/ui/skeleton';
import NumberTicker from '@/components/ui/number-ticker';
import { useEffect, useState } from 'react';

interface CurrentRateCardProps {
  rate?: ExchangeRate;
  change7DBuy: number;
  change7DSell: number;
  isLoading: boolean;
}

export function CurrentRateCard({ rate, change7DBuy, change7DSell, isLoading }: CurrentRateCardProps) {
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent immediate flash if data loads instantly, 
    // or just to ensure the skeleton is seen for a moment before animation starts.
    // Given the request "display as skeleton loading then flipping", a small delay feels appropriate.
    const timer = setTimeout(() => {
      setIsAnimationReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const isBuyPositive = change7DBuy >= 0;
  const isSellPositive = change7DSell >= 0;
  const buyChangePercent = Math.abs(change7DBuy).toFixed(2);
  const sellChangePercent = Math.abs(change7DSell).toFixed(2);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-white p-6 border border-border shadow-sm">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-3 w-36 mt-4" />
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white p-6 border border-border shadow-sm">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-3 w-36 mt-4" />
        </div>
      </div>
    );
  }

  const buyRate = rate?.sell || 0;
  const sellRate = rate?.buy || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Best Buy Rate Card */}
      <div className="group relative overflow-hidden rounded-xl bg-white p-6 border border-border shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
        {/* Background glow effect */}
        <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10"></div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Giá mua tốt nhất (VND)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {isAnimationReady ? (
                  <NumberTicker value={buyRate} formatter={formatVND} from={buyRate * 0.95} />
                ) : (
                  <Skeleton className="h-9 w-40 inline-block align-bottom" />
                )}
              </div>
              <span className="text-xs font-bold text-muted-foreground">₫</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${isBuyPositive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}>
            {isBuyPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>7D {isBuyPositive ? '+' : '-'}{buyChangePercent}%</span>
          </div>
        </div>
      </div>

      {/* Best Sell Rate Card */}
      <div className="group relative overflow-hidden rounded-xl bg-white p-6 border border-border shadow-sm transition-all hover:border-destructive/50 hover:shadow-md">
        {/* Background glow effect */}
        <div className="absolute -right-4 -top-4 size-24 rounded-full bg-destructive/5 blur-2xl transition-all group-hover:bg-destructive/10"></div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Giá bán tốt nhất (VND)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {isAnimationReady ? (
                  <NumberTicker value={sellRate} formatter={formatVND} from={sellRate * 0.95} />
                ) : (
                  <Skeleton className="h-9 w-40 inline-block align-bottom" />
                )}
              </div>
              <span className="text-xs font-bold text-muted-foreground">₫</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${isSellPositive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}>
            {isSellPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>7D {isSellPositive ? '+' : '-'}{sellChangePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
