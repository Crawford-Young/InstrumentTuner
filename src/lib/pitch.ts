const YIN_THRESHOLD = 0.15
const RMS_THRESHOLD = 0.01
const ANALYSIS_SAMPLES = 4096  // ~93ms at 44100 Hz — ~7 periods of guitar E2
const MIN_PITCH_HZ = 65
const MAX_PITCH_HZ = 2000

export const CONCERT_PITCH = 440
export const ALL_NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] as const

export interface NoteResult {
  readonly note: string
  readonly closestPitch: number
}

export function findClosestNote(pitch: number): NoteResult {
  const i = Math.round(Math.log2(pitch / CONCERT_PITCH) * 12)
  const note = ALL_NOTES[((i % 12) + 12) % 12] + String(4 + Math.floor((i + 9) / 12))
  const closestPitch = CONCERT_PITCH * Math.pow(2, i / 12)
  return { note, closestPitch }
}

export function centDeviation(detectedFreq: number, targetFreq: number): number {
  return 1200 * Math.log2(detectedFreq / targetFreq)
}

export function detectPitchYIN(
  buffer: Float32Array,
  sampleRate: number,
  prevFreq: number | null = null,
): number | null {
  const minLag = Math.floor(sampleRate / MAX_PITCH_HZ)
  const maxLag = Math.floor(sampleRate / MIN_PITCH_HZ)

  if (buffer.length < ANALYSIS_SAMPLES + maxLag) return null

  // Silence gate
  let rms = 0
  for (let i = 0; i < ANALYSIS_SAMPLES; i++) rms += buffer[i] * buffer[i]
  if (Math.sqrt(rms / ANALYSIS_SAMPLES) < RMS_THRESHOLD) return null

  // Difference function + CMNDF in one pass.
  // DC signal → runningSum=0 → NaN CMNDF → NaN < threshold = false → exhausts loop → null.
  const cmndf = new Float32Array(maxLag + 1)
  cmndf[0] = 1
  let runningSum = 0

  for (let tau = 1; tau <= maxLag; tau++) {
    let diff = 0
    for (let i = 0; i < ANALYSIS_SAMPLES; i++) {
      const delta = buffer[i] - buffer[i + tau]
      diff += delta * delta
    }
    runningSum += diff
    cmndf[tau] = (diff * tau) / runningSum
  }

  // Collect ALL local minima below threshold.
  // For a periodic signal, integer multiples of the period also dip below threshold,
  // but with higher CMNDF values — so best-quality selection naturally finds the fundamental.
  const candidates: Array<{ refinedTau: number; val: number }> = []
  let t = minLag
  while (t < maxLag) {
    if (cmndf[t] < YIN_THRESHOLD) {
      while (t + 1 < maxLag && cmndf[t + 1] < cmndf[t]) t++
      const y1 = cmndf[t - 1]
      const y2 = cmndf[t]
      const y3 = cmndf[t + 1]
      const denom = 2 * (y1 - 2 * y2 + y3)
      /* v8 ignore next */
      const refined = denom !== 0 ? t + (y1 - y3) / denom : t
      if (refined >= minLag && refined <= maxLag) candidates.push({ refinedTau: refined, val: y2 })
      t++
    } else {
      t++
    }
  }

  if (candidates.length === 0) return null

  // Without a previous frequency: take the smallest-tau candidate (= fundamental, standard YIN).
  // CMNDF values at subharmonic taus can be numerically lower due to better integer-sample
  // alignment at n*T — quality-only scoring would wrongly prefer them.
  if (prevFreq === null) return sampleRate / candidates[0].refinedTau

  const fundamentalFreq = sampleRate / candidates[0].refinedTau
  const jumpCents = Math.abs(1200 * Math.log2(fundamentalFreq / prevFreq))

  // Large jump (> 1.25 octaves) means a new note, not harmonic ambiguity — skip continuity
  // scoring so the detector isn't stuck near the previous pitch.
  if (jumpCents > 1500) return fundamentalFreq

  // Within a reasonable interval: score by quality + continuity so the smoothing history
  // can hold the detector on a subharmonic when the previous frame established one.
  const best = candidates.reduce((a, b) => {
    const scoreA = scoreCandidateYIN(a.val, sampleRate / a.refinedTau, prevFreq)
    const scoreB = scoreCandidateYIN(b.val, sampleRate / b.refinedTau, prevFreq)
    return scoreB > scoreA ? b : a
  })

  return sampleRate / best.refinedTau
}

function scoreCandidateYIN(cmndfVal: number, freq: number, prevFreq: number): number {
  const quality = 1 - cmndfVal
  const continuity = Math.exp(-Math.abs(Math.log2(freq / prevFreq)) * 2)
  return quality * 0.6 + continuity * 0.4
}
