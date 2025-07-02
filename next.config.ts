import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000', // Sesuaikan port jika berbeda
        pathname: '/storage/**', // Izinkan semua gambar dari folder storage
      },
    ],
  },
};

export default nextConfig;
