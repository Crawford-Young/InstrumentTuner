'use client'

export interface MetronomeBeatProps {
  readonly currentBeat: number
  readonly beatsPerMeasure: number
  readonly isPlaying: boolean
}

export function MetronomeBeat({ currentBeat, beatsPerMeasure, isPlaying }: MetronomeBeatProps) {
  return (
    <div role="group" aria-label="Beat indicator" className="flex items-center gap-3">
      {Array.from({ length: beatsPerMeasure }, (_, i) => {
        const isActive = isPlaying && i === currentBeat
        const isAccent = i === 0
        return (
          <div
            key={i}
            aria-label={`Beat ${i + 1}${isAccent ? ' accent' : ''}`}
            className={[
              'h-4 w-4 rounded-full transition-all duration-75',
              isActive && isAccent ? 'scale-125 bg-accent' :
              isActive           ? 'scale-110 bg-foreground' :
              isAccent           ? 'bg-accent/30' :
                                   'bg-muted-foreground/20',
            ].join(' ')}
          />
        )
      })}
    </div>
  )
}
