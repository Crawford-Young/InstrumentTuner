import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  TunerGauge,
  arcPath,
  degreesToRadians,
  polarToCartesian,
  centsToAngle,
} from '@/components/TunerGauge'

describe('TunerGauge', () => {
  it('renders an SVG with accessible label', () => {
    render(<TunerGauge cents={0} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('shows "no signal" in aria-label when cents is null', () => {
    render(<TunerGauge cents={null} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('no signal'))
  })

  it('shows cents value in aria-label when provided', () => {
    render(<TunerGauge cents={-20} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('-20'))
  })

  it('renders the background arc path', () => {
    const { container } = render(<TunerGauge cents={0} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2) // background + green zone
  })

  it('renders needle line element', () => {
    const { container } = render(<TunerGauge cents={0} />)
    expect(container.querySelector('line')).toBeInTheDocument()
  })

  it('renders cent labels for -50, 0, +50', () => {
    render(<TunerGauge cents={0} />)
    expect(screen.getByText('-50¢')).toBeInTheDocument()
    expect(screen.getByText('0¢')).toBeInTheDocument()
    expect(screen.getByText('+50¢')).toBeInTheDocument()
  })

  it('needle has green color class when in tune (|cents| <= 5)', () => {
    const { container } = render(<TunerGauge cents={3} />)
    const needle = container.querySelector('line')
    expect(needle?.getAttribute('class')).toContain('text-green-500')
  })

  it('needle does not have green color class when out of tune', () => {
    const { container } = render(<TunerGauge cents={20} />)
    const needle = container.querySelector('line')
    expect(needle?.getAttribute('class')).not.toContain('text-green-500')
  })

  it('clamps cents outside ±50 without throwing', () => {
    expect(() => render(<TunerGauge cents={200} />)).not.toThrow()
    expect(() => render(<TunerGauge cents={-200} />)).not.toThrow()
  })

  it('needle points to center when cents is null', () => {
    const { container } = render(<TunerGauge cents={null} />)
    const needle = container.querySelector('line')
    expect(needle).toBeInTheDocument()
  })
})

describe('TunerGauge utility functions', () => {
  it('degreesToRadians converts 180 degrees to pi', () => {
    const result = degreesToRadians(180)
    expect(result).toBeCloseTo(Math.PI)
  })

  it('degreesToRadians converts 90 degrees to pi/2', () => {
    const result = degreesToRadians(90)
    expect(result).toBeCloseTo(Math.PI / 2)
  })

  it('polarToCartesian converts 0 degrees on unit circle', () => {
    const result = polarToCartesian(0, 0, 1, 0)
    expect(result.x).toBeCloseTo(1, 5)
    expect(result.y).toBeCloseTo(0, 5)
  })

  it('polarToCartesian converts 90 degrees on unit circle', () => {
    const result = polarToCartesian(0, 0, 1, 90)
    expect(result.x).toBeCloseTo(0, 5)
    expect(result.y).toBeCloseTo(1, 5)
  })

  it('arcPath generates path with largeArc=0 for small arcs', () => {
    const path = arcPath(100, 100, 80, 0, 50)
    // Path format: M x y A r r 0 largeArc 1 x y
    // For 50 degree arc, largeArc should be 0
    expect(path).toMatch(/A 80 80 0 0 1/)
  })

  it('arcPath generates path with largeArc=1 for large arcs (>180 degrees)', () => {
    const path = arcPath(100, 100, 80, 0, 270)
    // For 270 degree arc, largeArc should be 1
    expect(path).toMatch(/A 80 80 0 1 1/)
  })

  it('centsToAngle maps -50 cents to start angle', () => {
    const angle = centsToAngle(-50)
    expect(angle).toBe(220)
  })

  it('centsToAngle maps 0 cents to middle angle', () => {
    const angle = centsToAngle(0)
    expect(angle).toBe(270)
  })

  it('centsToAngle maps 50 cents to end angle', () => {
    const angle = centsToAngle(50)
    expect(angle).toBe(320)
  })
})
