export interface StringTuning {
  readonly name: string
  readonly frequency: number
}

export interface Instrument {
  readonly id: string
  readonly name: string
  readonly strings: readonly StringTuning[]
}

export const INSTRUMENTS: readonly Instrument[] = [
  {
    id: 'guitar',
    name: 'Guitar',
    strings: [
      { name: 'E2', frequency: 82.41 },
      { name: 'A2', frequency: 110.0 },
      { name: 'D3', frequency: 146.83 },
      { name: 'G3', frequency: 196.0 },
      { name: 'B3', frequency: 246.94 },
      { name: 'E4', frequency: 329.63 },
    ],
  },
  {
    id: 'ukulele',
    name: 'Ukulele',
    strings: [
      { name: 'G4', frequency: 392.0 },
      { name: 'C4', frequency: 261.63 },
      { name: 'E4', frequency: 329.63 },
      { name: 'A4', frequency: 440.0 },
    ],
  },
  {
    id: 'bb-trumpet',
    name: 'Bb Trumpet',
    // Written note names; frequencies are concert pitch (written pitch down a major 2nd)
    strings: [
      { name: 'C4', frequency: 233.08 },
      { name: 'D4', frequency: 261.63 },
      { name: 'E4', frequency: 293.66 },
      { name: 'F4', frequency: 311.13 },
      { name: 'G4', frequency: 349.23 },
      { name: 'A4', frequency: 392.0 },
      { name: 'B4', frequency: 440.0 },
      { name: 'C5', frequency: 466.16 },
    ],
  },
]

export function detectClosestString(
  frequency: number,
  instrument: Instrument,
): StringTuning {
  return instrument.strings.reduce((closest, string) =>
    Math.abs(string.frequency - frequency) < Math.abs(closest.frequency - frequency)
      ? string
      : closest,
  )
}
