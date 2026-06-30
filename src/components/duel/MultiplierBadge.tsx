'use client'

export interface MultiplierBadgeProps {
  readonly multiplier: number
}

export function MultiplierBadge({ multiplier }: MultiplierBadgeProps) {
  const active = multiplier > 1
  return (
    <span
      className={`font-mono text-sm font-semibold tabular-nums ${
        active ? 'text-accent' : 'text-muted-foreground'
      }`}
    >
      ×{multiplier}
    </span>
  )
}
