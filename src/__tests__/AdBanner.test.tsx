import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { AdBanner } from '@/components/AdBanner'

function stubAdsEnv(): void {
  vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', 'ca-pub-test123')
  vi.stubEnv('NEXT_PUBLIC_ADSENSE_SLOT', '9999999999')
}

afterEach(() => {
  vi.unstubAllEnvs()
  delete (window as { adsbygoogle?: unknown }).adsbygoogle
})

describe('AdBanner', () => {
  it('renders nothing when env vars are unset', () => {
    const { container } = render(<AdBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when only the client id is set', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', 'ca-pub-test123')
    const { container } = render(<AdBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the ad unit with client and slot attributes when enabled', () => {
    stubAdsEnv()
    const { container } = render(<AdBanner />)
    const ins = container.querySelector('ins.adsbygoogle')
    expect(ins).not.toBeNull()
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-test123')
    expect(ins).toHaveAttribute('data-ad-slot', '9999999999')
    expect(ins).toHaveAttribute('data-ad-format', 'horizontal')
    expect(ins).toHaveAttribute('data-full-width-responsive', 'true')
  })

  it('pushes to adsbygoogle exactly once across rerenders', () => {
    stubAdsEnv()
    const push = vi.fn()
    ;(window as { adsbygoogle?: { push: typeof push } }).adsbygoogle = { push }
    const { rerender } = render(<AdBanner />)
    rerender(<AdBanner />)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('initialises the adsbygoogle queue when the loader has not arrived', () => {
    stubAdsEnv()
    render(<AdBanner />)
    const queue = (window as { adsbygoogle?: unknown[] }).adsbygoogle
    expect(Array.isArray(queue)).toBe(true)
    expect(queue).toHaveLength(1)
  })

  it('swallows a throwing push (ad blocker)', () => {
    stubAdsEnv()
    ;(window as { adsbygoogle?: { push: () => void } }).adsbygoogle = {
      push: () => {
        throw new Error('blocked')
      },
    }
    expect(() => render(<AdBanner />)).not.toThrow()
  })
})
