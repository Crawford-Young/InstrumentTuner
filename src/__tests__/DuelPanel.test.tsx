import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuelPanel } from '@/components/duel/DuelPanel'

describe('DuelPanel', () => {
  it('starts at setup', () => {
    render(<DuelPanel />)
    expect(screen.getByRole('button', { name: /start match/i })).toBeInTheDocument()
  })

  it('flows setup -> p1 turn after starting a tap match', async () => {
    render(<DuelPanel />)
    await userEvent.click(screen.getByRole('button', { name: /start match/i }))
    expect(screen.getByText(/P1's turn/i)).toBeInTheDocument()
  })
})
