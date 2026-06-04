import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePitchDetector } from '@/hooks/usePitchDetector'

const SAMPLE_RATE = 44100

function makeSine(freq: number, samples: number, amplitude = 0.8): Float32Array {
  const buf = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    buf[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE)
  }
  return buf
}

describe('usePitchDetector', () => {
  it('returns null values when timeDomainData is null', () => {
    const { result } = renderHook(() => usePitchDetector(null))
    expect(result.current.detectedFreq).toBeNull()
    expect(result.current.closestNote).toBeNull()
    expect(result.current.closestPitch).toBeNull()
    expect(result.current.centsDeviation(440)).toBeNull()
  })

  it('returns null values for silence (all zeros)', () => {
    const silent = new Float32Array(8192)
    const { result } = renderHook(() => usePitchDetector(silent))
    expect(result.current.detectedFreq).toBeNull()
    expect(result.current.closestNote).toBeNull()
  })

  it('returns null for buffer too short to analyse', () => {
    const { result } = renderHook(() => usePitchDetector(new Float32Array(200).fill(0.5)))
    expect(result.current.detectedFreq).toBeNull()
  })

  it('detects A4 (440 Hz)', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(440, 8192)))
    expect(result.current.closestNote).toBe('A4')
    expect(result.current.detectedFreq).toBeCloseTo(440, 0)
  })

  it('detects E2 (82.41 Hz) — guitar low E', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(82.41, 8192)))
    expect(result.current.closestNote).toBe('E2')
  })

  it('detects E4 (329.63 Hz) — guitar high E', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(329.63, 8192)))
    expect(result.current.closestNote).toBe('E4')
  })

  it('detects Bb3 (233.08 Hz) — Bb trumpet written C', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(233.08, 8192)))
    expect(result.current.closestNote).toBe('A#3')
  })

  it('centsDeviation returns ~0 when detected matches target', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(440, 8192)))
    expect(result.current.centsDeviation(440)).toBeCloseTo(0, 0)
  })

  it('centsDeviation returns negative when detected is flat', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(430, 8192)))
    expect(result.current.centsDeviation(440)).toBeLessThan(0)
  })

  it('centsDeviation returns positive when detected is sharp', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(450, 8192)))
    expect(result.current.centsDeviation(440)).toBeGreaterThan(0)
  })

  it('includes closestPitch in result', () => {
    const { result } = renderHook(() => usePitchDetector(makeSine(440, 8192)))
    expect(result.current.closestPitch).toBeCloseTo(440, 1)
  })

  it('accumulates history and stays on same note across frames, evicting oldest beyond HISTORY_SIZE', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: Float32Array }) => usePitchDetector(data),
      { initialProps: { data: makeSine(440, 8192) } },
    )
    // 9 renders — exceeds HISTORY_SIZE=7, exercises the shift() eviction path
    for (let i = 0; i < 8; i++) rerender({ data: makeSine(440, 8192) })
    expect(result.current.closestNote).toBe('A4')
  })

  it('resets history on large pitch jump — responds immediately to new note', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: Float32Array }) => usePitchDetector(data),
      { initialProps: { data: makeSine(82.41, 8192) } },
    )
    expect(result.current.closestNote).toBe('E2')
    rerender({ data: makeSine(440, 8192) })
    expect(result.current.closestNote).toBe('A4')
  })
})
