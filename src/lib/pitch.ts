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
