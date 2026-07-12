/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API proxying is implemented as Route Handlers under src/app/api/{portal,css}/
  // so Authorization is forwarded explicitly (rewrites alone were insufficient for diagnosis).
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

module.exports = nextConfig;
