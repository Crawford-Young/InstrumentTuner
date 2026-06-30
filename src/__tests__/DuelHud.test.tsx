import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DuelHud } from '@/components/duel/DuelHud'
import { STARTING_HP } from '@/lib/duel/types'

const players = [
  { hp: 160, wins: 0, multiplier: 1 },
  { hp: 90, wins: 2, multiplier: 3 },
] as const

describe('DuelHud', () => {
  it('renders both players with HP and multiplier', () => {
    render(<DuelHud players={players} activePlayer={0} startingHp={STARTING_HP} />)
    expect(screen.getByText('P1')).toBeInTheDocument()
    expect(screen.getByText('P2')).toBeInTheDocument()
    expect(screen.getByText('160')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText('×1')).toBeInTheDocument()
    expect(screen.getByText('×3')).toBeInTheDocument()
  })

  it('rings the active player and not the other', () => {
    render(<DuelHud players={players} activePlayer={1} startingHp={STARTING_HP} />)
    expect(screen.getByTestId('hud-player-1')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('hud-player-1').className).toContain('ring-accent')
    expect(screen.getByTestId('hud-player-0')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('hud-player-0').className).not.toContain('ring-accent')
  })

  it('rings neither when activePlayer is null', () => {
    render(<DuelHud players={players} activePlayer={null} startingHp={STARTING_HP} />)
    expect(screen.getByTestId('hud-player-0')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('hud-player-1')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('hud-player-0').className).not.toContain('ring-accent')
  })
})
