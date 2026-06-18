import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuelReveal } from '@/components/duel/DuelReveal'
import { initialPlayer } from '@/lib/duel/scoring'
import type { RoundResult } from '@/lib/duel/types'

const result: RoundResult = {
  target: 120, p1Answer: 120, p2Answer: 140,
  p1Distance: 0, p2Distance: 20, winner: 0, damage: 20, defeated: false,
}

describe('DuelReveal', () => {
  it('shows target, both distances, winner and damage', () => {
    render(
      <DuelReveal
        result={result}
        players={[initialPlayer(), { hp: 140, wins: 0, multiplier: 1 }]}
        onNext={vi.fn()}
      />,
    )
    expect(screen.getByText(/target/i)).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText(/P1 wins/i)).toBeInTheDocument()
    expect(screen.getByText(/20 damage/i)).toBeInTheDocument()
  })

  it('renders a tie banner when winner is null', () => {
    const tie: RoundResult = { ...result, winner: null, damage: 0, p2Distance: 0 }
    render(
      <DuelReveal
        result={tie}
        players={[initialPlayer(), initialPlayer()]}
        onNext={vi.fn()}
      />,
    )
    expect(screen.getByText(/tie/i)).toBeInTheDocument()
  })

  it('names P2 as winner when winner is 1', () => {
    const p2Win: RoundResult = { ...result, winner: 1, p1Distance: 20, p2Distance: 0 }
    render(
      <DuelReveal
        result={p2Win}
        players={[{ hp: 140, wins: 0, multiplier: 1 }, initialPlayer()]}
        onNext={vi.fn()}
      />,
    )
    expect(screen.getByText(/P2 wins/i)).toBeInTheDocument()
  })

  it('Next Round fires onNext', async () => {
    const onNext = vi.fn()
    render(
      <DuelReveal result={result} players={[initialPlayer(), initialPlayer()]} onNext={onNext} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /next round/i }))
    expect(onNext).toHaveBeenCalled()
  })
})
