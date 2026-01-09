export const runtime = 'edge';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common Headers
const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
};

// Bybit uses highly specific headers now
const SECURE_SPOOF_HEADERS = {
    ...COMMON_HEADERS,
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
};

// OKX uses simple spoof headers
const SIMPLE_SPOOF_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
};

// Minimal for Onramp/MoonPay
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

// Binance P2P - Use specific user-provided headers/cookies
async function fetchBinanceRate(): Promise<number | null> {
    try {
        console.log('Fetching Binance P2P quoted price...');
        const response = await fetchWithRetry('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'bnc-level': '0',
                'bnc-location': 'VN',
                'bnc-time-zone': 'Asia/Saigon',
                'bnc-uuid': '65fd291f-1f9e-47aa-bc30-9bb8dd305bfb',
                'c2ctype': 'c2c_web',
                'clienttype': 'web',
                'content-type': 'application/json',
                // Using the extensive cookie string provided
                'cookie': 'BNC_FV_KEY=33c3ba8916a0a4918b15f1f82970b8dc2957325a; changeBasisTimeZone=; OptanonAlertBoxClosed=2025-01-10T06:56:22.075Z; BNC-Location=VN; lang=en; neo-theme=dark; bnc-uuid=65fd291f-1f9e-47aa-bc30-9bb8dd305bfb; se_gd=VAEUQTVgPFLURUNcIVxIgZZClAgpRBWW1FcRbVE51RSVAUVNWVAD1; se_gsd=USs1Pyd5Ii40NwUzNzU3NCIgUQkMAAMKVl1DVFdRVlRUHVNT1; theme=dark; userPreferredCurrency=USD_USD; _gid=GA1.2.584260631.1767607943; _gcl_au=1.1.136520903.1767608493; common_fiat=%7B%22fiat%22%3A%22VND%22%7D; fiat-prefer-currency=VND; se_sd=RMRBAWAUNDDDFIPwXFhQgZZChHlQKEXUVMLRQWkJFZcVgB1NWVkR1; futures-layout=pro; _uetsid=67f0da70eb9011f096c385e49f61e3dd; _uetvid=5cbf68f0110811efa261e3aa7ebf515c; s9r1=A749780B9571B8F7A340E5418DB091B7; r20t=web.00F6F9FDAEC5C9910916A94EBEB4CA19; r30t=1; cr00=BC91EE840ECE1B67AC17F9DF508E11D1; d1og=web.20755910.2F05B9A60139847A40E25DE807D44D40; r2o1=web.20755910.9FC7006CCA2E8BDE4F5A3C17376856AE; f30l=web.20755910.C94AC19EABE223C20A125F7DA54E2F0B; currentAccount=; logined=y; p20t=web.20755910.0EE0B0DA9AA26C34CA8B93A347CAD62C; OptanonConsent=isGpcEnabled=0&datestamp=Thu+Jan+08+2026+21%3A56%3A14+GMT%2B0700+(Indochina+Time)&version=202506.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=027d5716-41b6-4c1c-8853-58891b8f7219&interactionCount=2&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CC0004%3A1%2CC0002%3A1&AwaitingReconsent=false&intType=1&geolocation=VN%3BHN; _h_desk_key=3ca075253e1d453ba28f8f5efacf0f78; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2220755910%22%2C%22first_id%22%3A%2218f57d0e0296b9-0533b10ed1b761-1b525637-1405320-18f57d0e02a293d%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E8%87%AA%E7%84%B6%E6%90%9C%E7%B4%A2%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24latest_utm_source%22%3A%22BinanceTwitter%22%2C%22%24latest_utm_medium%22%3A%22GlobalSocial%22%2C%22%24latest_utm_campaign%22%3A%22W3W%22%2C%22aws_waf_referrer%22%3A%22%7B%5C%22referrer%5C%22%3A%5C%22%5C%22%7D%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThmNTdkMGUwMjk2YjktMDUzM2IxMGVkMWI3NjEtMWI1MjU2MzctMTQwNTMyMC0xOGY1N2QwZTAyYTI5M2QiLCIkaWRlbnRpdHlfbG9naW5faWQiOiIyMDc1NTkxMCJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%2220755910%22%7D%2C%22%24device_id%22%3A%2218f57d0e0296b9-0533b10ed1b761-1b525637-1405320-18f57d0e02a293d%22%7D; _gat_UA-162512367-1=1; _ga_3WP50LGEEC=GS2.1.s1767884177$o141$g0$t1767884177$j60$l0$h0; _ga=GA1.1.1700608615.1715165258; BNC_FV_KEY_T=101-osbkmCNnmKi7krnKopMTQj8KAnOsGMGx7vf%2BQHonn01euT%2FDYfVMx2SkHixom4q%2FyXcFKdoG4IWblGMuvvBikw%3D%3D-M%2BKvMnrZ5kGtxKjn1xUpyg%3D%3D-75; BNC_FV_KEY_EXPIRE=1767905778201',
                'csrftoken': '490f4ece723f2d13054cfdd696f6898b',
                'device-info': 'eyJzY3JlZW5fcmVzb2x1dGlvbiI6Ijk1NiwxNDcwIiwiYXZhaWxhYmxlX3NjcmVlbl9yZXNvbHV0aW9uIjoiODU3LDE0NzAiLCJzeXN0ZW1fdmVyc2lvbiI6Im1hY09TIDEwLjE1LjciLCJicmFuZF9tb2RlbCI6ImRlc2t0b3AgQXBwbGUgTWFjaW50b3NoICIsInN5c3RlbV9sYW5nIjoiZW4tVVMiLCJ0aW1lem9uZSI6IkdNVCswNzowMCIsInRpbWV6b25lT2Zmc2V0IjotNDIwLCJ1c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0My4wLjAuMCBTYWZhcmkvNTM3LjM2IiwibGlzdF9wbHVnaW4iOiJQREYgVmlld2VyLENocm9tZSBQREYgVmlld2VyLENocm9taXVtIFBERiBWaWV3ZXIsTWljcm9zb2Z0IEVkZ2UgUERGIFZpZXdlcixXZWJLaXQgYnVpbHQtaW4gUERGIiwiY2FudmFzX2NvZGUiOiI2NzdmNDNiYiIsIndlYmdsX3ZlbmRvciI6Ikdvb2dsZSBJbmMuIChBcHBsZSkiLCJ3ZWJnbF9yZW5kZXJlciI6IkFOR0xFIChBcHBsZSwgQU5HTEUgTWV0YWwgUmVuZGVyZXI6IEFwcGxlIE0yLCBVbnNwZWNpZmllZCBWZXJzaW9uKSIsImF1ZGlvIjoiMTI0LjA0MzQ4MTU1ODc2NTA1IiwicGxhdGZvcm0iOiJNYWNJbnRlbCIsIndlYl90aW1lem9uZSI6IkFzaWEvU2FpZ29uIiwiZGV2aWNlX25hbWUiOiJDaHJvbWUgVjE0My4wLjAuMCAobWFjT1MpIiwiZmluZ2VycHJpbnQiOiJiZWJjOWYzMTFjNzk2N2JmYjJmMmIxOGRhOTQ0ODdhYyIsImRldmljZV9pZCI6IiIsInJlbGF0ZWRfZGV2aWNlX2lkcyI6IiJ9',
                'fvideo-id': '33c3ba8916a0a4918b15f1f82970b8dc2957325a',
                'fvideo-token': 'pjG0FZG0IMlx6C/KeuvVFluSw3KAzomevTb9FXcU0KXw+7dZQXuYNU0Pob6sPMPWIhvpZXdxzxP1VLzGM1jXkcO/bTdYjjQNOmO8BvEAxCyOq6x5fNCVCKqhbHYAOJ3MtFViHTRGVfJpGuUqHtsh6xMaBl0nx7kih1gB31IpxlEyLQP16NR+oGUVtALDt9+BA=37',
                'lang': 'en',
                'origin': 'https://p2p.binance.com',
                'priority': 'u=1, i',
                'referer': 'https://p2p.binance.com/en',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                // 'x-passthrough-token': '', // Empty in curl, optional?
                'x-trace-id': 'fd325e93-914c-4904-849c-68b3c6d3466b',
                'x-ui-request-trace': 'fd325e93-914c-4904-849c-68b3c6d3466b'
            },
            body: JSON.stringify({
                "fiat": "VND",
                "page": 1,
                "rows": 10,
                "tradeType": "BUY",
                "asset": "USDT",
                "countries": [],
                "proMerchantAds": false,
                "shieldMerchantAds": false,
                "filterType": "tradable",
                "periods": [],
                "additionalKycVerifyFilter": 0,
                "publisherType": "merchant",
                "payTypes": [],
                "classifies": ["mass", "profession", "fiat_trade"],
                "tradedWith": false,
                "followed": false
            }),
        });

        // DIAGNOSTIC: Log response details
        console.log(`[BINANCE] Status: ${response.status}, StatusText: ${response.statusText}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[BINANCE] Error response body: ${errorBody.substring(0, 500)}`);
            return null;
        }

        const data = await response.json();
        console.log(`[BINANCE] Response data keys: ${Object.keys(data || {}).join(', ')}`);

        if (Array.isArray(data?.data) && data.data.length > 0) {
            const bestAd = data.data.find((item: any) =>
                !item.privilegeDesc &&
                item.advertiser?.userType === 'merchant'
            );
            if (bestAd?.adv?.price) {
                const rate = parseFloat(bestAd.adv.price);
                console.log(`[BINANCE] Found rate: ${rate}`);
                return rate >= 1000 ? rate : null;
            }
        }
        console.log('[BINANCE] No valid rate found in response');
        return null;
    } catch (error) {
        console.error('[BINANCE] Exception:', error);
        return null;
    }
}

// Onramp Money API
async function fetchOnrampRate(): Promise<number | null> {
    try {
        console.log('Fetching Onramp Money rate...');
        const response = await fetchWithRetry(
            'https://api.onramp.money/onramp/api/v4/buy/public/coinDetails?coinCode=usdt&chainId=1&coinAmount=1&fiatType=5&appId=1&paymentType=1',
            {
                method: 'GET',
                headers: MINIMAL_HEADERS
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

// AlchemyPay API - Use specific user-provided headers/cookies
async function fetchAlchemyRate(): Promise<number | null> {
    try {
        console.log('Fetching AlchemyPay rate...');
        // Exact URL from user curl
        const url = 'https://api.alchemypay.org/index/v2/page/buy/trade/quote?id=yOkBTsIsw9XR64RxFLmbPQ%3D%3D&email=3lfEelBYKDPtruNMlsiKjkIABlnkRsXEbCiQ40CZsI0%3D&token=ACH7097003954ACHk%2FqvCfiqKDwBwPegOkpkf3XTUlIuGumPdXAR3sGWciYIFYKzgsi6P18d86r%252BwWsiVoF9PykGJ0CtogFZdOIQxQ%3D%3D&crypto=USDC&fiat=VND&amount=8100601&alpha2=VN&network=BSC&type=officialWebsite';

        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US',
                'content-type': 'application/json',
                'eagleeye-pappname': 'hr6j2bxyvr@7c417a5009c6f7e',
                'eagleeye-sessionid': '4dmL8k9e57zkbwptmfRwyaUo45I1',
                'eagleeye-traceid': 'c1287ca717678844394961032c6f7e',
                'fingerprint-id': 'TjoaW1tGG7iN3PhO28g7I/VsqbIzFHpop7ieWEiYY7g=',
                'origin': 'https://ramp.alchemypay.org',
                'priority': 'u=1, i',
                'referer': 'https://ramp.alchemypay.org/',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sign': 'BuBse4iBU/+eD8VVaerle/xC3laQYk1zsQbq2h/DbBc=',
                'submit-token': '',
                'timestamp': '1767884439489',
                'timezone': 'Asia/Saigon',
                'token': 'k/qvCfiqKDwBwPegOkpkf3XTUlIuGumPdXAR3sGWciYIFYKzgsi6P18d86r+wWsiVoF9PykGJ0CtogFZdOIQxQ==',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                "crypto": "USDT",
                "fiat": "VND",
                "side": "buy",
                "amount": "8100601",
                "alpha2": "VN",
                "network": "BSC",
                "payWayCode": null
            }),
        });

        // DIAGNOSTIC: Log response details
        console.log(`[ALCHEMY] Status: ${response.status}, StatusText: ${response.statusText}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[ALCHEMY] Error response body: ${errorBody.substring(0, 500)}`);
            return null;
        }

        const data = await response.json();
        console.log(`[ALCHEMY] Response data keys: ${Object.keys(data || {}).join(', ')}`);
        // DEBUG: Log the actual data.data structure
        console.log(`[ALCHEMY] data.data: ${JSON.stringify(data?.data || {}).substring(0, 1000)}`);
        console.log(`[ALCHEMY] cryptoPrice: ${data?.data?.cryptoPrice}, fiatAmount: ${data?.data?.fiatAmount}, cryptoAmount: ${data?.data?.cryptoAmount}`);

        let rate = 0;
        if (data?.data?.cryptoPrice) {
            rate = parseFloat(data.data.cryptoPrice);
        } else if (data?.data?.fiatAmount && data?.data?.cryptoAmount) {
            rate = parseFloat(data.data.fiatAmount) / parseFloat(data.data.cryptoAmount);
        }
        console.log(`[ALCHEMY] Calculated rate: ${rate}`);
        return rate > 1000 ? rate : null;
    } catch (error) {
        console.error('[ALCHEMY] Exception:', error);
        return null;
    }
}

// Bybit P2P API (Restoring user's specific fix)
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
            headers: MINIMAL_HEADERS
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
        // Fetch specific functions to keep scope clean
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
