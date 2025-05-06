
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   // Removed env block - NEXT_PUBLIC_ variables are automatically available client-side
   // Ensure NEXT_PUBLIC_EXCHANGE_RATE_API_KEY is set in your environment (e.g., .env.local)
};

export default nextConfig;
