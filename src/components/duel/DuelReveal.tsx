'use client'

import { Button } from '@/lib/ui'
import type { RoundResult } from '@/lib/duel/types'

export interface DuelRevealProps {
  readonly result: RoundResult
  readonly onNext: () => void
}

export function DuelReveal({ result, onNext }: DuelRevealProps) {
  const winnerLabel = result.winner === null ? null : result.winner === 0 ? 'P1' : 'P2'
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
        Target <span>{result.target}</span>
      </p>

      <div className="flex w-full justify-between font-mono text-sm tabular-nums">
        <span>P1 {result.p1Answer} · off {result.p1Distance}</span>
        <span>P2 {result.p2Answer} · off {result.p2Distance}</span>
      </div>

      {winnerLabel ? (
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold text-accent">{winnerLabel} wins</p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {result.gap} gap × ×{result.multiplier} = {result.damage} damage
          </p>
        </div>
      ) : (
        <p className="text-lg font-semibold text-muted-foreground">Tie — no damage</p>
      )}

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
