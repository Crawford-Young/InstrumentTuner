import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuelTurn } from '@/components/duel/DuelTurn'

describe('DuelTurn', () => {
  it('shows privacy gate first, hides the challenge', () => {
    render(<DuelTurn player="P1" mode="tap" target={120} onSubmit={vi.fn()} />)
    expect(screen.getByText(/P1 's turn/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ready/i })).toBeInTheDocument()
    expect(screen.queryByText('120')).not.toBeInTheDocument()
  })

  it('tap mode: reveals target after Ready and shows it', async () => {
    render(<DuelTurn player="P1" mode="tap" target={132} onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /ready/i }))
    expect(screen.getByText('132')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tap/i })).toBeInTheDocument()
  })

  it('guess mode: after Ready shows listen + slider, not the target number', async () => {
    render(<DuelTurn player="P2" mode="guess" target={150} onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /ready/i }))
    expect(screen.getByRole('button', { name: /listen/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /your guess/i })).toBeInTheDocument()
    expect(screen.queryByText('150')).not.toBeInTheDocument()
  })

  it('guess mode: submit sends the slider value', async () => {
    const onSubmit = vi.fn()
    render(<DuelTurn player="P1" mode="guess" target={150} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /ready/i }))
    const slider = screen.getByRole('slider', { name: /your guess/i })
    fireEvent.change(slider, { target: { value: '128' } })
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith(128)
  })

  it('tap mode: injected tap hook drives submit on completion', async () => {
    const onSubmit = vi.fn()
    const fakeUseTapTempo = ({ onComplete }: { onComplete: (b: number) => void }) => ({
      tapCount: 0,
      tap: () => onComplete(118),
      reset: vi.fn(),
    })
    render(
      <DuelTurn
        player="P1"
        mode="tap"
        target={120}
        onSubmit={onSubmit}
        useTapTempoImpl={fakeUseTapTempo}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /ready/i }))
    await userEvent.click(screen.getByRole('button', { name: /tap/i }))
    expect(onSubmit).toHaveBeenCalledWith(118)
  })
})
