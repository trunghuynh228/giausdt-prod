# Vercel Proxy for Binance & AlchemyPay

This is a simple Vercel Edge Function project that proxies requests to Binance P2P and AlchemyPay APIs. Deploy this to bypass IP blocking from Cloudflare.

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to this folder**:
   ```bash
   cd vercel-proxy
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```
   
   - When prompted, create a new project
   - Accept all defaults
   - Note the deployment URL (e.g., `https://giausdt-proxy.vercel.app`)

4. **Test the endpoints**:
   ```bash
   curl https://YOUR-VERCEL-URL/api/binance
   curl https://YOUR-VERCEL-URL/api/alchemy
   ```

## API Endpoints

| Endpoint | Returns |
|----------|---------|
| `/api/binance` | `{ binance: number \| null, timestamp: string }` |
| `/api/alchemy` | `{ alchemy: number \| null, timestamp: string }` |

## After Deployment

Update the main app's `route.ts` to use these proxy URLs as fallback when Cloudflare fails.
