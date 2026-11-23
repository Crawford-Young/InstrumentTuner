import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

// No Content-Security-Policy yet: AdSense's loader and its ad iframes need
// allow-list entries that only a production check can verify. The headers below are safe on every route.
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The tuner needs the microphone on this origin; nothing else gets it.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
