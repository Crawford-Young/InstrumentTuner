import { describe, it, expect } from 'vitest'
import { INSTRUMENTS, detectClosestString } from '@/lib/instruments'

describe('INSTRUMENTS config', () => {
  it('includes Guitar and Ukulele', () => {
    const ids = INSTRUMENTS.map((i) => i.id)
    expect(ids).toContain('guitar')
    expect(ids).toContain('ukulele')
  })

  it('Guitar has 6 strings', () => {
    const guitar = INSTRUMENTS.find((i) => i.id === 'guitar')!
    expect(guitar.strings).toHaveLength(6)
  })

  it('Ukulele has 4 strings', () => {
    const uke = INSTRUMENTS.find((i) => i.id === 'ukulele')!
    expect(uke.strings).toHaveLength(4)
  })

  it('all strings have positive frequency', () => {
    for (const instrument of INSTRUMENTS) {
      for (const string of instrument.strings) {
        expect(string.frequency).toBeGreaterThan(0)
      }
    }
  })

  it('all strings have non-empty names', () => {
    for (const instrument of INSTRUMENTS) {
      for (const string of instrument.strings) {
        expect(string.name.length).toBeGreaterThan(0)
      }
    }
  })

  it('Guitar E2 string is 82.41 Hz', () => {
    const guitar = INSTRUMENTS.find((i) => i.id === 'guitar')!
    expect(guitar.strings[0]).toEqual({ name: 'E2', frequency: 82.41 })
  })

  it('Ukulele A4 string is 440.0 Hz', () => {
    const uke = INSTRUMENTS.find((i) => i.id === 'ukulele')!
    const a4 = uke.strings.find((s) => s.name === 'A4')
    expect(a4?.frequency).toBe(440.0)
  })
})

describe('detectClosestString', () => {
  const guitar = INSTRUMENTS.find((i) => i.id === 'guitar')!
  const uke = INSTRUMENTS.find((i) => i.id === 'ukulele')!

  it('detects Guitar E2 at 82.41 Hz', () => {
    expect(detectClosestString(82.41, guitar).name).toBe('E2')
  })

  it('detects Guitar A2 at 110 Hz', () => {
    expect(detectClosestString(110.0, guitar).name).toBe('A2')
  })

  it('detects Guitar E4 (high E) at 329.63 Hz', () => {
    expect(detectClosestString(329.63, guitar).name).toBe('E4')
  })

  it('detects Ukulele G4 at 392 Hz', () => {
    expect(detectClosestString(392.0, uke).name).toBe('G4')
  })

  it('detects closest when slightly off frequency', () => {
    expect(detectClosestString(85, guitar).name).toBe('E2')
  })

  it('picks lower string when equidistant', () => {
    // Midpoint between E2 (82.41) and A2 (110): ~96.2 Hz — closer to E2
    expect(detectClosestString(90, guitar).name).toBe('E2')
  })
})
