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
        console.log('[ALCHEMY-PROXY] Fetching AlchemyPay rate...');

        // Use the simpler public quote endpoint without auth tokens
        const response = await fetch('https://api.alchemypay.org/index/v2/page/buy/trade/quote', {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US',
                'content-type': 'application/json',
                'origin': 'https://ramp.alchemypay.org',
                'referer': 'https://ramp.alchemypay.org/',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: JSON.stringify({
                crypto: 'USDT',
                fiat: 'VND',
                side: 'buy',
                amount: '1000000',
                alpha2: 'VN',
                network: 'BSC',
                payWayCode: null
            }),
        });

        console.log(`[ALCHEMY-PROXY] Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ALCHEMY-PROXY] Error: ${errorText.substring(0, 200)}`);
            return new Response(JSON.stringify({ error: 'AlchemyPay request failed', status: response.status }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();
        console.log(`[ALCHEMY-PROXY] Response keys: ${Object.keys(data || {}).join(', ')}`);
        console.log(`[ALCHEMY-PROXY] data.data: ${JSON.stringify(data?.data || {}).substring(0, 500)}`);

        // Extract rate - try multiple field paths
        let rate: number | null = null;

        if (data?.data?.cryptoPrice) {
            rate = parseFloat(data.data.cryptoPrice);
        } else if (data?.data?.fiatAmount && data?.data?.cryptoAmount) {
            rate = parseFloat(data.data.fiatAmount) / parseFloat(data.data.cryptoAmount);
        } else if (data?.data?.price) {
            rate = parseFloat(data.data.price);
        }

        // Validate rate
        if (rate && rate < 1000) rate = null;

        console.log(`[ALCHEMY-PROXY] Rate: ${rate}`);

        return new Response(JSON.stringify({
            alchemy: rate,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[ALCHEMY-PROXY] Exception:', error);
        return new Response(JSON.stringify({ error: 'Proxy error', message: String(error) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
