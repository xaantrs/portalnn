/** @type {import('next').NextConfig} */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

const nextConfig = {
  reactStrictMode: true,
  
  async rewrites() {
    return [
      {
        // Mantém apenas o rewrite da autenticação, 
        // que é a única coisa que o backend Flask fará.
        source: '/api/auth/:path*', 
        destination: `${BACKEND_API_URL}/api/auth/:path*`, 
      }
      // A rota '/api/consulta-sql' foi REMOVIDA daqui,
      // pois será tratada pelo arquivo 'frontend/app/api/consulta-sql/route.ts'
    ];
  },
};

module.exports = nextConfig;