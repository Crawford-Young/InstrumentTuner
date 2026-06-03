import { describe, it, expect } from 'vitest'
import { findClosestNote, centDeviation, CONCERT_PITCH, ALL_NOTES } from '@/lib/pitch'

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
