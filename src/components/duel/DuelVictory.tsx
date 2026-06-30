'use client'

import { Button } from '@/lib/ui'

export interface DuelVictoryProps {
  readonly winner: string
  readonly rounds: number
  readonly onRematch: () => void
  readonly onExit: () => void
}

export function DuelVictory({ winner, rounds, onRematch, onExit }: DuelVictoryProps) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
        Match over
      </p>
      <p className="text-4xl font-bold tracking-tight text-accent">{winner} wins</p>
      <p className="text-sm text-muted-foreground">{rounds} rounds played</p>
      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={onRematch}
          className="w-28 rounded-full font-mono text-xs tracking-widest uppercase"
        >
          Rematch
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onExit}
          className="w-28 rounded-full font-mono text-xs tracking-widest uppercase"
        >
          Exit
        </Button>
      </div>
    </div>
  )
}
