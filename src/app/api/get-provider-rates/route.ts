export const runtime = 'edge';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common Headers for all requests
const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
};

// "Spoof" headers for Strict Providers (Bybit)
// These claim to be from the same origin as the target to bypass WAFs
const SECURE_SPOOF_HEADERS = {
    ...COMMON_HEADERS,
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin', // Important: Must match the spoofed Origin
};

// Simplified Spoof Headers for OKX (Avoid TLS fingerprint mismatches)
const SIMPLE_SPOOF_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
};

// Minimal headers for permissive providers (Onramp, MoonPay, Binance, Alchemy)
const MINIMAL_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, backoff = 1000): Promise<Response> {
    try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        throw new Error(`Request failed with status ${response.status}`);
    } catch (error) {
        if (retries <= 0) throw error;
        console.log(`Retrying ${url}... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, backoff + Math.random() * 500));
        return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
    }
}

// Binance P2P Quoted Price API
async function fetchBinanceRate(): Promise<number | null> {
    try {
        console.log('Fetching Binance P2P quoted price...');
        const response = await fetchWithRetry('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            method: 'POST',
            headers: {
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Content-Type": "application/json",
                "Host": "p2p.binance.com",
                "Origin": "https://p2p.binance.com",
                "Pragma": "no-cache",
                "Referer": "https://p2p.binance.com/en/trade/buy/USDT",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "clientType": "web"
            },
            body: JSON.stringify({
                asset: "USDT",
                fiat: "VND",
                merchantCheck: false,
                page: 1,
                rows: 10,
                tradeType: "BUY"
            }),
        });

        if (!response.ok) return null;
        const data = await response.json();

        if (Array.isArray(data?.data) && data.data.length > 0) {
            const bestAd = data.data.find((item: any) =>
                !item.privilegeDesc &&
                item.advertiser?.userType === 'merchant'
            );
            if (bestAd?.adv?.price) {
                const rate = parseFloat(bestAd.adv.price);
                return rate >= 1000 ? rate : null;
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching Binance rate:', error);
        return null;
    }
}

// Onramp Money API - Use MINIMAL headers to avoid blocking
async function fetchOnrampRate(): Promise<number | null> {
    try {
        console.log('Fetching Onramp Money rate...');
        const response = await fetchWithRetry(
            'https://api.onramp.money/onramp/api/v4/buy/public/coinDetails?coinCode=usdt&chainId=1&coinAmount=1&fiatType=5&appId=1&paymentType=1',
            {
                method: 'GET',
                headers: MINIMAL_HEADERS // Strict WAF bypass not needed, keep it simple
            }
        );

        if (!response.ok) return null;
        const data = await response.json();
        if (data?.data?.price) {
            const rate = parseFloat(data.data.price);
            return rate >= 1000 ? rate : null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching Onramp rate:', error);
        return null;
    }
}

// AlchemyPay API
async function fetchAlchemyRate(): Promise<number | null> {
    try {
        console.log('Fetching AlchemyPay rate...');

        // Robust keys for Alchemy (Restoring previous method)
        const ALCHEMY_HEADERS = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Upgrade-Insecure-Requests': '1',
            'Content-Type': 'application/json',
            'Origin': 'https://alchemypay.org',
            'Referer': 'https://alchemypay.org/'
        };

        const response = await fetchWithRetry('https://api.alchemypay.org/index/v2/page/buy/trade/quote', {
            method: 'POST',
            headers: ALCHEMY_HEADERS,
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

        if (!response.ok) return null;
        const data = await response.json();
        let rate = 0;
        if (data?.data?.cryptoPrice) {
            rate = parseFloat(data.data.cryptoPrice);
        } else if (data?.data?.fiatAmount && data?.data?.cryptoAmount) {
            rate = parseFloat(data.data.fiatAmount) / parseFloat(data.data.cryptoAmount);
        }
        return rate > 1000 ? rate : null;
    } catch (error) {
        console.error('Error fetching AlchemyPay rate:', error);
        return null;
    }
}

// Bybit P2P API
async function fetchBybitRate(): Promise<number | null> {
    try {
        console.log('Fetching Bybit P2P rate...');
        const response = await fetchWithRetry('https://www.bybit.com/x-api/fiat/otc/item/online', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'accept-language': 'vi-VN',
                'content-type': 'application/json;charset=UTF-8',
                'guid': '0703a12e-8265-7e76-d877-c75852325a60',
                'lang': 'vi-VN',
                'origin': 'https://www.bybit.com',
                'platform': 'PC',
                'priority': 'u=1, i',
                'referer': 'https://www.bybit.com/vi-VN/p2p/buy/USDT/VND',
                'risktoken': 'dmVyMQ|YzZjZDU2NWE1N20wejE5ZGRpd3ByZjFiZjRiODRlMGYw||==',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'traceparent': '00-38db0d8c39ebb7dce867a846b7000be1-110d679bda76677c-01',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                userId: "",
                tokenId: "USDT",
                currencyId: "VND",
                payment: [],
                side: "1",
                size: "10",
                page: "1",
                amount: "",
                vaMaker: false,
                bulkMaker: false,
                canTrade: true,
                verificationFilter: 0,
                sortType: "OVERALL_RANKING",
                paymentPeriod: [],
                itemRegion: 1
            })
        });

        if (!response.ok) return null;
        const data = await response.json();

        if (data?.ret_code === 0 && Array.isArray(data?.result?.items) && data.result.items.length > 0) {
            // Get the first item's price
            const firstItem = data.result.items[0];
            if (firstItem?.price) {
                const price = parseFloat(firstItem.price);
                return price >= 1000 ? price : null;
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching Bybit rate:', error);
        return null;
    }
}

// MoonPay API
async function fetchMoonPayRate(): Promise<number | null> {
    try {
        console.log('Fetching MoonPay rate...');
        const response = await fetchWithRetry('https://api.moonpay.com/v3/currencies/usdt/quote?baseCurrencyAmount=10000000&areFeesIncluded=true&fixed=true&apiKey=pk_live_R5Lf25uBfNZyKwccAZpzcxuL3ZdJ3Hc&baseCurrencyCode=vnd', {
            method: 'GET',
            headers: MINIMAL_HEADERS // MoonPay also prefers simple headers
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (data?.quoteCurrencyPrice) {
            const price = data.quoteCurrencyPrice;
            return price >= 1000 ? price : null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching MoonPay rate:', error);
        return null;
    }
}

// OKX P2P API
async function fetchOkxRate(): Promise<number | null> {
    try {
        console.log('Fetching OKX P2P rate...');
        const response = await fetchWithRetry('https://www.okx.com/v3/c2c/tradingOrders/getMarketplaceAdsPrelogin?paymentMethod=all&quoteMinAmountPerOrder=10000000&side=sell&userType=all&sortType=price_asc&limit=100&cryptoCurrency=USDT&fiatCurrency=VND&currentPage=1&numberPerPage=5&t=' + Date.now(), {
            method: 'GET',
            headers: {
                ...SIMPLE_SPOOF_HEADERS,
                'Accept': 'application/json',
                'Origin': 'https://www.okx.com',
                'Referer': 'https://www.okx.com/p2p-markets/vnd/buy-usdt'
            }
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (data?.code === 0 && Array.isArray(data?.data?.sell) && data.data.sell.length > 0) {
            const price = parseFloat(data.data.sell[0].price);
            return price >= 1000 ? price : null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching OKX rate:', error);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        console.log('Fetching all provider rates...');
        // Fetch all rates in parallel
        const [binanceRate, onrampRate, alchemyRate, bybitRate, moonpayRate, okxRate] = await Promise.all([
            fetchBinanceRate(),
            fetchOnrampRate(),
            fetchAlchemyRate(),
            fetchBybitRate(),
            fetchMoonPayRate(),
            fetchOkxRate(),
        ]);

        const result = {
            binance: binanceRate,
            onramp: onrampRate,
            alchemy: alchemyRate,
            bybit: bybitRate,
            moonpay: moonpayRate,
            okx: okxRate,
            timestamp: new Date().toISOString(),
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching provider rates:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

export async function OPTIONS(request: Request) {
    return new Response(null, { headers: corsHeaders });
}
