/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API proxying is implemented as Route Handlers under src/app/api/{portal,css}/
  // so Authorization is forwarded explicitly (rewrites alone were insufficient for diagnosis).
  headers: async () => [
    // Hashed bundles: long edge cache OK
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
        { key: "Access-Control-Allow-Origin", value: "*" },
      ],
    },
    // Everything else (HTML, health, APIs): never Cloudflare/browser-sticky
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // CORS fully open (disabled restriction) — public IP + CF host + phone browsers
        { key: "Access-Control-Allow-Origin", value: "*" },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value:
            "Authorization, Content-Type, Accept, X-Requested-With, X-API-Key, Origin",
        },
        { key: "Access-Control-Max-Age", value: "86400" },
        {
          key: "Cache-Control",
          value: "no-store, no-cache, must-revalidate, max-age=0",
        },
        { key: "CDN-Cache-Control", value: "no-store" },
        { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
      ],
    },
  ],
};

module.exports = nextConfig;
