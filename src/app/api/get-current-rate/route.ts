export const runtime = 'edge';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HOLDSTATION_API = 'https://iakzvzwriyxyshfggbwu.supabase.co/functions/v1/get_exchange_rates';

export async function GET(request: Request) {
    try {
        console.log('Fetching current rate from:', HOLDSTATION_API);

        const response = await fetch(HOLDSTATION_API, { cache: 'no-store' });

        if (!response.ok) {
            console.error('Holdstation API error:', response.status, response.statusText);
            throw new Error(`Failed to fetch from Holdstation: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received current rate data:', JSON.stringify(data));

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching current rate:', errorMessage);

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

export async function OPTIONS(request: Request) {
    return new Response(null, { headers: corsHeaders });
}
