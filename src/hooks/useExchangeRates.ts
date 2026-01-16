import { useQuery } from '@tanstack/react-query';

import { ExchangeRate, HistoricalRate } from '@/types/rates';
import { parseHistoricalData } from '@/lib/utils';

export function useCurrentRate(initialData?: ExchangeRate) {
  return useQuery<ExchangeRate>({
    queryKey: ['currentRate'],
    queryFn: async () => {
      const response = await fetch('/api/get-current-rate');
      if (!response.ok) {
        throw new Error('Failed to fetch current rate');
      }
      const data = await response.json();

      if (!data?.buy || !data?.sell) {
        return null;
      }

      return {
        buy: data.buy,
        sell: data.sell,
        timestamp: data.created_at || new Date().toISOString(),
      };
    },
    initialData,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// Parsing functions are now in @/lib/utils

export function useHistoricalRates(initialData?: HistoricalRate[]) {
  return useQuery<HistoricalRate[]>({
    queryKey: ['historicalRates'],
    queryFn: async () => {
      const response = await fetch('/api/get-historical-rates');
      if (!response.ok) {
        throw new Error('Failed to fetch historical rates');
      }
      const data = await response.json();
      // Use the helper to parse
      const result = parseHistoricalData(data);
      console.log('Parsed historical rates:', result.length, 'entries');
      return result;
    },
    initialData,
    staleTime: 60000 * 5,
    retry: 2,
  });
}

// Tính % thay đổi cho giá MUA (user mua USDT)
// Current API bị ngược: currentRate.sell = giá user mua thực tế
// Historical không ngược: historical.buy = giá user mua
export function calculate7DayChangeBuy(rates: HistoricalRate[], currentUserBuyRate?: number): number {
  if (!rates || rates.length === 0 || !currentUserBuyRate) return 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const ratesBeforeOrAt7Days = rates.filter(r => new Date(r.date) <= sevenDaysAgo);

  let oldRate: number;
  if (ratesBeforeOrAt7Days.length > 0) {
    oldRate = ratesBeforeOrAt7Days[ratesBeforeOrAt7Days.length - 1].buy;
  } else {
    oldRate = rates[0].buy;
  }

  if (oldRate === 0) return 0;
  return ((currentUserBuyRate - oldRate) / oldRate) * 100;
}

// Tính % thay đổi cho giá BÁN (user bán USDT)
// Current API bị ngược: currentRate.buy = giá user bán thực tế
// Historical không ngược: historical.sell = giá user bán
export function calculate7DayChangeSell(rates: HistoricalRate[], currentUserSellRate?: number): number {
  if (!rates || rates.length === 0 || !currentUserSellRate) return 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const ratesBeforeOrAt7Days = rates.filter(r => new Date(r.date) <= sevenDaysAgo);

  let oldRate: number;
  if (ratesBeforeOrAt7Days.length > 0) {
    oldRate = ratesBeforeOrAt7Days[ratesBeforeOrAt7Days.length - 1].sell;
  } else {
    oldRate = rates[0].sell;
  }

  if (oldRate === 0) return 0;
  return ((currentUserSellRate - oldRate) / oldRate) * 100;
}
