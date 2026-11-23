import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import GlobalError from '@/app/global-error'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
import * as Sentry from '@sentry/nextjs'

function makeError(): Error & { digest?: string } {
  return Object.assign(new Error('boom'), { digest: 'abc123' })
}

describe('GlobalError', () => {
  it('renders fallback with home link and digest, and captures to Sentry', () => {
    const error = makeError()
    render(<GlobalError error={error} reset={() => {}} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Ref: abc123')).toBeInTheDocument()
    expect(vi.mocked(Sentry.captureException)).toHaveBeenCalledWith(error)
  })

  it('invokes reset on retry click', () => {
    const reset = vi.fn()
    render(<GlobalError error={makeError()} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })
})
