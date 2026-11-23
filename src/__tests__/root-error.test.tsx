import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import RootError from '@/app/error'

function makeError(): Error & { digest?: string } {
  return Object.assign(new Error('boom'), { digest: 'abc123' })
}

describe('RootError', () => {
  it('renders fallback with home link and digest', () => {
    render(<RootError error={makeError()} reset={() => {}} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Ref: abc123')).toBeInTheDocument()
  })

  it('invokes reset on retry click', () => {
    const reset = vi.fn()
    render(<RootError error={makeError()} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })
})
