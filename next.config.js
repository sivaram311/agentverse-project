/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API proxying is implemented as Route Handlers under src/app/api/{portal,css}/
  // so Authorization is forwarded explicitly (rewrites alone were insufficient for diagnosis).
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // DEV / public-IP: CORS effectively disabled
        { key: "Access-Control-Allow-Origin", value: "*" },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Authorization, Content-Type, Accept, X-Requested-With, X-API-Key",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
