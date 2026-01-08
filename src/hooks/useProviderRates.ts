import { useQuery } from '@tanstack/react-query';


interface ProviderRates {
  binance: number | null;
  onramp: number | null;
  alchemy: number | null;
  bybit: number | null;
  moonpay: number | null;
  timestamp: string;
}

export function useProviderRates() {
  return useQuery<ProviderRates>({
    queryKey: ['providerRates'],
    queryFn: async () => {
      const response = await fetch('/api/get-provider-rates');
      if (!response.ok) {
        throw new Error('Failed to fetch provider rates');
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
