/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  reactStrictMode: true,

  // Static export requires unoptimized images (no Next.js image server)
  images: {
    unoptimized: true,
  },

  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
}

module.exports = nextConfig
