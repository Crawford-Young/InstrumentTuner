import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuelVictory } from '@/components/duel/DuelVictory'
import type { RoundResult } from '@/lib/duel/types'

const result: RoundResult = {
  target: 128, p1Answer: 130, p2Answer: 90,
  p1Distance: 2, p2Distance: 38, winner: 0, gap: 36, multiplier: 2, damage: 72, defeated: true,
}

describe('DuelVictory', () => {
  it('names the winner and round count', () => {
    render(<DuelVictory winner="P2" rounds={5} result={result} onRematch={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/P2 wins/i)).toBeInTheDocument()
    expect(screen.getByText(/5 rounds/i)).toBeInTheDocument()
  })

  it('shows the final round target, both answers and distances', () => {
    render(<DuelVictory winner="P1" rounds={3} result={result} onRematch={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/Final round · Target 128/i)).toBeInTheDocument()
    expect(screen.getByText(/P1 130 · off 2/)).toBeInTheDocument()
    expect(screen.getByText(/P2 90 · off 38/)).toBeInTheDocument()
  })

  it('shows the damage math for the final round', () => {
    render(<DuelVictory winner="P1" rounds={3} result={result} onRematch={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/36 gap × ×2 = 72 damage/)).toBeInTheDocument()
  })

  it('Rematch and Exit fire callbacks', async () => {
    const onRematch = vi.fn()
    const onExit = vi.fn()
    render(<DuelVictory winner="P1" rounds={3} result={result} onRematch={onRematch} onExit={onExit} />)
    await userEvent.click(screen.getByRole('button', { name: /rematch/i }))
    await userEvent.click(screen.getByRole('button', { name: /exit/i }))
    expect(onRematch).toHaveBeenCalled()
    expect(onExit).toHaveBeenCalled()
  })
})
