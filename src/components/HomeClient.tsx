'use client';

import { Header } from '@/components/Header';
import { CurrentRateCard } from '@/components/CurrentRateCard';
import { PriceChart } from '@/components/PriceChart';
import { ProviderComparison } from '@/components/ProviderComparison';
import { UsdtCalculator } from '@/components/UsdtCalculator';
import { AboutSection } from '@/components/AboutSection';
import { useCurrentRate, useHistoricalRates, calculate7DayChangeBuy, calculate7DayChangeSell } from '@/hooks/useExchangeRates';
import { ExchangeRate, HistoricalRate } from '@/types/rates';

interface HomeClientProps {
    initialRate?: ExchangeRate;
    initialHistoricalRates?: HistoricalRate[];
}

export default function HomeClient({ initialRate, initialHistoricalRates }: HomeClientProps) {
    const { data: currentRate, isLoading: isLoadingCurrent } = useCurrentRate(initialRate);
    const { data: historicalRates, isLoading: isLoadingHistorical } = useHistoricalRates(initialHistoricalRates);

    // Current API bị ngược: sell = giá user mua, buy = giá user bán
    const change7DBuy = historicalRates ? calculate7DayChangeBuy(historicalRates, currentRate?.sell) : 0;
    const change7DSell = historicalRates ? calculate7DayChangeSell(historicalRates, currentRate?.buy) : 0;

    return (
        <div className="min-h-screen flex flex-col bg-background font-display overflow-x-hidden selection:bg-primary selection:text-white">
            <Header />

            <main className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-8">
                        {/* Left Column: Hero + Rate Cards */}
                        <div className="lg:col-span-7 flex flex-col justify-center gap-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-foreground">
                                    Giá <span className="text-primary">USDT</span> hôm nay
                                    <span className="block mt-2">(USDT → VND)</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-2xl">
                                    Theo dõi tỷ giá mua/bán trực tiếp từ các nhà cung cấp hàng đầu và quy đổi ngay lập tức.
                                </p>
                            </div>

                            {/* Rate Cards */}
                            <CurrentRateCard
                                rate={currentRate}
                                change7DBuy={change7DBuy}
                                change7DSell={change7DSell}
                                isLoading={isLoadingCurrent}
                            />
                        </div>

                        {/* Right Column: Calculator */}
                        <div className="lg:col-span-5">
                            <UsdtCalculator
                                rate={currentRate}
                                isLoading={isLoadingCurrent}
                            />
                        </div>
                    </div>

                    {/* Price History Chart */}
                    <div className="mb-12">
                        <PriceChart
                            data={historicalRates || []}
                            isLoading={isLoadingHistorical}
                            className="w-full"
                        />
                    </div>

                    {/* Provider Comparison */}
                    <ProviderComparison
                        holdstationRate={currentRate}
                        isLoading={isLoadingCurrent}
                    />
                </div>
            </main>

            {/* Footer integrated into AboutSection */}
            <AboutSection />
        </div>
    );
}
