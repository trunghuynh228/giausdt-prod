export interface ExchangeRate {
  buy: number;
  sell: number;
  timestamp?: string;
}

export interface HistoricalRate {
  date: string;
  buy: number;
  sell: number;
}

export interface ProviderRate {
  name: string;
  rate: number;
  logo?: string;
}

export type TimeRange = '1D' | '7D' | '1M';
