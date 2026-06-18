import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuelVictory } from '@/components/duel/DuelVictory'

describe('DuelVictory', () => {
  it('names the winner and round count', () => {
    render(<DuelVictory winner="P2" rounds={5} onRematch={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/P2 wins/i)).toBeInTheDocument()
    expect(screen.getByText(/5 rounds/i)).toBeInTheDocument()
  })

  it('Rematch and Exit fire callbacks', async () => {
    const onRematch = vi.fn()
    const onExit = vi.fn()
    render(<DuelVictory winner="P1" rounds={3} onRematch={onRematch} onExit={onExit} />)
    await userEvent.click(screen.getByRole('button', { name: /rematch/i }))
    await userEvent.click(screen.getByRole('button', { name: /exit/i }))
    expect(onRematch).toHaveBeenCalled()
    expect(onExit).toHaveBeenCalled()
  })
})
