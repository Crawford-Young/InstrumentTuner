import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { GuideAdSlot } from '@/components/GuideAdSlot'
import { MIN_GUIDE_WORDS } from '@/lib/guide-content'

function stubAdsEnv(): void {
  vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', 'ca-pub-test123')
  vi.stubEnv('NEXT_PUBLIC_ADSENSE_SLOT', '9999999999')
}

afterEach(() => {
  vi.unstubAllEnvs()
  delete (window as { adsbygoogle?: unknown }).adsbygoogle
})

describe('GuideAdSlot', () => {
  it('renders no ad below the content floor even with ads configured', () => {
    stubAdsEnv()
    const { container } = render(<GuideAdSlot wordCount={MIN_GUIDE_WORDS - 1} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the ad unit at the floor when ads are configured', () => {
    stubAdsEnv()
    const { container } = render(<GuideAdSlot wordCount={MIN_GUIDE_WORDS} />)
    expect(container.querySelector('ins.adsbygoogle')).not.toBeNull()
  })

  it('renders nothing when ads are not configured', () => {
    const { container } = render(<GuideAdSlot wordCount={MIN_GUIDE_WORDS} />)
    expect(container).toBeEmptyDOMElement()
  })
})
