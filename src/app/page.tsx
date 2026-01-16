
import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { parseHistoricalData } from '@/lib/utils';
import { ExchangeRate } from '@/types/rates';

// API Endpoints
const HOLDSTATION_RATES_API = 'https://iakzvzwriyxyshfggbwu.supabase.co/functions/v1/get_exchange_rates';
const HISTORICAL_RATES_API = 'https://dashboard2.holdstation.com/public/question/f8d68d7d-ce0c-4abc-bf4d-e50fa980d7dd.json';

async function getCurrentRate(): Promise<ExchangeRate | null> {
    try {
        const response = await fetch(HOLDSTATION_RATES_API, { next: { revalidate: 30 } }); // Revalidate every 30s
        if (!response.ok) throw new Error('Failed to fetch rates');
        const data = await response.json();
        return {
            buy: data.buy || 25800,
            sell: data.sell || 25600,
            timestamp: data.created_at || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching current rate:', error);
        return null;
    }
}

async function getHistoricalRates() {
    try {
        const response = await fetch(HISTORICAL_RATES_API, { next: { revalidate: 300 } }); // Revalidate every 5m
        if (!response.ok) throw new Error('Failed to fetch historical rates');
        const data = await response.json();
        return parseHistoricalData(data);
    } catch (error) {
        console.error('Error fetching historical rates:', error);
        return [];
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const rate = await getCurrentRate();
    // Default values if fetch fails (for metadata only)
    const displayBuy = rate ? rate.buy : 25800;
    const displaySell = rate ? rate.sell : 25600;

    const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayBuy);

    return {
        title: `Giá USDT hôm nay: ${price} | Tỷ giá Mua Bán Rẻ Nhất - giausdt.vn`,
        description: `Cập nhật tỷ giá USDT hôm nay. Quy đổi giá hiện tại USDT sang Đồng Việt Nam (VND) nhanh chóng. Giá mua: ${new Intl.NumberFormat('vi-VN').format(displaySell)} VND, Giá bán: ${new Intl.NumberFormat('vi-VN').format(displayBuy)} VND. So sánh giá USDT từ Holdstation Pay, Binance P2P, Onramp Money, AlchemyPay, Bybit, MoonPay, OKX P2P.`,
        openGraph: {
            title: `Giá USDT hôm nay: ${price} | Tỷ giá Mua Bán Rẻ Nhất`,
            description: `Theo dõi tỷ giá USDT/VND mới nhất. Mua bán USDT giá tốt nhất thị trường.`,
            type: 'website',
            url: 'https://giausdt.vn',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Giá USDT hôm nay: ${price} | giausdt.vn`,
            description: `Tỷ giá USDT hôm nay theo thời gian thực.`,
        }
    };
}

export default async function Page() {
    const currentRate = await getCurrentRate();
    const historicalRates = await getHistoricalRates();

    const safeRate = currentRate || undefined;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FinancialProduct',
                        'name': 'USDT Exchange Rate',
                        'description': 'Real-time USDT to VND exchange rate',
                        'brand': {
                            '@type': 'Brand',
                            'name': 'Tether (USDT)'
                        },
                        'offers': {
                            '@type': 'Offer',
                            'price': safeRate?.buy || 25000,
                            'priceCurrency': 'VND',
                            'availability': 'https://schema.org/InStock',
                            'priceValidUntil': new Date(Date.now() + 60000).toISOString(),
                        },
                        'provider': {
                            '@type': 'Organization',
                            'name': 'GiaUSDT.vn',
                            'url': 'https://giausdt.vn'
                        }
                    })
                }}
            />
            <HomeClient
                initialRate={safeRate}
                initialHistoricalRates={historicalRates}
            />
        </>
    );
}
