'use client'

import { HealthBar } from './HealthBar'
import { MultiplierBadge } from './MultiplierBadge'
import type { DuelPlayer, PlayerIndex } from '@/lib/duel/types'

export interface DuelHudProps {
  readonly players: readonly [DuelPlayer, DuelPlayer]
  readonly activePlayer: PlayerIndex | null
  readonly startingHp: number
}

const LABELS = ['P1', 'P2'] as const

export function DuelHud({ players, activePlayer, startingHp }: DuelHudProps) {
  return (
    <div className="flex w-full max-w-sm items-center gap-4">
      {players.map((player, i) => {
        const isActive = activePlayer === i
        const dimmed = activePlayer !== null && !isActive
        return (
          <div
            key={LABELS[i]}
            data-testid={`hud-player-${i}`}
            data-active={isActive}
            className={`flex flex-1 items-center gap-2 rounded-lg p-2 transition-all ${
              isActive ? 'ring-1 ring-accent' : ''
            } ${dimmed ? 'opacity-50' : ''}`}
          >
            <HealthBar label={LABELS[i]} hp={player.hp} maxHp={startingHp} />
            <MultiplierBadge multiplier={player.multiplier} />
          </div>
        )
      })}
    </div>
  )
}
