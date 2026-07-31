import type { ComponentType } from 'react'

export const guideContent: Readonly<Record<string, () => Promise<{ default: ComponentType }>>> = {
  'standard-tuning-reference': () => import('@/content/guides/standard-tuning-reference.mdx'),
}
