export const runtime = 'edge';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HISTORICAL_API = 'https://dashboard2.holdstation.com/public/question/f8d68d7d-ce0c-4abc-bf4d-e50fa980d7dd.json';

export async function GET(request: Request) {
    try {
        console.log('Fetching historical rates from:', HISTORICAL_API);

        const response = await fetch(HISTORICAL_API, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch historical data:', response.status, response.statusText);
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data rows:', data?.length || 0);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching historical rates:', errorMessage);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}

export async function OPTIONS(request: Request) {
    return new Response(null, { headers: corsHeaders });
}
