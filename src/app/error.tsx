'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { RouteErrorFallback } from '@/lib/ui'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return <RouteErrorFallback error={error} reset={reset} homeHref="/" />
}
