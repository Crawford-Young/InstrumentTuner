import type { ComponentType } from 'react'

export const guideContent: Readonly<Record<string, () => Promise<{ default: ComponentType }>>> = {
  'how-to-tune-a-guitar-by-ear': () => import('@/content/guides/how-to-tune-a-guitar-by-ear.mdx'),
  'reading-a-chromatic-tuner': () => import('@/content/guides/reading-a-chromatic-tuner.mdx'),
  'standard-tuning-reference': () => import('@/content/guides/standard-tuning-reference.mdx'),
}
