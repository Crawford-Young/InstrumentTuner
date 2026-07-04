'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: { push(entry: object): void }
  }
}

export function AdBanner(): React.ReactNode {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT
  const enabled = Boolean(client && slot)
  const pushed = useRef(false)

  useEffect(() => {
    if (!enabled || pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle ?? ([] as object[])).push({})
    } catch {
      // Loader blocked (ad blocker) — the reserved space stays empty.
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="h-14 w-full sm:h-24">
      <ins
        className="adsbygoogle block h-full w-full"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  )
}
