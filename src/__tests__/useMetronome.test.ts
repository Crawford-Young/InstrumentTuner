import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMetronome } from '@/hooks/useMetronome'

let mockCurrentTime = 0

interface MockCtx {
  currentTime: number
  state: AudioContextState
  destination: object
  resume: ReturnType<typeof vi.fn>
  createOscillator: ReturnType<typeof vi.fn>
  createGain: ReturnType<typeof vi.fn>
}

function makeMockCtx(): MockCtx {
  return {
    get currentTime() { return mockCurrentTime },
    state: 'running' as AudioContextState,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => ({
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
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

describe('useMetronome', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useMetronome())
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.bpm).toBe(120)
    expect(result.current.beatsPerMeasure).toBe(4)
    expect(result.current.currentBeat).toBe(0)
  })

  it('setBpm clamps to [40, 240]', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.setBpm(10) })
    expect(result.current.bpm).toBe(40)
    act(() => { result.current.setBpm(999) })
    expect(result.current.bpm).toBe(240)
  })

  it('setBpm rounds to integer', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.setBpm(132.7) })
    expect(result.current.bpm).toBe(133)
  })

  it('setBpm accepts valid value', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.setBpm(90) })
    expect(result.current.bpm).toBe(90)
  })

  it('setBeatsPerMeasure updates state', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.setBeatsPerMeasure(3) })
    expect(result.current.beatsPerMeasure).toBe(3)
  })

  it('start sets isPlaying true and creates AudioContext', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    expect(result.current.isPlaying).toBe(true)
    expect(AudioContext).toHaveBeenCalled()
  })

  it('start schedules at least one click immediately', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    expect(mockCtx.createOscillator).toHaveBeenCalled()
    expect(mockCtx.createGain).toHaveBeenCalled()
  })

  it('start resumes suspended AudioContext', () => {
    mockCtx.state = 'suspended' as AudioContextState
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    expect(mockCtx.resume).toHaveBeenCalled()
  })

  it('stop sets isPlaying false and resets currentBeat', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentBeat).toBe(0)
  })

  it('stop before start does not throw', () => {
    const { result } = renderHook(() => useMetronome())
    expect(() => { act(() => { result.current.stop() }) }).not.toThrow()
  })

  it('stop clears the scheduler timeout', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('scheduler reschedules itself after lookahead interval', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    const callsBefore = mockCtx.createOscillator.mock.calls.length
    mockCurrentTime = 0.45
    act(() => { vi.advanceTimersByTime(25) })
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThan(callsBefore)
  })

  it('tapTempo with single tap does not change bpm', () => {
    const { result } = renderHook(() => useMetronome())
    const initialBpm = result.current.bpm
    act(() => {
      vi.setSystemTime(1000)
      result.current.tapTempo()
    })
    expect(result.current.bpm).toBe(initialBpm)
  })

  it('tapTempo two taps 500ms apart → 120 bpm', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => {
      vi.setSystemTime(0)
      result.current.tapTempo()
      vi.setSystemTime(500)
      result.current.tapTempo()
    })
    expect(result.current.bpm).toBe(120)
  })

  it('tapTempo two taps 1000ms apart → 60 bpm', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => {
      vi.setSystemTime(0)
      result.current.tapTempo()
      vi.setSystemTime(1000)
      result.current.tapTempo()
    })
    expect(result.current.bpm).toBe(60)
  })

  it('tapTempo averages multiple intervals', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => {
      vi.setSystemTime(0)
      result.current.tapTempo()
      vi.setSystemTime(600)
      result.current.tapTempo()
      vi.setSystemTime(1200)
      result.current.tapTempo()
    })
    expect(result.current.bpm).toBe(100)
  })

  it('tapTempo clears taps older than 2 seconds', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => {
      vi.setSystemTime(0)
      result.current.tapTempo()
    })
    act(() => {
      vi.setSystemTime(3000)
      result.current.tapTempo()
    })
    // First tap was 3000ms ago (stale), so only 1 recent tap → no bpm change
    expect(result.current.bpm).toBe(120)
  })

  it('start reuses existing AudioContext on second call', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => { result.current.start() })
    const callCount = (AudioContext as ReturnType<typeof vi.fn>).mock.calls.length
    act(() => { result.current.start() })
    expect((AudioContext as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount)
  })

  it('tapTempo discards oldest tap when history exceeds MAX_TAP_COUNT', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => {
      for (let i = 0; i < 7; i++) {
        vi.setSystemTime(i * 300)
        result.current.tapTempo()
      }
    })
    expect(result.current.bpm).toBe(200)
  })

  it('tapTempo caps history at MAX_TAP_COUNT entries', () => {
    const { result } = renderHook(() => useMetronome())
    act(() => {
      for (let i = 0; i < 8; i++) {
        vi.setSystemTime(i * 500)
        result.current.tapTempo()
      }
    })
    expect(result.current.bpm).toBe(120)
  })
})
