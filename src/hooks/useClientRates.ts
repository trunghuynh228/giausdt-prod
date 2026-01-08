import { useQuery } from '@tanstack/react-query';

interface ClientRates {
    binance: number | null;
    alchemy: number | null;
    okx: number | null;
}

const BROWSER_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

async function fetchBinanceRate(): Promise<number | null> {
    try {
        const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                asset: "USDT",
                fiat: "VND",
                merchantCheck: false,
                page: 1,
                rows: 10,
                tradeType: "BUY"
            }),
        });
        const data = await response.json();
        const bestAd = data?.data?.find((item: any) => !item.privilegeDesc && item.advertiser?.userType === 'merchant');
        const rate = bestAd?.adv?.price ? parseFloat(bestAd.adv.price) : null;
        return rate && rate > 1000 ? rate : null;
    } catch (e) {
        console.error('Binance client fetch error', e);
        return null;
    }
}

async function fetchAlchemyRate(): Promise<number | null> {
    try {
        const response = await fetch('https://api.alchemypay.org/index/v2/page/buy/trade/quote', {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                crypto: 'USDT',
                fiat: 'VND',
                side: 'buy',
                amount: '1000000',
                alpha2: 'VN',
                network: 'BSC',
                networkName: 'BNB Smart Chain (BEP20)',
                payWayCode: null,
                rawFiat: ''
            }),
        });
        const data = await response.json();
        let rate = 0;
        if (data?.data?.cryptoPrice) {
            rate = parseFloat(data.data.cryptoPrice);
        } else if (data?.data?.fiatAmount && data?.data?.cryptoAmount) {
            rate = parseFloat(data.data.fiatAmount) / parseFloat(data.data.cryptoAmount);
        }
        return rate > 1000 ? rate : null;
    } catch (e) {
        console.error('Alchemy client fetch error', e);
        return null;
    }
}

async function fetchOkxRate(): Promise<number | null> {
    try {
        const response = await fetch('https://www.okx.com/v3/c2c/tradingOrders/getMarketplaceAdsPrelogin?paymentMethod=all&quoteMinAmountPerOrder=10000000&side=sell&userType=all&sortType=price_asc&limit=100&cryptoCurrency=USDT&fiatCurrency=VND&currentPage=1&numberPerPage=5&t=' + Date.now());
        const data = await response.json();
        const rate = data?.code === 0 && data?.data?.sell?.[0]?.price ? parseFloat(data.data.sell[0].price) : null;
        return rate && rate > 1000 ? rate : null;
    } catch (e) {
        console.error('OKX client fetch error', e);
        return null;
    }
}

export function useClientRates() {
    return useQuery<ClientRates>({
        queryKey: ['clientRates'],
        queryFn: async () => {
            const [binance, alchemy, okx] = await Promise.all([
                fetchBinanceRate(),
                fetchAlchemyRate(),
                fetchOkxRate()
            ]);
            return { binance, alchemy, okx };
        },
        refetchInterval: 30000,
    });
}
