'use client'

import { useState } from 'react'
import { Button } from '@/lib/ui'
import type { DuelMode } from '@/lib/duel/types'

export interface DuelSetupProps {
  readonly onStart: (mode: DuelMode) => void
}

const MODES: ReadonlyArray<{ id: DuelMode; label: string; hint: string }> = [
  { id: 'tap', label: 'Tap the BPM', hint: 'A number appears — tap that tempo.' },
  { id: 'guess', label: 'Guess the BPM', hint: 'Hear a tempo — guess the number.' },
]

export function DuelSetup({ onStart }: DuelSetupProps) {
  const [mode, setMode] = useState<DuelMode>('tap')
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Duel</h1>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          Local · First to 0 HP
        </p>
      </div>

      <div role="group" aria-label="Game mode" className="flex w-full flex-col gap-3">
        {MODES.map((m) => (
          <Button
            key={m.id}
            variant={mode === m.id ? 'default' : 'outline'}
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className="flex h-auto flex-col items-start gap-1 px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold">{m.label}</span>
            <span className="text-xs font-normal opacity-70">{m.hint}</span>
          </Button>
        ))}
      </div>

      <Button
        size="lg"
        onClick={() => onStart(mode)}
        className="w-40 rounded-full font-mono text-xs tracking-widest uppercase"
      >
        Start Match
      </Button>
    </div>
  )
}
