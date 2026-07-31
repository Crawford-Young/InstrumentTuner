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
]

export function guidePath(slug: string): string {
  return `/guides/${slug}`
}
