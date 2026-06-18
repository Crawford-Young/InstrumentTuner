'use client'

export interface HealthBarProps {
  readonly label: string
  readonly hp: number
  readonly maxHp: number
}

export function HealthBar({ label, hp, maxHp }: HealthBarProps) {
  const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-baseline justify-between font-mono text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="tabular-nums">{hp}</span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} health`}
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={maxHp}
        className="h-3 w-full overflow-hidden rounded-full bg-muted-foreground/15"
      >
        <div
          data-testid="health-fill"
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
