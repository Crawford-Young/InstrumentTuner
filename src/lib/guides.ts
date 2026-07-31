import { z } from 'zod'

export const GuideMetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(10),
  category: z.enum(['tuning', 'rhythm']),
  order: z.number().int().positive(),
})

export type GuideMeta = z.infer<typeof GuideMetaSchema>

export const GUIDES: readonly GuideMeta[] = [
  {
    slug: 'how-to-tune-a-guitar-by-ear',
    title: 'How to Tune a Guitar by Ear',
    description:
      'Tune a guitar without a tuner using the 5th-fret method, harmonics, and beats — and verify the result with a chromatic tuner.',
    category: 'tuning',
    order: 1,
  },
  {
    slug: 'reading-a-chromatic-tuner',
    title: 'Reading a Chromatic Tuner: What Cents Mean',
    description:
      'What a cent is, why the needle is not a Hz readout, and how to use the ±5-cent "Tuned" band to get in tune faster.',
    category: 'tuning',
    order: 2,
  },
  {
    slug: 'standard-tuning-reference',
    title: 'Standard Tuning Reference',
    description:
      'Standard tuning notes and frequencies for guitar, ukulele, and Bb trumpet, and how to use them with a chromatic tuner.',
    category: 'tuning',
    order: 3,
  },
  {
    slug: 'drop-d-tuning',
    title: 'Drop D Tuning: How and Why',
    description:
      'How to get into Drop D with a chromatic tuner — only the low E moves, from E2 down to D2 — and what the tuning is for.',
    category: 'tuning',
    order: 4,
  },
  {
    slug: 'dadgad-tuning',
    title: 'DADGAD Tuning: The Dsus4 Wash',
    description:
      'How to tune to DADGAD with a chromatic tuner — three strings down a whole step — and why Celtic and fingerstyle players love it.',
    category: 'tuning',
    order: 5,
  },
  {
    slug: 'open-g-and-open-d-tuning',
    title: 'Open G and Open D Tuning',
    description:
      'How to tune to Open G (DGDGBD) and Open D (DADF#AD) with a chromatic tuner, and what slide and blues players do with them.',
    category: 'tuning',
    order: 6,
  },
  {
    slug: 'metronome-basics',
    title: 'Metronome Basics: BPM, Time Signatures, and Tap Tempo',
    description:
      'What BPM measures, how time signatures work, and how to practice with a metronome — including tap tempo and slow practice.',
    category: 'rhythm',
    order: 7,
  },
  {
    slug: 'metronome-duel-guide',
    title: 'Metronome Duel: Rules and Strategy',
    description:
      'How Metronome Duel works — tap and guess modes, the scoring and multiplier system — plus strategy for winning matches.',
    category: 'rhythm',
    order: 8,
  },
]

export function guidePath(slug: string): string {
  return `/guides/${slug}`
}
