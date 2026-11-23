// Sentry in the browser. Env-gated: an empty NEXT_PUBLIC_SENTRY_DSN disables it.
// No session replay: the tuner holds a live microphone stream, and replay adds
// weight to a page that must stay Lighthouse-100.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  enableLogs: true,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
