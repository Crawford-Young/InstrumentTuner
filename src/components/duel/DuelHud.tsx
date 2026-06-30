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
    <div className="pointer-events-none fixed inset-x-0 top-20 z-20 flex justify-between gap-4 px-4 sm:px-6">
      {players.map((player, i) => {
        const isActive = activePlayer === i
        return (
          <div
            key={LABELS[i]}
            data-testid={`hud-player-${i}`}
            data-active={isActive}
            className={`flex w-64 items-center gap-3 rounded-xl bg-background/70 p-3 backdrop-blur-sm transition-all ${
              isActive ? 'ring-2 ring-accent' : 'ring-1 ring-border/40'
            }`}
          >
            <HealthBar label={LABELS[i]} hp={player.hp} maxHp={startingHp} />
            <MultiplierBadge multiplier={player.multiplier} />
          </div>
        )
      })}
    </div>
  )
}
