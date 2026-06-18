'use client'

import { useState } from 'react'
import { Button } from '@/lib/ui'
import { useTapTempo, type UseTapTempoOptions, type TapTempo } from '@/hooks/useTapTempo'
import { useTempoPlayback, type TempoPlayback } from '@/hooks/useTempoPlayback'
import { MIN_TARGET_BPM, MAX_TARGET_BPM, type DuelMode } from '@/lib/duel/types'

const REQUIRED_TAPS = 4
const PLAYBACK_BEATS = 8
const MAX_REPLAYS = 1
const DEFAULT_GUESS = Math.round((MIN_TARGET_BPM + MAX_TARGET_BPM) / 2)

export interface DuelTurnProps {
  readonly player: string
  readonly mode: DuelMode
  readonly target: number
  readonly onSubmit: (answer: number) => void
  readonly useTapTempoImpl?: (opts: UseTapTempoOptions) => TapTempo
  readonly useTempoPlaybackImpl?: () => TempoPlayback
}

export function DuelTurn({
  player,
  mode,
  target,
  onSubmit,
  useTapTempoImpl = useTapTempo,
  useTempoPlaybackImpl = useTempoPlayback,
}: DuelTurnProps) {
  const [revealed, setRevealed] = useState(false)
  const [guess, setGuess] = useState(DEFAULT_GUESS)
  const [replaysLeft, setReplaysLeft] = useState(MAX_REPLAYS + 1)

  const tapTempo = useTapTempoImpl({ requiredTaps: REQUIRED_TAPS, onComplete: onSubmit })
  const playback = useTempoPlaybackImpl()

  if (!revealed) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <p className="text-lg font-semibold text-foreground">{player} &apos;s turn</p>
        <p className="text-sm text-muted-foreground">
          Other player, look away. Press Ready when {player} is set.
        </p>
        <Button
          size="lg"
          onClick={() => setRevealed(true)}
          className="w-40 rounded-full font-mono text-xs tracking-widest uppercase"
        >
          Ready
        </Button>
      </div>
    )
  }

  if (mode === 'tap') {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/60">
          Tap this tempo
        </p>
        <p className="text-7xl font-bold tabular-nums tracking-tight text-foreground">{target}</p>
        <p className="font-mono text-xs text-muted-foreground/60">
          {tapTempo.tapCount}/{REQUIRED_TAPS} taps
        </p>
        <Button
          size="lg"
          onClick={tapTempo.tap}
          className="h-28 w-28 rounded-full font-mono text-sm tracking-widest uppercase"
        >
          Tap
        </Button>
      </div>
    )
  }

  // guess mode
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/60">
        Guess the tempo
      </p>
      <Button
        size="lg"
        disabled={replaysLeft <= 0}
        onClick={() => {
          playback.play(target, PLAYBACK_BEATS)
          setReplaysLeft((n) => n - 1)
        }}
        className="w-40 rounded-full font-mono text-xs tracking-widest uppercase"
      >
        Listen{replaysLeft <= MAX_REPLAYS ? ` (${replaysLeft} left)` : ''}
      </Button>

      <div className="w-full">
        <p className="mb-2 text-4xl font-bold tabular-nums text-foreground">{guess}</p>
        <input
          type="range"
          min={MIN_TARGET_BPM}
          max={MAX_TARGET_BPM}
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          aria-label="Your guess"
          className="w-full accent-accent"
        />
      </div>

      <Button
        size="lg"
        onClick={() => onSubmit(guess)}
        className="w-40 rounded-full font-mono text-xs tracking-widest uppercase"
      >
        Submit
      </Button>
    </div>
  )
}
