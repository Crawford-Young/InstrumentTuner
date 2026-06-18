import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultiplierBadge } from '@/components/duel/MultiplierBadge'

describe('MultiplierBadge', () => {
  it('renders x{multiplier}', () => {
    render(<MultiplierBadge multiplier={3} />)
    expect(screen.getByText('×3')).toBeInTheDocument()
  })

  it('is dimmed at x1 (no advantage yet)', () => {
    render(<MultiplierBadge multiplier={1} />)
    expect(screen.getByText('×1').className).toContain('text-muted-foreground')
  })

  it('is highlighted above x1', () => {
    render(<MultiplierBadge multiplier={2} />)
    expect(screen.getByText('×2').className).toContain('text-accent')
  })
})
