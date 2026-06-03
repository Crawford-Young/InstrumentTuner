'use client'

import { useMemo } from 'react'
import { findClosestNote, centDeviation } from '@/lib/pitch'

const SAMPLE_RATE = 44100
const FFT_SIZE = 32768
const MAINS_HUM_CUTOFF_HZ = 62
const SILENCE_THRESHOLD_DB = -90

export interface PitchDetectorResult {
  readonly detectedFreq: number | null
  readonly closestNote: string | null
  readonly closestPitch: number | null
  readonly centsDeviation: (targetFreq: number) => number | null
}

export function usePitchDetector(
  frequencyData: Float32Array | null,
): PitchDetectorResult {
  return useMemo(() => {
    const empty: PitchDetectorResult = {
      detectedFreq: null,
      closestNote: null,
      closestPitch: null,
      centsDeviation: () => null,
    }

    if (!frequencyData) return empty

    const suppressBins = Math.floor(MAINS_HUM_CUTOFF_HZ / (SAMPLE_RATE / FFT_SIZE))
    let maxVal = -Infinity
    let maxIdx = 0

    for (let i = suppressBins; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxVal) {
        maxVal = frequencyData[i]
        maxIdx = i
      }
    }

    if (maxVal < SILENCE_THRESHOLD_DB) return empty

    const detectedFreq = maxIdx * (SAMPLE_RATE / FFT_SIZE)

    const { note, closestPitch } = findClosestNote(detectedFreq)

    return {
      detectedFreq,
      closestNote: note,
      closestPitch,
      centsDeviation: (targetFreq: number) => centDeviation(detectedFreq, targetFreq),
    }
  }, [frequencyData])
}
