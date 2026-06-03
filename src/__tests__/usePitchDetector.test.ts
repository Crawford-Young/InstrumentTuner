import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePitchDetector } from '@/hooks/usePitchDetector'

const SAMPLE_RATE = 44100
const FFT_SIZE = 32768
const BIN_WIDTH = SAMPLE_RATE / FFT_SIZE // ~1.346 Hz per bin

function makeFftData(peakFreqHz: number): Float32Array {
  const data = new Float32Array(FFT_SIZE / 2).fill(-100)
  const peakBin = Math.round(peakFreqHz / BIN_WIDTH)
  data[peakBin] = -10 // strong signal at this bin
  return data
}

describe('usePitchDetector', () => {
  it('returns null values when frequencyData is null', () => {
    const { result } = renderHook(() => usePitchDetector(null))
    expect(result.current.detectedFreq).toBeNull()
    expect(result.current.closestNote).toBeNull()
    expect(result.current.closestPitch).toBeNull()
    expect(result.current.centsDeviation(440)).toBeNull()
  })

  it('returns null values when all bins are silent (-100 dB)', () => {
    const silent = new Float32Array(16384).fill(-100)
    const { result } = renderHook(() => usePitchDetector(silent))
    expect(result.current.detectedFreq).toBeNull()
  })

  it('detects A4 (440 Hz) from synthetic FFT data', () => {
    const data = makeFftData(440)
    const { result } = renderHook(() => usePitchDetector(data))
    expect(result.current.closestNote).toBe('A4')
    expect(result.current.detectedFreq).toBeCloseTo(440, 0)
  })

  it('detects E2 (82.41 Hz) from synthetic FFT data', () => {
    const data = makeFftData(82.41)
    const { result } = renderHook(() => usePitchDetector(data))
    expect(result.current.closestNote).toBe('E2')
  })

  it('suppresses mains hum — bins below 62 Hz ignored', () => {
    const data = new Float32Array(16384).fill(-100)
    // Place a very strong signal at ~50 Hz (mains hum range)
    const humBin = Math.round(50 / BIN_WIDTH)
    data[humBin] = 0 // max signal
    // Also place a weaker but above-threshold signal at A4
    const a4Bin = Math.round(440 / BIN_WIDTH)
    data[a4Bin] = -10
    const { result } = renderHook(() => usePitchDetector(data))
    // Hum suppressed, should detect A4 not ~50 Hz
    expect(result.current.closestNote).toBe('A4')
  })

  it('returns centsDeviation function that calculates correctly', () => {
    const data = makeFftData(440)
    const { result } = renderHook(() => usePitchDetector(data))
    const cents = result.current.centsDeviation(440)
    expect(cents).toBeCloseTo(0, 0)
  })

  it('centsDeviation returns negative cents when detected is flat', () => {
    const data = makeFftData(430)
    const { result } = renderHook(() => usePitchDetector(data))
    const cents = result.current.centsDeviation(440)
    expect(cents).toBeLessThan(0)
  })

  it('centsDeviation returns positive cents when detected is sharp', () => {
    const data = makeFftData(450)
    const { result } = renderHook(() => usePitchDetector(data))
    const cents = result.current.centsDeviation(440)
    expect(cents).toBeGreaterThan(0)
  })

  it('returns null when peak is at bin 0 (detectedFreq would be <= 0)', () => {
    const data = new Float32Array(16384).fill(-100)
    // Place signal at bin 0 — this is a physical impossibility in real audio
    // but we test the guard anyway for completeness
    data[0] = -10
    const { result } = renderHook(() => usePitchDetector(data))
    expect(result.current.detectedFreq).toBeNull()
    expect(result.current.closestNote).toBeNull()
  })

  it('includes closestPitch in result', () => {
    const data = makeFftData(440)
    const { result } = renderHook(() => usePitchDetector(data))
    expect(result.current.closestPitch).toBeCloseTo(440, 1)
  })
})
