import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthBar } from '@/components/duel/HealthBar'
import { STARTING_HP } from '@/lib/duel/types'

describe('HealthBar', () => {
  it('renders player label and hp value', () => {
    render(<HealthBar label="P1" hp={STARTING_HP} maxHp={STARTING_HP} />)
    expect(screen.getByText('P1')).toBeInTheDocument()
    expect(screen.getByText(String(STARTING_HP))).toBeInTheDocument()
  })

  it('fill width is hp/maxHp percent', () => {
    render(<HealthBar label="P2" hp={80} maxHp={160} />)
    const fill = screen.getByTestId('health-fill')
    expect(fill).toHaveStyle({ width: '50%' })
  })

  it('clamps width at 0 for zero hp', () => {
    render(<HealthBar label="P1" hp={0} maxHp={160} />)
    expect(screen.getByTestId('health-fill')).toHaveStyle({ width: '0%' })
  })

  it('exposes accessible progressbar', () => {
    render(<HealthBar label="P1" hp={40} maxHp={160} />)
    const bar = screen.getByRole('progressbar', { name: /P1 health/i })
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemax', '160')
  })
})
