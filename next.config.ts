import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import { withSentryConfig } from '@sentry/nextjs'

// No Content-Security-Policy yet: AdSense's loader, its ad iframes and the
// Sentry tunnel all need allow-list entries that only a production check can
// verify. The headers below are safe on every route.
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

export default withSentryConfig(withMDX(nextConfig), {
  org: 'crawford-young',
  project: 'instrumenttuner',
  // Source maps upload only when SENTRY_AUTH_TOKEN is set (Vercel production).
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Route browser events through this origin so ad-blockers don't drop them.
  tunnelRoute: '/monitoring',
})
