import { describe, it, expect, vi } from 'vitest'
import { scheduleClick } from '@/lib/audio/click'

function makeMockCtx() {
  const osc = { frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
  const gain = {
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }
  return {
    destination: {},
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    _osc: osc,
    _gain: gain,
  }
}

describe('scheduleClick', () => {
  it('accent click uses 1200Hz and gain 1.0', () => {
    const ctx = makeMockCtx()
    scheduleClick(ctx as unknown as AudioContext, 2, true)
    expect(ctx._osc.frequency.value).toBe(1200)
    expect(ctx._gain.gain.setValueAtTime).toHaveBeenCalledWith(1.0, 2)
    expect(ctx._osc.start).toHaveBeenCalledWith(2)
    expect(ctx._osc.stop).toHaveBeenCalledWith(2.05)
  })

  it('non-accent click uses 800Hz and gain 0.5', () => {
    const ctx = makeMockCtx()
    scheduleClick(ctx as unknown as AudioContext, 0, false)
    expect(ctx._osc.frequency.value).toBe(800)
    expect(ctx._gain.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0)
  })
})
