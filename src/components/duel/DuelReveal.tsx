'use client'

import { Button } from '@/lib/ui'
import { HealthBar } from './HealthBar'
import { MultiplierBadge } from './MultiplierBadge'
import { STARTING_HP, type DuelPlayer, type RoundResult } from '@/lib/duel/types'

export interface DuelRevealProps {
  readonly result: RoundResult
  readonly players: readonly [DuelPlayer, DuelPlayer]
  readonly onNext: () => void
}

export function DuelReveal({ result, players, onNext }: DuelRevealProps) {
  const winnerLabel = result.winner === null ? null : result.winner === 0 ? 'P1' : 'P2'
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/60">
        Target <span>{result.target}</span>
      </p>

      <div className="flex w-full justify-between font-mono text-sm tabular-nums">
        <span>P1 {result.p1Answer} · off {result.p1Distance}</span>
        <span>P2 {result.p2Answer} · off {result.p2Distance}</span>
      </div>

      {winnerLabel ? (
        <p className="text-lg font-semibold text-accent">
          {winnerLabel} wins — {result.damage} damage
        </p>
      ) : (
        <p className="text-lg font-semibold text-muted-foreground">Tie — no damage</p>
      )}

      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <HealthBar label="P1" hp={players[0].hp} maxHp={STARTING_HP} />
          <MultiplierBadge multiplier={players[0].multiplier} />
        </div>
        <div className="flex items-center gap-2">
          <HealthBar label="P2" hp={players[1].hp} maxHp={STARTING_HP} />
          <MultiplierBadge multiplier={players[1].multiplier} />
        </div>
      </div>

      <Button
        size="lg"
        onClick={onNext}
        className="w-40 rounded-full font-mono text-xs tracking-widest uppercase"
      >
        Next Round
      </Button>
    </div>
  )
}
