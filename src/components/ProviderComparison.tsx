'use client';

import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ExchangeRate } from '@/types/rates';
import { Skeleton } from '@/components/ui/skeleton';
import { useProviderRates } from '@/hooks/useProviderRates';
import holdstationLogo from '@/assets/holdstation-logo.png';
import binanceLogo from '@/assets/binance-logo.png';
import onrampLogo from '@/assets/onramp-logo.png';
import alchemyLogo from '@/assets/alchemy-logo.png';
import bybitLogo from '@/assets/bybit-logo.png';
import moonpayLogo from '@/assets/moonpay-logo.png';
import okxLogo from '@/assets/okx-logo.jpg';

interface ProviderComparisonProps {
  holdstationRate?: ExchangeRate;
  isLoading: boolean;
}

import { StaticImageData } from 'next/image';

interface Provider {
  name: string;
  rate: number | null;
  url?: string;
  logo: string | StaticImageData;
  recommended?: boolean;
}

export function ProviderComparison({ holdstationRate, isLoading }: ProviderComparisonProps) {
  const { data: providerRates, isLoading: isLoadingProviders } = useProviderRates();

  const providers = useMemo<Provider[]>(() => {
    const holdstationBuy = holdstationRate?.buy || null;

    return [
      {
        name: 'Holdstation Pay',
        rate: holdstationBuy,
        url: 'https://pay.holdstation.com/ref/9TCFHc',
        logo: holdstationLogo,
        recommended: true
      },
      {
        name: 'Binance P2P',
        rate: providerRates?.binance || null,
        url: 'https://p2p.binance.com/en/trade/buy/USDT/?fiat=VND',
        logo: binanceLogo
      },
      {
        name: 'Onramp Money',
        rate: providerRates?.onramp || null,
        url: 'https://onramp.money',
        logo: onrampLogo
      },
      {
        name: 'AlchemyPay',
        rate: providerRates?.alchemy || null,
        url: 'https://alchemypay.org',
        logo: alchemyLogo
      },
      {
        name: 'Bybit P2P',
        rate: providerRates?.bybit || null,
        url: 'https://www.bybit.com/vi-VN/p2p/buy/USDT/VND',
        logo: bybitLogo
      },
      {
        name: 'MoonPay',
        rate: providerRates?.moonpay || null,
        url: 'https://www.moonpay.com/buy/usdt',
        logo: moonpayLogo
      },
      {
        name: 'OKX P2P',
        rate: providerRates?.okx || null,
        url: 'https://www.okx.com/p2p-markets/vnd/buy-usdt',
        logo: okxLogo
      },
    ];
  }, [holdstationRate, providerRates]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  // Always show Holdstation Pay first, then sort others by rate
  // IMPORTANT: Filter out providers that have a BETTER (lower) rate than Holdstation
  const sortedProviders = useMemo(() => {
    const holdstation = providers.find(p => p.name === 'Holdstation Pay');
    const holdstationRateVal = holdstation?.rate;
    const others = providers.filter(p => p.name !== 'Holdstation Pay');

    const othersWithRates = others.filter(p => {
      if (p.rate === null) return false;
      // If Holdstation has a rate, only show others if they are NOT better (lower)
      if (holdstationRateVal !== null && holdstationRateVal !== undefined) {
        return p.rate >= holdstationRateVal;
      }
      return true;
    });

    const othersWithoutRates = others.filter(p => p.rate === null);

    const sortedOthers = [...othersWithRates].sort((a, b) => (a.rate || 0) - (b.rate || 0));

    return holdstation
      ? [holdstation, ...sortedOthers, ...othersWithoutRates]
      : [...sortedOthers, ...othersWithoutRates];
  }, [providers]);

  // Find the best rate among VISIBLE providers
  const bestRate = useMemo(() => {
    const allRates = sortedProviders.filter(p => p.rate !== null).map(p => p.rate!);
    return allRates.length > 0 ? Math.min(...allRates) : null;
  }, [sortedProviders]);

  const isLoadingAll = isLoading || isLoadingProviders;

  const calculateDiffPercent = (rate: number) => {
    if (!bestRate || rate === bestRate) return null;
    return ((rate - bestRate) / bestRate * 100).toFixed(2);
  };

  if (isLoadingAll) {
    return (
      <div className="mb-16">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">So sánh nhà cung cấp</h3>
          <p className="text-muted-foreground mt-1">Tìm giá tốt nhất từ các giải pháp thanh toán, sàn P2P và nền tảng giao dịch hàng đầu.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider" scope="col">Nhà cung cấp</th>
                <th className="px-6 py-4 font-bold tracking-wider" scope="col">Giá (1 USDT)</th>
                <th className="px-6 py-4 text-right font-bold tracking-wider" scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedProviders.map((provider) => {
                const hasRate = provider.rate !== null;
                const isHoldstation = provider.name === 'Holdstation Pay';
                const isHoldstationBest = isHoldstation && hasRate && provider.rate === bestRate;
                // Never show percentage difference for Holdstation Pay as requested
                const diffPercent = !isHoldstation && hasRate && provider.rate !== bestRate ? calculateDiffPercent(provider.rate!) : null;

                return (
                  <tr
                    key={provider.name}
                    className={`transition-colors ${isHoldstation ? 'bg-green-50/50 hover:bg-green-50' : 'hover:bg-gray-50'
                      }`}
                  >
                    <td className="whitespace-nowrap px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border shadow-sm overflow-hidden">
                          <img
                            src={typeof provider.logo === 'string' ? provider.logo : provider.logo.src}
                            alt={`Logo ${provider.name} - Sàn giao dịch USDT`}
                            className="h-full w-full rounded-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-base">{provider.name}</span>
                            {isHoldstation && (
                              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                                {isHoldstationBest ? 'Tốt Nhất' : 'Đề Xuất'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      {hasRate ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${isHoldstation ? 'text-primary-dark' : 'text-foreground'}`}>
                            {formatVND(provider.rate!)} VND
                          </span>
                          {diffPercent && (
                            <span className="text-xs font-bold text-red-500">
                              +{diffPercent}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Đang tải...</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-right">
                      {isHoldstation ? (
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                          Mua ngay
                        </a>
                      ) : (
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-bold text-foreground hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          Đi tới
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout */}
        <div className="sm:hidden divide-y divide-border">
          {sortedProviders.map((provider) => {
            const hasRate = provider.rate !== null;
            const isHoldstation = provider.name === 'Holdstation Pay';
            const isHoldstationBest = isHoldstation && hasRate && provider.rate === bestRate;
            // Never show percentage difference for Holdstation Pay as requested
            const diffPercent = !isHoldstation && hasRate && provider.rate !== bestRate ? calculateDiffPercent(provider.rate!) : null;

            return (
              <div
                key={provider.name}
                className={`p-4 ${isHoldstation ? 'bg-green-50/50' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border shadow-sm overflow-hidden">
                      <img
                        src={typeof provider.logo === 'string' ? provider.logo : provider.logo.src}
                        alt={`Logo ${provider.name} - Sàn giao dịch USDT`}
                        className="h-full w-full rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground text-sm truncate">{provider.name}</span>
                        {isHoldstation && (
                          <span className="rounded bg-primary px-1 py-0.5 text-[9px] font-bold uppercase text-white shrink-0">
                            {isHoldstationBest ? 'Tốt Nhất' : 'Đề Xuất'}
                          </span>
                        )}
                      </div>
                      {hasRate ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${isHoldstation ? 'text-primary-dark' : 'text-foreground'}`}>
                            {formatVND(provider.rate!)} VND
                          </span>
                          {diffPercent && (
                            <span className="text-[10px] font-bold text-red-500">
                              +{diffPercent}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Đang tải...</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isHoldstation ? (
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dark transition-colors"
                      >
                        Mua ngay
                      </a>
                    ) : (
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}