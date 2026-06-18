// src/__tests__/useTempoPlayback.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTempoPlayback } from '@/hooks/useTempoPlayback'

let mockCurrentTime = 0
function makeMockCtx() {
  return {
    get currentTime() { return mockCurrentTime },
    state: 'running' as AudioContextState,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => ({
      frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
  }
}
let mockCtx: ReturnType<typeof makeMockCtx>

beforeEach(() => {
  vi.useFakeTimers()
  mockCurrentTime = 0
  mockCtx = makeMockCtx()
  vi.stubGlobal('AudioContext', vi.fn().mockImplementation(function() { return mockCtx }))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useTempoPlayback', () => {
  it('play schedules `beats` clicks at the given bpm', () => {
    const { result } = renderHook(() => useTempoPlayback())
    act(() => result.current.play(120, 8))
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(8)
  })

  it('resumes a suspended context', () => {
    mockCtx.state = 'suspended' as AudioContextState
    const { result } = renderHook(() => useTempoPlayback())
    act(() => result.current.play(120, 4))
    expect(mockCtx.resume).toHaveBeenCalled()
  })

  it('reuses the AudioContext across plays', () => {
    const { result } = renderHook(() => useTempoPlayback())
    act(() => result.current.play(120, 4))
    const calls = (AudioContext as ReturnType<typeof vi.fn>).mock.calls.length
    act(() => result.current.play(100, 4))
    expect((AudioContext as ReturnType<typeof vi.fn>).mock.calls.length).toBe(calls)
  })
})
