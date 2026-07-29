import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Home from '@/app/page'

vi.mock('@/components/AdBanner', () => ({
  AdBanner: () => <div data-testid="ad-banner" />,
}))

describe('tuner homepage', () => {
  it('renders no ad unit — the page carries no publisher content', () => {
    const { queryByTestId } = render(<Home />)
    expect(queryByTestId('ad-banner')).toBeNull()
  })
})
