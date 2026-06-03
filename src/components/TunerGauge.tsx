'use client'

import { useMemo } from 'react'

export interface TunerGaugeProps {
  readonly cents: number | null
}

const ARC_RADIUS = 80
const CENTER_X = 100
const CENTER_Y = 100
const START_ANGLE_DEG = 220
const END_ANGLE_DEG = 320
const GREEN_ZONE_CENTS = 5
const MAX_CENTS = 50

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
  const needleTip = polarToCartesian(CENTER_X, CENTER_Y, ARC_RADIUS - 10, needleAngle)
  const inTune = cents !== null && Math.abs(cents) <= GREEN_ZONE_CENTS

  return (
    <svg
      viewBox="0 0 200 160"
      aria-label={
        cents !== null
          ? `Tuner gauge: ${cents.toFixed(0)} cents`
          : 'Tuner gauge: no signal'
      }
      role="img"
      className="w-full max-w-xs"
    >
      <path
        d={arcPath(CENTER_X, CENTER_Y, ARC_RADIUS, START_ANGLE_DEG, END_ANGLE_DEG)}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-muted-foreground/30"
        strokeLinecap="round"
      />
      <path
        d={arcPath(CENTER_X, CENTER_Y, ARC_RADIUS, greenStartAngle, greenEndAngle)}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-green-500"
        strokeLinecap="round"
      />
      <line
        x1={CENTER_X}
        y1={CENTER_Y}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="currentColor"
        strokeWidth="2"
        className={inTune ? 'text-green-500' : 'text-foreground'}
        strokeLinecap="round"
      />
      <circle cx={CENTER_X} cy={CENTER_Y} r="4" className="fill-foreground" />
      <text x="22" y="120" textAnchor="middle" fontSize="10" className="fill-muted-foreground">
        -50¢
      </text>
      <text x="100" y="18" textAnchor="middle" fontSize="10" className="fill-muted-foreground">
        0¢
      </text>
      <text x="178" y="120" textAnchor="middle" fontSize="10" className="fill-muted-foreground">
        +50¢
      </text>
    </svg>
  )
}
