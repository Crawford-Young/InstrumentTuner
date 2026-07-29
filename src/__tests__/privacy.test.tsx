import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacyPage from '@/app/privacy/page'

describe('PrivacyPage', () => {
  it('renders the policy heading', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('heading', { name: /privacy policy/i, level: 1 })).toBeInTheDocument()
  })

  it('discloses Google as a third-party ad vendor', () => {
    render(<PrivacyPage />)
    expect(screen.getAllByText(/third-party vendor/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/DoubleClick/i)).toBeInTheDocument()
  })

  it('links to the Google ads opt-out', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('link', { name: /ads settings/i })).toHaveAttribute(
      'href',
      'https://www.google.com/settings/ads'
    )
  })

  it('links to Google advertising policies', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('link', { name: /advertising policies/i })).toHaveAttribute(
      'href',
      'https://policies.google.com/technologies/ads'
    )
  })

  it('states that microphone audio never leaves the browser', () => {
    render(<PrivacyPage />)
    expect(screen.getByText(/never transmitted/i)).toBeInTheDocument()
  })

  it('covers GDPR and CCPA rights', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('heading', { name: /GDPR/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /CCPA/i })).toBeInTheDocument()
  })

  it('publishes a contact address', () => {
    render(<PrivacyPage />)
    expect(
      screen.getAllByRole('link', { name: /hello@crawfordyoung\.dev/i }).length
    ).toBeGreaterThan(0)
  })
})
