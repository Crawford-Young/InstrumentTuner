// src/__tests__/useTapTempo.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTapTempo } from '@/hooks/useTapTempo'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useTapTempo', () => {
  it('counts taps', () => {
    const { result } = renderHook(() => useTapTempo({ requiredTaps: 4, onComplete: vi.fn() }))
    expect(result.current.tapCount).toBe(0)
    act(() => { vi.setSystemTime(0); result.current.tap() })
    expect(result.current.tapCount).toBe(1)
  })

  it('fires onComplete with averaged bpm on final tap', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTapTempo({ requiredTaps: 4, onComplete }))
    act(() => {
      vi.setSystemTime(0); result.current.tap()
      vi.setSystemTime(500); result.current.tap()
      vi.setSystemTime(1000); result.current.tap()
      vi.setSystemTime(1500); result.current.tap()
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(120) // 500ms intervals -> 120 bpm
  })

  it('reset clears tap count', () => {
    const { result } = renderHook(() => useTapTempo({ requiredTaps: 4, onComplete: vi.fn() }))
    act(() => { vi.setSystemTime(0); result.current.tap() })
    act(() => result.current.reset())
    expect(result.current.tapCount).toBe(0)
  })
})
