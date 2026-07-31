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
