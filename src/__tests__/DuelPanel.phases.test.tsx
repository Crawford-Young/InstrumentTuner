import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DuelMatch } from '@/hooks/useDuelMatch'
import type { DuelState, RoundResult } from '@/lib/duel/types'

let mockMatch: DuelMatch

vi.mock('@/hooks/useDuelMatch', () => ({
  useDuelMatch: () => mockMatch,
}))

// Imported after the mock is registered.
import { DuelPanel } from '@/components/duel/DuelPanel'

const baseState: DuelState = {
  phase: 'setup',
  mode: 'tap',
  target: 120,
  players: [
    { hp: 160, wins: 0, multiplier: 1 },
    { hp: 160, wins: 0, multiplier: 1 },
  ],
  p1Answer: null,
  p2Answer: null,
  lastResult: null,
  roundNumber: 1,
}

const result: RoundResult = {
  target: 120, p1Answer: 120, p2Answer: 140,
  p1Distance: 0, p2Distance: 20, winner: 0, damage: 20, defeated: false,
}

function makeMatch(state: DuelState): DuelMatch {
  return {
    state,
    startMatch: vi.fn(),
    submit: vi.fn(),
    nextRound: vi.fn(),
    rematch: vi.fn(),
  }
}

describe('DuelPanel phases', () => {
  it('renders P2 turn in p2-turn phase', () => {
    mockMatch = makeMatch({ ...baseState, phase: 'p2-turn' })
    render(<DuelPanel />)
    expect(screen.getByText(/P2's turn/i)).toBeInTheDocument()
  })

  it('renders the reveal screen in reveal phase', () => {
    mockMatch = makeMatch({ ...baseState, phase: 'reveal', lastResult: result })
    render(<DuelPanel />)
    expect(screen.getByText(/P1 wins/i)).toBeInTheDocument()
  })

  it('renders victory for P1 when winner is 0', () => {
    mockMatch = makeMatch({
      ...baseState,
      phase: 'victory',
      roundNumber: 4,
      lastResult: { ...result, defeated: true, winner: 0 },
    })
    render(<DuelPanel />)
    expect(screen.getByText(/P1 wins/i)).toBeInTheDocument()
    expect(screen.getByText(/4 rounds/i)).toBeInTheDocument()
  })

  it('renders victory for P2 and Exit reloads the page', async () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload },
      writable: true,
    })
    mockMatch = makeMatch({
      ...baseState,
      phase: 'victory',
      roundNumber: 6,
      lastResult: { ...result, defeated: true, winner: 1 },
    })
    render(<DuelPanel />)
    expect(screen.getByText(/P2 wins/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /exit/i }))
    expect(reload).toHaveBeenCalled()
  })
})
