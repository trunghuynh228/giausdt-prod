export const runtime = 'edge';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};

// Binance P2P Quoted Price API
async function fetchBinanceRate(): Promise<number | null> {
    try {
        console.log('Fetching Binance P2P quoted price...');
        const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            method: 'POST',
            headers: {
                ...BROWSER_HEADERS,
                'Content-Type': 'application/json',
                'Origin': 'https://p2p.binance.com',
                'Referer': 'https://p2p.binance.com/en/trade/buy/USDT'
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

        if (!response.ok) {
            console.error('Binance API error:', response.status);
            return null;
        }

        const data = await response.json();
        // console.log('Binance response:', JSON.stringify(data));

        // Get the first item that privilegeDesc is null and then get adv.price as rate
        if (Array.isArray(data?.data) && data.data.length > 0) {
            // Find first ad that is not promoted AND is from a merchant
            const bestAd = data.data.find((item: any) =>
                !item.privilegeDesc &&
                item.advertiser?.userType === 'merchant'
            );

            if (bestAd) {
                if (bestAd.adv?.price) {
                    const rate = parseFloat(bestAd.adv.price);
                    if (rate < 1000) return null;
                    console.log('Binance rate:', rate);
                    return rate;
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching Binance rate:', error);
        return null;
    }
}

// Onramp Money API
async function fetchOnrampRate(): Promise<number | null> {
    try {
        console.log('Fetching Onramp Money rate...');
        const response = await fetch(
            'https://api.onramp.money/onramp/api/v4/buy/public/coinDetails?coinCode=usdt&chainId=1&coinAmount=1&fiatType=5&appId=1&paymentType=1',
            {
                method: 'GET',
                headers: {
                    ...BROWSER_HEADERS,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('Onramp API error:', response.status);
            return null;
        }

        const data = await response.json();
        // console.log('Onramp response:', JSON.stringify(data));

        // Parse the response to get the VND rate
        if (data?.data?.price) {
            const rate = parseFloat(data.data.price);
            if (rate < 1000) return null;
            console.log('Onramp rate:', rate);
            return rate;
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
        const response = await fetch('https://api.alchemypay.org/index/v2/page/buy/trade/quote', {
            method: 'POST',
            headers: {
                ...BROWSER_HEADERS,
                'Content-Type': 'application/json',
                'Origin': 'https://alchemypay.org',
                'Referer': 'https://alchemypay.org/'
            },
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

        if (!response.ok) {
            console.error('AlchemyPay API error:', response.status);
            return null;
        }

        const data = await response.json();
        // console.log('AlchemyPay response:', JSON.stringify(data));

        // Parse the response to get the VND rate per USDT
        // The API returns fiatAmount for given crypto amount, so we calculate the rate
        let rate = 0;
        if (data?.data?.cryptoPrice) {
            rate = parseFloat(data.data.cryptoPrice);
        } else if (data?.data?.fiatAmount && data?.data?.cryptoAmount) {
            rate = parseFloat(data.data.fiatAmount) / parseFloat(data.data.cryptoAmount);
        }

        if (rate > 1000) {
            console.log('AlchemyPay rate:', rate);
            return rate;
        }
        return null;
    } catch (error) {
        console.error('Error fetching AlchemyPay rate:', error);
        return null;
    }
}

// Bybit P2P API
async function fetchBybitRate(): Promise<number | null> {
    try {
        console.log('Fetching Bybit P2P rate...');
        const response = await fetch('https://www.bybit.com/x-api/fiat/public/channel/payment-list-w1?fiat=VND&crypto=USDT&direction=buy&quantity=1', {
            method: 'GET',
            headers: {
                ...BROWSER_HEADERS,
                'Accept': 'application/json',
                'Origin': 'https://www.bybit.com',
                'Referer': 'https://www.bybit.com/vi-VN/fiat/trade/express/home/buy/USDT/VND'
            }
        });

        if (!response.ok) {
            console.error('Bybit API error:', response.status);
            return null;
        }

        const data = await response.json();
        // console.log('Bybit response:', JSON.stringify(data));

        if (data?.ret_code === 0 && data?.result?.payments?.list?.[0]?.price) {
            const price = parseFloat(data.result.payments.list[0].price);
            if (price < 1000) return null;
            console.log('Bybit rate:', price);
            return price;
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
        const response = await fetch('https://api.moonpay.com/v3/currencies/usdt/quote?baseCurrencyAmount=10000000&areFeesIncluded=true&fixed=true&apiKey=pk_live_R5Lf25uBfNZyKwccAZpzcxuL3ZdJ3Hc&baseCurrencyCode=vnd', {
            method: 'GET',
            headers: {
                ...BROWSER_HEADERS,
                'Accept': 'application/json',
                'Origin': 'https://www.moonpay.com',
                'Referer': 'https://www.moonpay.com/'
            }
        });

        if (!response.ok) {
            console.error('MoonPay API error:', response.status);
            return null;
        }

        const data = await response.json();
        // console.log('MoonPay response:', JSON.stringify(data));

        if (data?.quoteCurrencyPrice) {
            const price = data.quoteCurrencyPrice;
            if (price < 1000) return null;
            console.log('MoonPay rate:', price);
            return price;
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
        const response = await fetch('https://www.okx.com/v3/c2c/tradingOrders/getMarketplaceAdsPrelogin?paymentMethod=all&quoteMinAmountPerOrder=10000000&side=sell&userType=all&sortType=price_asc&limit=100&cryptoCurrency=USDT&fiatCurrency=VND&currentPage=1&numberPerPage=5&t=' + Date.now(), {
            method: 'GET',
            headers: {
                ...BROWSER_HEADERS,
                'Accept': 'application/json',
                'Origin': 'https://www.okx.com',
                'Referer': 'https://www.okx.com/p2p-markets/vnd/buy-usdt'
            }
        });

        if (!response.ok) {
            console.error('OKX API error:', response.status);
            return null;
        }

        const data = await response.json();
        // console.log('OKX response:', JSON.stringify(data));

        if (data?.code === 0 && Array.isArray(data?.data?.sell) && data.data.sell.length > 0) {
            const price = parseFloat(data.data.sell[0].price);
            if (price < 1000) return null;
            console.log('OKX rate:', price);
            return price;
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

        console.log('Provider rates result:', JSON.stringify(result));

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
