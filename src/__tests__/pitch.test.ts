import { describe, it, expect } from 'vitest'
import { findClosestNote, centDeviation, detectPitchYIN, CONCERT_PITCH, ALL_NOTES } from '@/lib/pitch'

const SAMPLE_RATE = 44100

function makeSine(freq: number, samples: number, amplitude = 0.8): Float32Array {
  const buf = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    buf[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE)
  }
  return buf
}

describe('findClosestNote', () => {
  it('identifies A4 at concert pitch', () => {
    const { note, closestPitch } = findClosestNote(440)
    expect(note).toBe('A4')
    expect(closestPitch).toBeCloseTo(440, 1)
  })

  it('identifies E2 (guitar low E)', () => {
    const { note } = findClosestNote(82.41)
    expect(note).toBe('E2')
  })

  it('identifies A2 (guitar A string)', () => {
    const { note } = findClosestNote(110.0)
    expect(note).toBe('A2')
  })

  it('identifies G4 (ukulele G string)', () => {
    const { note } = findClosestNote(392.0)
    expect(note).toBe('G4')
  })

  it('handles G#3 (accidental)', () => {
    const { note } = findClosestNote(207.65)
    expect(note).toBe('G#3')
  })

  it('handles C4 (middle C)', () => {
    const { note } = findClosestNote(261.63)
    expect(note).toBe('C4')
  })

  it('returns closestPitch as power of two relation to concert pitch', () => {
    const { closestPitch } = findClosestNote(440)
    expect(closestPitch).toBe(440)
  })

  it('uses positive modulo for note index (no negative array access)', () => {
    // Frequencies below A4 produce negative i values; modulo must stay positive
    const { note } = findClosestNote(55) // A1
    expect(note).toBe('A1')
  })
})

describe('centDeviation', () => {
  it('returns 0 when detected equals target', () => {
    expect(centDeviation(440, 440)).toBe(0)
  })

  it('returns ~100 cents for one semitone sharp', () => {
    // A# / Bb4 = 466.16 Hz, one semitone above A4
    expect(centDeviation(466.16, 440)).toBeCloseTo(100, 0)
  })

  it('returns ~-100 cents for one semitone flat', () => {
    expect(centDeviation(415.3, 440)).toBeCloseTo(-100, 0)
  })

  it('returns ~50 cents for quarter-tone sharp', () => {
    const quarterToneSharp = 440 * Math.pow(2, 50 / 1200)
    expect(centDeviation(quarterToneSharp, 440)).toBeCloseTo(50, 1)
  })

  it('returns negative cents when detected is below target', () => {
    expect(centDeviation(430, 440)).toBeLessThan(0)
  })
})

describe('constants', () => {
  it('CONCERT_PITCH is 440', () => {
    expect(CONCERT_PITCH).toBe(440)
  })

  it('ALL_NOTES has 12 entries', () => {
    expect(ALL_NOTES).toHaveLength(12)
  })

  it('ALL_NOTES starts with A', () => {
    expect(ALL_NOTES[0]).toBe('A')
  })
})

describe('detectPitchYIN', () => {
  it('returns null for silence (all zeros)', () => {
    expect(detectPitchYIN(new Float32Array(8192), SAMPLE_RATE)).toBeNull()
  })

  it('returns null when buffer too short', () => {
    expect(detectPitchYIN(new Float32Array(100).fill(0.5), SAMPLE_RATE)).toBeNull()
  })

  it('detects A4 (440 Hz)', () => {
    const freq = detectPitchYIN(makeSine(440, 8192), SAMPLE_RATE)
    expect(freq).not.toBeNull()
    expect(freq!).toBeCloseTo(440, 0)
  })

  it('detects E2 (82.41 Hz) — guitar low E, fundamental is often weakest harmonic', () => {
    const freq = detectPitchYIN(makeSine(82.41, 8192), SAMPLE_RATE)
    expect(freq).not.toBeNull()
    expect(freq!).toBeCloseTo(82.41, 0)
  })

  it('detects E4 (329.63 Hz) — guitar high E', () => {
    const freq = detectPitchYIN(makeSine(329.63, 8192), SAMPLE_RATE)
    expect(freq).not.toBeNull()
    expect(freq!).toBeCloseTo(329.63, 0)
  })

  it('detects Bb3 (233.08 Hz) — Bb trumpet written C', () => {
    const freq = detectPitchYIN(makeSine(233.08, 8192), SAMPLE_RATE)
    expect(freq).not.toBeNull()
    expect(freq!).toBeCloseTo(233.08, 0)
  })

  it('rejects 60 Hz mains hum (below MIN_PITCH_HZ = 65)', () => {
    expect(detectPitchYIN(makeSine(60, 8192), SAMPLE_RATE)).toBeNull()
  })

  it('returns null for constant non-zero signal (DC) — no periodicity', () => {
    expect(detectPitchYIN(new Float32Array(8192).fill(0.5), SAMPLE_RATE)).toBeNull()
  })

  it('returns null for quiet signal below RMS threshold', () => {
    expect(detectPitchYIN(makeSine(440, 8192, 0.005), SAMPLE_RATE)).toBeNull()
  })

  it('prevFreq=null gives same result as no prevFreq argument', () => {
    const buf = makeSine(440, 8192)
    const without = detectPitchYIN(buf, SAMPLE_RATE)
    const withNull = detectPitchYIN(buf, SAMPLE_RATE, null)
    expect(withNull).toBeCloseTo(without!, 1)
  })

  it('prevFreq=440 does not alter detection of clear A4 signal', () => {
    const freq = detectPitchYIN(makeSine(440, 8192), SAMPLE_RATE, 440)
    expect(freq).toBeCloseTo(440, 0)
  })

  it('prevFreq continuity prefers sub-harmonic when quality is similar', () => {
    // A4 sine has candidates at tau≈100 (440 Hz) and tau≈200 (220 Hz).
    // With prevFreq=220, continuity tips the score toward 220 Hz.
    const freq = detectPitchYIN(makeSine(440, 8192), SAMPLE_RATE, 220)
    expect(freq).toBeCloseTo(220, 0)
  })
})
