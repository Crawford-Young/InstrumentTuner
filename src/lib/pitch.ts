const YIN_THRESHOLD = 0.15
const RMS_THRESHOLD = 0.01
const ANALYSIS_SAMPLES = 4096  // ~93ms at 44100 Hz — ~7 periods of guitar E2
const MIN_PITCH_HZ = 65
const MAX_PITCH_HZ = 2000

// Hann window precomputed once — weights central samples, reduces edge artifacts
const HANN_WINDOW = Float32Array.from(
  { length: ANALYSIS_SAMPLES },
  (_, i) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (ANALYSIS_SAMPLES - 1))),
)

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

export function detectPitchYIN(buffer: Float32Array, sampleRate: number): number | null {
  const minLag = Math.floor(sampleRate / MAX_PITCH_HZ)
  const maxLag = Math.floor(sampleRate / MIN_PITCH_HZ)

  if (buffer.length < ANALYSIS_SAMPLES + maxLag) return null

  // Silence gate
  let rms = 0
  for (let i = 0; i < ANALYSIS_SAMPLES; i++) rms += buffer[i] * buffer[i]
  if (Math.sqrt(rms / ANALYSIS_SAMPLES) < RMS_THRESHOLD) return null

  // Difference function + CMNDF in one pass.
  // Constant (DC) signal → runningSum stays 0 → NaN CMNDF → no threshold dip → returns null below.
  const cmndf = new Float32Array(maxLag + 1)
  cmndf[0] = 1
  let runningSum = 0

  for (let tau = 1; tau <= maxLag; tau++) {
    let diff = 0
    for (let i = 0; i < ANALYSIS_SAMPLES; i++) {
      const delta = buffer[i] - buffer[i + tau]
      diff += HANN_WINDOW[i] * delta * delta
    }
    runningSum += diff
    cmndf[tau] = (diff * tau) / runningSum  // NaN when runningSum=0 (DC) — handled below
  }

  // Absolute threshold — first dip below threshold, slide to local minimum.
  // NaN < threshold is always false, so DC / unpitched signals exhaust the loop.
  let tau = minLag
  while (tau < maxLag) {
    if (cmndf[tau] < YIN_THRESHOLD) {
      while (tau + 1 < maxLag && cmndf[tau + 1] < cmndf[tau]) tau++
      break
    }
    tau++
  }
  if (tau >= maxLag) return null

  // Parabolic interpolation for sub-sample accuracy.
  // tau is always in [minLag, maxLag-1] here so neighbours are valid array indices.
  const y1 = cmndf[tau - 1]
  const y2 = cmndf[tau]
  const y3 = cmndf[tau + 1]
  const denom = 2 * (y1 - 2 * y2 + y3)
  /* v8 ignore next */
  const refined = denom !== 0 ? tau + (y1 - y3) / denom : tau

  if (refined < minLag || refined > maxLag) return null
  return sampleRate / refined
}
