import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StringSelector } from '@/components/StringSelector'
import type { StringTuning } from '@/lib/instruments'

const strings: StringTuning[] = [
  { name: 'E2', frequency: 82.41 },
  { name: 'A2', frequency: 110.0 },
  { name: 'D3', frequency: 146.83 },
]

describe('StringSelector', () => {
  it('renders a button for each string', () => {
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={null}
        lockedIndex={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /E2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /A2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /D3/i })).toBeInTheDocument()
  })

  it('highlights auto-detected string', () => {
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={1}
        lockedIndex={null}
        onSelect={vi.fn()}
      />,
    )
    const a2 = screen.getByRole('button', { name: /A2/i })
    expect(a2.className).toMatch(/bg-primary/)
  })

  it('locked string has aria-pressed true', () => {
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={0}
        lockedIndex={0}
        onSelect={vi.fn()}
      />,
    )
    const e2 = screen.getByRole('button', { name: /E2/i })
    expect(e2).toHaveAttribute('aria-pressed', 'true')
  })

  it('unlocked strings have aria-pressed false', () => {
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={null}
        lockedIndex={null}
        onSelect={vi.fn()}
      />,
    )
    const e2 = screen.getByRole('button', { name: /E2/i })
    expect(e2).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with index when clicking unlocked string', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={null}
        lockedIndex={null}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: /A2/i }))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('calls onSelect with null when clicking already-locked string (unlock)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={null}
        lockedIndex={2}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: /D3/i }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('locked string takes priority over auto-detected for active highlight', () => {
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={0}
        lockedIndex={1}
        onSelect={vi.fn()}
      />,
    )
    const a2 = screen.getByRole('button', { name: /A2/i })
    const e2 = screen.getByRole('button', { name: /E2/i })
    expect(a2.className).toMatch(/bg-primary/)
    expect(e2.className).not.toMatch(/ring-primary/)
  })

  it('has accessible group label', () => {
    render(
      <StringSelector
        strings={strings}
        autoDetectedIndex={null}
        lockedIndex={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('group', { name: /string selector/i })).toBeInTheDocument()
  })
})
