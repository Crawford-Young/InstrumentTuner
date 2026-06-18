import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuelSetup } from '@/components/duel/DuelSetup'

describe('DuelSetup', () => {
  it('defaults to tap mode and starts with it', async () => {
    const onStart = vi.fn()
    render(<DuelSetup onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /start match/i }))
    expect(onStart).toHaveBeenCalledWith('tap')
  })

  it('selecting guess mode starts with guess', async () => {
    const onStart = vi.fn()
    render(<DuelSetup onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /guess the bpm/i }))
    await userEvent.click(screen.getByRole('button', { name: /start match/i }))
    expect(onStart).toHaveBeenCalledWith('guess')
  })

  it('marks the selected mode pressed', async () => {
    render(<DuelSetup onStart={vi.fn()} />)
    const guess = screen.getByRole('button', { name: /guess the bpm/i })
    await userEvent.click(guess)
    expect(guess).toHaveAttribute('aria-pressed', 'true')
  })
})
