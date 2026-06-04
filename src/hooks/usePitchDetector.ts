'use client'

import { useMemo, useRef } from 'react'
import { findClosestNote, centDeviation, detectPitchYIN } from '@/lib/pitch'

const SAMPLE_RATE = 44100
const HISTORY_SIZE = 7
const JUMP_RESET_CENTS = 800  // ~8 semitones — new note, not tuning error

export interface PitchDetectorResult {
  readonly detectedFreq: number | null
  readonly closestNote: string | null
  readonly closestPitch: number | null
  readonly centsDeviation: (targetFreq: number) => number | null
}

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export function usePitchDetector(
  timeDomainData: Float32Array | null,
): PitchDetectorResult {
  const historyRef = useRef<(number | null)[]>([])

  return useMemo(() => {
    const empty: PitchDetectorResult = {
      detectedFreq: null,
      closestNote: null,
      closestPitch: null,
      centsDeviation: () => null,
    }

    if (!timeDomainData) {
      historyRef.current = []
      return empty
    }

    const rawFreq = detectPitchYIN(timeDomainData, SAMPLE_RATE)
    const history = historyRef.current

    if (rawFreq !== null) {
      const validHistory = history.filter((f): f is number => f !== null)
      if (validHistory.length > 0) {
        const jumpCents = Math.abs(1200 * Math.log2(rawFreq / getMedian(validHistory)))
        if (jumpCents > JUMP_RESET_CENTS) history.length = 0
      }
    }

    history.push(rawFreq)
    if (history.length > HISTORY_SIZE) history.shift()

    const valid = history.filter((f): f is number => f !== null)
    if (valid.length === 0) return empty

    const smoothedFreq = getMedian(valid)
    const { note, closestPitch } = findClosestNote(smoothedFreq)

    return {
      detectedFreq: smoothedFreq,
      closestNote: note,
      closestPitch,
      centsDeviation: (targetFreq: number) => centDeviation(smoothedFreq, targetFreq),
    }
  }, [timeDomainData])
}
