'use client'

import { useMemo } from 'react'

export interface TunerGaugeProps {
  readonly cents: number | null
}

const ARC_RADIUS = 110
const CENTER_X = 140
const CENTER_Y = 150
const START_ANGLE_DEG = 220
const END_ANGLE_DEG = 320
const GREEN_ZONE_CENTS = 5
const MAX_CENTS = 50
const TICK_CENTS = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = degreesToRadians(angleDeg)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polarToCartesian(cx, cy, r, startDeg)
  const end = polarToCartesian(cx, cy, r, endDeg)
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

export function centsToAngle(cents: number): number {
  const clamped = Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents))
  const ratio = (clamped + MAX_CENTS) / (MAX_CENTS * 2)
  return START_ANGLE_DEG + ratio * (END_ANGLE_DEG - START_ANGLE_DEG)
}

export function TunerGauge({ cents }: TunerGaugeProps) {
  const needleAngle = useMemo(
    () => (cents === null ? (START_ANGLE_DEG + END_ANGLE_DEG) / 2 : centsToAngle(cents)),
    [cents],
  )

  const greenStartAngle = centsToAngle(-GREEN_ZONE_CENTS)
  const greenEndAngle = centsToAngle(GREEN_ZONE_CENTS)
  const needleTip = polarToCartesian(CENTER_X, CENTER_Y, ARC_RADIUS - 14, needleAngle)
  const inTune = cents !== null && Math.abs(cents) <= GREEN_ZONE_CENTS

  return (
    <svg
      viewBox="0 0 280 175"
      aria-label={
        cents !== null
          ? `Tuner gauge: ${cents.toFixed(0)} cents`
          : 'Tuner gauge: no signal'
      }
      role="img"
      className="w-full max-w-[260px]"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <path
        d={arcPath(CENTER_X, CENTER_Y, ARC_RADIUS, START_ANGLE_DEG, END_ANGLE_DEG)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-muted-foreground/20"
      />

      {/* Green zone */}
      <path
        d={arcPath(CENTER_X, CENTER_Y, ARC_RADIUS, greenStartAngle, greenEndAngle)}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        className="text-accent/70"
        strokeLinecap="round"
      />

      {/* Needle — must be first <line> for tests */}
      <line
        x1={CENTER_X}
        y1={CENTER_Y}
        x2={needleTip.x.toFixed(2)}
        y2={needleTip.y.toFixed(2)}
        stroke="currentColor"
        strokeWidth="1.5"
        className={inTune ? 'text-green-500' : 'text-foreground/80'}
        strokeLinecap="round"
        filter={inTune ? 'url(#glow)' : undefined}
      />

      {/* Pivot */}
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r="5"
        className={inTune ? 'fill-green-500' : 'fill-foreground/80'}
        filter={inTune ? 'url(#glow)' : undefined}
      />
      <circle cx={CENTER_X} cy={CENTER_Y} r="2" className="fill-background" />

      {/* Tick marks */}
      {TICK_CENTS.map((tick) => {
        const angle = centsToAngle(tick)
        const isMajor = tick === 0
        const isMid = tick % 20 === 0
        const tickLen = isMajor ? 14 : isMid ? 10 : 6
        const outer = polarToCartesian(CENTER_X, CENTER_Y, ARC_RADIUS, angle)
        const inner = polarToCartesian(CENTER_X, CENTER_Y, ARC_RADIUS - tickLen, angle)
        return (
          <line
            key={tick}
            x1={outer.x.toFixed(2)}
            y1={outer.y.toFixed(2)}
            x2={inner.x.toFixed(2)}
            y2={inner.y.toFixed(2)}
            stroke="currentColor"
            strokeWidth={isMajor ? 2 : isMid ? 1.5 : 1}
            className={tick === 0 ? 'text-muted-foreground/70' : 'text-muted-foreground/30'}
            strokeLinecap="round"
          />
        )
      })}

      {/* Labels */}
      <text x="45" y="76" textAnchor="middle" fontSize="9" className="fill-muted-foreground/50">
        -50¢
      </text>
      <text x="140" y="28" textAnchor="middle" fontSize="9" className="fill-muted-foreground/50">
        0¢
      </text>
      <text x="235" y="76" textAnchor="middle" fontSize="9" className="fill-muted-foreground/50">
        +50¢
      </text>
    </svg>
  )
}
