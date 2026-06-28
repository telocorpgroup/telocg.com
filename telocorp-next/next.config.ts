import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'wsrv.nl' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'telocg.com' },
      { protocol: 'https', hostname: 'bhdictzvboiojyxorfiq.supabase.co' },
    ],
  },
}

export default nextConfig
