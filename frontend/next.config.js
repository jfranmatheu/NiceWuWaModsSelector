/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/preview/**',
      },
      {
        protocol: 'https',
        hostname: 'images.gamebanana.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.prydwen.gg',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 