import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Disable in development so HMR works normally
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js 16 to use Turbopack for dev
  // and stops it from erroring when it sees Serwist's webpack plugin.
  // The webpack plugin only runs in production (Serwist is disabled in dev).
  turbopack: {},
}

export default withSerwist(nextConfig)
