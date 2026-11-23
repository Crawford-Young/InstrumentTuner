// Sentry on the server. Env-gated: an empty SENTRY_DSN means Sentry.init is a
// no-op, so dev, CI and e2e never report.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  enableLogs: true,
})
