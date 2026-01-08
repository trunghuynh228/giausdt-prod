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
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Upgrade-Insecure-Requests': '1'
};



// Onramp Money API
async function fetchOnrampRate(): Promise<number | null> {
    try {
        console.log('Fetching Onramp Money rate...');
        const response = await fetchWithRetry(
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



export async function GET(request: Request) {
    try {
        console.log('Fetching all provider rates...');

        // Fetch all rates in parallel
        // Fetch all rates in parallel
        const [onrampRate, bybitRate, moonpayRate] = await Promise.all([
            fetchOnrampRate(),
            fetchBybitRate(),
            fetchMoonPayRate(),
        ]);

        const result = {
            binance: null, // Fetched client-side
            onramp: onrampRate,
            alchemy: null, // Fetched client-side
            bybit: bybitRate,
            moonpay: moonpayRate,
            okx: null, // Fetched client-side
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
