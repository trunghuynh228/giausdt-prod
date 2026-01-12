export const config = { runtime: 'edge' };

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request: Request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        console.log('[OKX-PROXY] Fetching OKX P2P rate...');

        const url = 'https://www.okx.com/v3/c2c/tradingOrders/getMarketplaceAdsPrelogin?paymentMethod=all&quoteMinAmountPerOrder=200000000&side=sell&userType=all&sortType=price_asc&limit=100&cryptoCurrency=USDT&fiatCurrency=VND&currentPage=1&numberPerPage=5';

        const response = await fetch(url + '&t=' + Date.now(), {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Origin': 'https://www.okx.com',
                'Referer': 'https://www.okx.com/p2p-markets/vnd/buy-usdt'
            }
        });

        console.log(`[OKX-PROXY] Status: ${response.status}`);

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'OKX request failed' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();

        // Extract best rate
        let rate: number | null = null;
        if (data?.code === 0 && Array.isArray(data?.data?.sell) && data.data.sell.length > 0) {
            const firstAd = data.data.sell[0];
            if (firstAd?.price) {
                rate = parseFloat(firstAd.price);
                if (rate < 1000) rate = null;
            }
        }

        console.log(`[OKX-PROXY] Rate: ${rate}`);

        // Clean response
        return new Response(JSON.stringify({
            okx: rate,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[OKX-PROXY] Exception:', error);
        return new Response(JSON.stringify({ error: 'Proxy error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
