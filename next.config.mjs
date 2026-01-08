/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility

  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // For purely static export if needed, effectively simpler for CF sometimes, but strictly 'export' output might be what we want if we weren't using the adapter. 
    // With @cloudflare/next-on-pages, we don't necessarily need unoptimized, but it's safer for assets if we don't have image optimization worker setup.
    // Let's keep it unoptimized for now to match SPA behavior closely.
  }
};

export default nextConfig;
