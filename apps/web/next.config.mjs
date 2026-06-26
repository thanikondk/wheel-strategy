/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@wheeldesk/core",
    "@wheeldesk/calculators",
    "@wheeldesk/risk-engine",
    "@wheeldesk/market-data",
    "@wheeldesk/technical-analysis",
    "@wheeldesk/fundamental-analysis",
    "@wheeldesk/options-engine",
    "@wheeldesk/scoring-engine",
    "@wheeldesk/market-regime",
    "@wheeldesk/cache",
    "@wheeldesk/notifications"
  ]
};

export default nextConfig;
