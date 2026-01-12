export const config = { runtime: 'edge' };

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request: Request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        console.log('[BINANCE-PROXY] Fetching Binance P2P rate...');

        const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                'origin': 'https://p2p.binance.com',
                'referer': 'https://p2p.binance.com/en',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: JSON.stringify({
                fiat: 'VND',
                page: 1,
                rows: 10,
                tradeType: 'BUY',
                asset: 'USDT',
                countries: [],
                proMerchantAds: false,
                shieldMerchantAds: false,
                filterType: 'tradable',
                periods: [],
                additionalKycVerifyFilter: 0,
                publisherType: 'merchant',
                payTypes: [],
                classifies: ['mass', 'profession', 'fiat_trade'],
                tradedWith: false,
                followed: false
            }),
        });

        console.log(`[BINANCE-PROXY] Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[BINANCE-PROXY] Error: ${errorText.substring(0, 200)}`);
            return new Response(JSON.stringify({ error: 'Binance request failed', status: response.status }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();

        // Extract best merchant rate
        let rate: number | null = null;
        if (Array.isArray(data?.data) && data.data.length > 0) {
            const bestAd = data.data.find((item: any) =>
                !item.privilegeDesc &&
                item.advertiser?.userType === 'merchant'
            );
            if (bestAd?.adv?.price) {
                rate = parseFloat(bestAd.adv.price);
                if (rate < 1000) rate = null;
            }
        }

        console.log(`[BINANCE-PROXY] Rate: ${rate}`);

        return new Response(JSON.stringify({
            binance: rate,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[BINANCE-PROXY] Exception:', error);
        return new Response(JSON.stringify({ error: 'Proxy error', message: String(error) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
