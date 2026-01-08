import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HistoricalRate } from "@/types/rates";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse rate string like "27,182" to number 27182
export function parseRate(rateStr: string | number): number {
  if (typeof rateStr === 'number') return rateStr;
  return parseFloat(rateStr.replace(/,/g, ''));
}

// Parse date string like "December 29, 2025" to Date
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

// Helper to parse historical data
export function parseHistoricalData(data: any[]): HistoricalRate[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Parse the Holdstation API response format
  // Group by date and separate BUY/SELL
  // BUY = rate user pays to buy USDT → "Mua USDT"
  // SELL = rate user gets for selling USDT → "Bán USDT"
  const ratesByDate = new Map<string, { buy?: number; sell?: number; date: Date }>();

  data.forEach((item: any) => {
    const date = parseDate(item.order_date || item.created_at);
    const dateKey = date.toISOString().split('T')[0];
    const rate = parseRate(item.rate);
    const type = item.order_type?.toUpperCase();

    if (!ratesByDate.has(dateKey)) {
      ratesByDate.set(dateKey, { date });
    }

    const entry = ratesByDate.get(dateKey)!;
    if (type === 'BUY') {
      entry.buy = rate;  // Mua USDT
    } else if (type === 'SELL') {
      entry.sell = rate; // Bán USDT
    }
  });

  // Convert to array and sort by date
  return Array.from(ratesByDate.entries())
    .map(([dateKey, entry]) => ({
      date: dateKey,
      buy: entry.buy || 0,
      sell: entry.sell || entry.buy || 0,
    }))
    .filter(item => item.buy > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
